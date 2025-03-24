import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Point, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request, Response } from 'express';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ProfileEntity } from './entities/profile.entity';
import { AddressEntity } from './entities/address.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { fixDataNumbers } from 'src/common/utils/number.utility';
import { AuthService } from '../auth/auth.service';
import { TOtpObject } from '../auth/types/otp.type';
import { TokenService } from '../auth/token.service';
import { OtpMethods } from 'src/common/enums/otp-methods.enum';
import { RedisService } from '../redis/redis.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { deleteInvalidPropertyInObject } from 'src/common/utils/functions.utils';
import { escapeAndTrim } from 'src/common/utils/sanitizer.utility';
import { fileRemoval, TMulterFile, uploadFinalization } from 'src/common/utils/multer.utility';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
	constructor(
		// inject user repository
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		// inject profile repository
		@InjectRepository(ProfileEntity)
		private profileRepository: Repository<ProfileEntity>,
		// inject address repository
		@InjectRepository(AddressEntity)
		private addressRepository: Repository<AddressEntity>,
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
	 * Retrieve the authenticated user's profile.
	 */
	async getProfile() {
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
	 * Updates or creates a user's profile
	 * @param {UpdateProfileDto} updateProfileDto - The updated profile data
	 */
	async updateProfile(updateProfileDto: UpdateProfileDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(updateProfileDto);
		escapeAndTrim(updateProfileDto);

		// Retrieve user data from request
		let { id: userId, profileId } = this.getRequestUser();

		// Fetch or create a profile for the user
		const profile = await this.getOrCreateProfile(userId, updateProfileDto);

		// Save profile changes to the database
		await this.profileRepository.save(profile);

		// Update user's profileId if it's not set
		if (!profileId) {
			await this.userRepository.update(userId,
				{ profileId: profile.id }
			);
		}

		return this.i18n.t('locale.PublicMessages.SuccessUpdate', {
			lang: I18nContext?.current()?.lang
		});
	}

	/**
	 * Updates the user's profile image
	 * @param {TMulterFile} image - The uploaded image file
	 */
	async updateProfileImage(image: TMulterFile) {
		// Retrieve user data from request
		let { id: userId } = this.getRequestUser();

		// finalize image upload process
		const imagePath = await uploadFinalization(image, `/user/profile/${userId}`);

		// Update user's profile image
		await this.profileRepository.update({ userId }, { profile_image: imagePath });

		return this.i18n.t('locale.PublicMessages.SuccessUpdate', {
			lang: I18nContext?.current()?.lang
		});
	}

	/**
	 * Remove User's profile image
	 */
	async removeProfileImage() {
		// Retrieve user data from request
		let { id: userId, profile: { profile_image } } = this.getRequestUser();

		// Remove image file
		fileRemoval(profile_image);

		// Update user's profile image
		await this.profileRepository.update({ userId }, { profile_image: () => "NULL" });

		return this.i18n.t('locale.PublicMessages.SuccessRemoval', {
			lang: I18nContext?.current()?.lang
		});
	}

	/**
	 * Create new address for user
	 * @param {CreateAddressDto} createAddressDto - Client's address data
	 */
	async createAddress(createAddressDto: CreateAddressDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(createAddressDto);
		escapeAndTrim(createAddressDto);

		// Create address data
		let address = await this.createOrUpdateAddressData(createAddressDto);

		return address
	}

	/**
	 * Find user's addresses list
	 */
	async findAllAddresses() {
		// Retrieve user data from request
		const { id: userId } = this.getRequestUser();

		const addressList = await this.addressRepository.findBy({ userId });

		return { addressList }
	}

	/**
	 * Retrieve single address data
	 * @param {number} id - Address's ID
	 */
	async findOneAddress(id: number) {
		// Retrieve user data from request
		const { id: userId } = this.getRequestUser();

		const address = await this.addressRepository.findOneBy({ id, userId });

		if (!address) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.AddressNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return address
	}

	/**
	 * Update user's address
	 * @param {UpdateAddressDto} updateAddressDto - Client's address data
	 * @param {number} id - Address's ID
	 */
	async updateAddress(id: number, updateAddressDto: UpdateAddressDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(updateAddressDto);
		escapeAndTrim(updateAddressDto);

		// Update address data
		let address = await this.createOrUpdateAddressData(updateAddressDto, id);

		return address
	}

	/**
	 * Remove user's address by ID
	 * @param {number} id - Address ID
	 */
	async removeAddress(id: number) {
		// Check address existence
		await this.findOneAddress(id);

		// Remove address
		await this.addressRepository.delete({ id });

		return this.i18n.t('locale.PublicMessages.SuccessRemoval', {
			lang: I18nContext?.current()?.lang
		})
	}

	/**
	 * Update address data object
	 * @param {CreateAddressDto|UpdateAddressDto} addressData - Client's address data
	 * @param {number} [addressId] - Address's ID
	 * @returns {Promise<AddressEntity>} - Updated address data object
	 */
	private async createOrUpdateAddressData(addressData: CreateAddressDto | UpdateAddressDto, addressId?: number): Promise<AddressEntity> {
		// Retrieve user data from request
		const { id: userId } = this.getRequestUser();
		// Retrieve address data
		let address = await this.addressRepository.findOneBy({ id: addressId, userId });

		// Extract latitude and longitude from update data
		const { latitude, longitude } = addressData;

		delete addressData.latitude
		delete addressData.longitude

		// Generate location point
		const pointObject: Point = {
			type: "Point",
			coordinates: []
		};

		if (address) {
			// Set location coordinates
			pointObject.coordinates = [
				longitude ? longitude : address.location.coordinates[0],
				latitude ? latitude : address.location.coordinates[1],
			];

			// Update existing address
			Object.assign(address, {
				...addressData,
				location: pointObject,
			});
		} else {
			//@ts-ignore - Set location coordinates
			pointObject.coordinates = [longitude, latitude];

			// Create address
			address = this.addressRepository.create({
				...addressData,
				location: pointObject,
				userId
			});
		}

		// Save address data into database
		address = await this.addressRepository.save(address);

		return address
	}

	/**
	 * Retrieves the user's profile or creates a new one if it doesn't exist
	 * @param {number} userId - The ID of the user
	 * @param {UpdateProfileDto} updateProfileDto - The profile data to update
	 */
	private async getOrCreateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
		let profile = await this.profileRepository.findOneBy({ userId });

		if (profile) {
			// Update existing profile
			Object.assign(profile, {
				...updateProfileDto,
				birthday: this.parseValidDate(updateProfileDto.birthday, profile.birthday),
			});
		} else {
			// Create new profile
			profile = this.profileRepository.create({ ...updateProfileDto, userId });
		}

		return profile;
	}

	/**
	 * Parses a valid birthday date or falls back to the existing value
	 * @param {string | undefined} birthday - The new birthday value
	 * @param {Date | undefined} currentBirthday - The existing birthday value
	 */
	private parseValidDate(birthday?: string, currentBirthday?: Date): Date | undefined {
		return birthday && !isNaN(Date.parse(birthday)) ? new Date(birthday) : currentBirthday;
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

	/**
	 * hash user's chosen password
	 * @param {string} password - user's password
	 * @returns {string} - Hashed password
	 */
	private hashPassword(password: string): string {
		return hashSync(password, genSaltSync(10));
	}
}
