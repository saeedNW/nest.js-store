import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import { I18nContext, I18nService } from "nestjs-i18n";
import { AuthService } from "src/modules/auth/auth.service";
import { TokenService } from "src/modules/auth/token.service";
import { RedisService } from "src/modules/redis/redis.service";
import { Request, Response } from "express";
import { UpdatePasswordDto } from "../dto/update-password.dto";
import { compareSync, genSaltSync, hashSync } from "bcrypt";
import { UpdatePhoneDto } from "../dto/update-phone.dto";
import { fixDataNumbers } from "src/common/utils/number.utility";
import { TOtpObject } from "src/modules/auth/types/otp.type";
import { OtpMethods } from "src/common/enums/otp-methods.enum";

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
		private redis: RedisService
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
