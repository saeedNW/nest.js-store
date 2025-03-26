import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Brackets, Repository, SelectQueryBuilder } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { I18nContext, I18nService } from "nestjs-i18n";
import { AuthService } from "src/modules/auth/auth.service";
import { TokenService } from "src/modules/auth/token.service";
import { RedisService } from "src/modules/redis/redis.service";
import { Request, Response } from "express";
import { UpdatePasswordDto, UpdateUserPasswordDto } from "../dto/update-password.dto";
import { compareSync, genSaltSync, hashSync } from "bcrypt";
import { UpdatePhoneDto } from "../dto/update-phone.dto";
import { fixDataNumbers } from "src/common/utils/number.utility";
import { TOtpObject } from "src/modules/auth/types/otp.type";
import { OtpMethods } from "src/common/enums/otp-methods.enum";
import { paginate, PaginatedResult, PaginationDto } from "src/common/utils/typeorm.pagination.utility";
import { FindUsersDto } from "../dto/find-user.dto";
import { deleteInvalidPropertyInObject } from "src/common/utils/functions.utils";
import { escapeAndTrim } from "src/common/utils/sanitizer.utility";
import { RoleService } from "src/modules/role/role.service";

@Injectable({ scope: Scope.REQUEST })
export class UserService {
	constructor(
		// inject user repository
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		// Make the current request accessible in service
		@Inject(REQUEST) private request: Request,
		// Register i18n service
		private readonly i18n: I18nService,
		// Register auth service
		private authService: AuthService,
		// Register token service
		private tokenService: TokenService,
		// Register redis service
		private redis: RedisService,
		// Register role service
		private roleService: RoleService
	) { }

	/**
	 * Retrieve the authenticated user's data.
	 */
	async retrieveUser() {
		// Retrieve user data from request exclude password and token
		const { password, token, ...sanitizedUser } = this.getRequestUser();
		return sanitizedUser;
	}

	/**
	 * Update user password
	 * @param {UpdatePasswordDto} updatePasswordDto - Data for updating password.
	 */
	async updatePassword({ currentPassword, newPassword }: UpdatePasswordDto) {
		// Retrieve user data from request
		let user = this.getRequestUser()

		// Validate current password if user already has a password
		if (user.password) {
			this.validateCurrentPassword(user.password, currentPassword);
		}

		// Update user password
		await this.userRepository.update(user.id, { password: this.hashPassword(newPassword) });

		return this.i18n.t('locale.PublicMessages.SuccessUpdate', {
			lang: I18nContext?.current()?.lang
		})
	}

	/**
	 * Update user's phone number
	 * @param {UpdatePhoneDto} updatePhoneDto - Client data for new phone
	 * @param {Response} response - Response Object
	 */
	async updatePhone(updatePhoneDto: UpdatePhoneDto, response: Response) {
		// extract phone number from client data
		const { phone } = fixDataNumbers(updatePhoneDto);
		// Retrieve user data from request
		let user = this.getRequestUser()

		// Validate phone number uniqueness
		await this.ensurePhoneIsUnique(user.id, phone);
		// set user new phone value
		await this.userRepository.update(user.id, { new_phone: phone });

		// Generates a new OTP
		const otp: TOtpObject = await this.authService.saveOtp(user.id, OtpMethods.UPDATE_PHONE);
		// Generate JWT token for phone verification
		const token: string = this.tokenService.createPhoneToken({ phone });

		// Set verification token in client's cookies
		response.cookie("phone", token, {
			httpOnly: true,
			signed: true,
			expires: new Date(Date.now() + 120000), // 2 Mins
		});

		// Return the OTP code
		return otp.code;
	}

	/**
	 * Update phone verification
	 * @param {string} code - Client's OTP code
	 */
	async verifyPhone(code: string) {
		// Retrieve user data from request
		let { id: userId, new_phone } = this.getRequestUser()

		// Retrieve phone number saved in JWT token
		const phone = this.validatePhoneToken();

		// validate the new phone
		if (phone !== new_phone) {
			throw new BadRequestException(this.i18n.t('locale.BadRequestMessages.InvalidPhoneToken', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Verify client's OTP code
		this.verifyOtp(userId, code);

		// Update user data
		await this.userRepository.update(userId, {
			phone,
			verify_phone: true,
			new_phone: () => "NULL"
		});

		return this.i18n.t('locale.PublicMessages.SuccessUpdate', {
			lang: I18nContext?.current()?.lang
		})
	}

	/**
	 * Retrieves a paginated list of users based on search criteria
	 * @param {PaginationDto} paginationDto - Pagination details
	 * @param {FindUsersDto} findUserDto - Search filters for users
	 * @returns {Promise<PaginatedResult<UserEntity>>} - A paginated list of users
	 */
	async findAll(paginationDto: PaginationDto, findUserDto: FindUsersDto): Promise<PaginatedResult<UserEntity>> {
		// Sanitize client data
		deleteInvalidPropertyInObject(findUserDto);
		escapeAndTrim(findUserDto);

		// Create the base query builder
		const queryBuilder = this.buildUserQuery(findUserDto);

		// Paginate the results
		const users = await paginate(
			paginationDto,
			this.userRepository,
			queryBuilder,
			`${process.env.SERVER}/user/list`
		);

		users.items.map(item => {
			delete item.password;
			delete item.token;
		})

		return users
	}

	/**
	 * Retrieve user's data by ID
	 * @param {number} id - User's ID
	 * @returns {Promise<UserEntity>} - Return user's data
	 */
	async findOne(id: number): Promise<UserEntity> {
		// Retrieve user data
		const user = await this.userRepository.findOne({ where: { id }, relations: ["profile"] });

		// Throw error if account not found
		if (!user) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.AccountNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return user;
	}

	/**
	 * Updates the user's password
	 * @param {number} id - User's ID
	 * @param {UpdateUserPasswordDto} updatePasswordDto - An object containing the new password
	 * @param {string} updatePasswordDto.newPassword - The new password to set for the user
	 */
	async updateUserPassword(id: number, { newPassword }: UpdateUserPasswordDto) {
		// validate user existence
		await this.findOne(id);

		// Update user password
		await this.userRepository.update(id, { password: this.hashPassword(newPassword) });

		return this.i18n.t('locale.PublicMessages.SuccessUpdate', {
			lang: I18nContext?.current()?.lang
		})
	}

	/**
	 * Update user's phone number
	 * @param {number} id - User's ID
	 * @param {UpdatePhoneDto} updatePhoneDto - Client data for new phone
	 */
	async updateUserPhone(id: number, updatePhoneDto: UpdatePhoneDto) {
		// Validate user's existence
		let user = await this.findOne(id);
		// extract phone number from client data
		const { phone } = fixDataNumbers(updatePhoneDto);

		// Validate phone number uniqueness
		await this.ensurePhoneIsUnique(user.id, phone);
		// set user new phone value
		await this.userRepository.update(user.id, { phone });

		return this.i18n.t('locale.PublicMessages.SuccessUpdate', {
			lang: I18nContext?.current()?.lang
		})
	}

	async assignRole(id: number, roleTitle: string) {
		// Retrieve user data
		const user = await this.findOne(id)

		// Retrieve role data
		const role = await this.roleService.findOneByTitle(roleTitle);

		// Assign role to user
		user.role = role;
		await this.userRepository.save(user);

		return this.i18n.t('locale.PublicMessages.SuccessUpdate', {
			lang: I18nContext?.current()?.lang
		})
	}

	/**
	 * Builds the query for retrieving users based on filters
	 * @param {FindUsersDto} filters - The filters for searching users
	 * @returns {SelectQueryBuilder<UserEntity>} - The built query
	 */
	private buildUserQuery(filters: FindUsersDto): SelectQueryBuilder<UserEntity> {
		const queryBuilder = this.userRepository
			.createQueryBuilder("user")
			.leftJoinAndSelect("user.profile", "profile");

		// Apply search filter if provided
		if (filters.search) {
			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where("user.phone ILIKE :search", { search: `%${filters.search}%` })
						.orWhere("profile.first_name ILIKE :search", { search: `%${filters.search}%` })
						.orWhere("profile.last_name ILIKE :search", { search: `%${filters.search}%` });
				})
			);
		}

		return queryBuilder;
	}

	/**
	 * Retrieve user's data saved in request
	 * @returns {UserEntity} - User data saved in request
	 */
	private getRequestUser(): UserEntity {
		// Retrieve user data from request
		let user = this.request.user;

		// Throw error if account not found
		if (!user) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.AccountNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return user;
	}

	/**
	 * Validates the provided current password against the stored password
	 * @param {string} storedPassword - The hashed password stored in the database
	 * @param {string} [currentPassword] - The user-provided password to validate
	 */
	private validateCurrentPassword(storedPassword: string, currentPassword?: string) {
		if (!currentPassword || currentPassword.length <= 0 || !compareSync(currentPassword, storedPassword)) {
			throw new BadRequestException(this.i18n.t('locale.BadRequestMessages.InvalidPassword', {
				lang: I18nContext?.current()?.lang
			}));
		}
	}

	/**
	 * hash user's chosen password
	 * @param {string} password - user's password
	 * @returns {string} - Hashed password
	 */
	private hashPassword(password: string): string {
		return hashSync(password, genSaltSync(10));
	}

	/**
	 * Ensures that the given phone number is unique across users
	 * @param {number} userId - The ID of the current user
	 * @param {string} phone - The phone number to be checked for uniqueness
	 */
	private async ensurePhoneIsUnique(userId: number, phone: string) {
		const userExistence = await this.userRepository.findOneBy({ phone });
		if (userExistence && userExistence.id !== userId) {
			throw new ConflictException(this.i18n.t('locale.ConflictMessages.ConflictPhone', {
				lang: I18nContext?.current()?.lang
			}));
		}
	}

	/**
	 * Verify update phone JWT token
	 * @returns {string} - Phone number saved in JWT token
	 */
	private validatePhoneToken(): string {
		// extract verification token from client's cookies
		const token = this.request.signedCookies?.["phone"];

		// throw error if the token was not found
		if (!token) {
			throw new BadRequestException(this.i18n.t('locale.BadRequestMessages.InvalidPhoneToken', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// verify update phone token
		return this.tokenService.verifyPhoneToken(token).phone;
	}

	/**
	 * Verify client's update phone OTP code
	 * @param {number} userId - Client's ID
	 * @param {string} code - Client's OTP code
	 */
	private async verifyOtp(userId: number, code: string) {
		// Retrieve OTP data
		const otp = await this.redis.get(`OTP_${userId}`);
		//? NOTE: Since Redis TTL already ensures expiration of the OTP, we don't need to check the expiration here

		if (!otp || otp.method !== OtpMethods.UPDATE_PHONE || otp.code !== code) {
			throw new BadRequestException(this.i18n.t('locale.AuthMessages.InvalidOtpCode', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return otp
	}
}
