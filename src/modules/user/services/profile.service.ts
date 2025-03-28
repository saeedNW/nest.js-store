import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Repository } from "typeorm";
import { ProfileEntity } from "../entities/profile.entity";
import { REQUEST } from "@nestjs/core";
import { I18nContext, I18nService } from "nestjs-i18n";
import { UpdateProfileDto } from "../dto/update-profile.dto";
import { deleteInvalidPropertyInObject } from "src/common/utils/functions.utils";
import { escapeAndTrim } from "src/common/utils/sanitizer.utility";
import { Request } from "express";
import { TMulterFile, uploadFinalization } from "src/common/utils/multer.utility";
import { UserService } from "./user.service";
import { StorageService } from "src/modules/storage/storage.service";

@Injectable({ scope: Scope.REQUEST })
export class ProfileService {
	constructor(
		// inject user repository
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		// inject profile repository
		@InjectRepository(ProfileEntity)
		private profileRepository: Repository<ProfileEntity>,
		// Make the current request accessible in service
		@Inject(REQUEST) private request: Request,
		// Register i18n service
		private readonly i18n: I18nService,
		// Register user service
		private userService: UserService,
		// Register storage service
		private storageService:StorageService
	) { }

	/**
	 * Updates or creates a user's profile
	 * @param {UpdateProfileDto} updateProfileDto - The updated profile data
	 */
	async updateProfile(updateProfileDto: UpdateProfileDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(updateProfileDto, [], ["bio"]);
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
		let { id: userId, profile: { profile_image } } = this.getRequestUser();

		// finalize image upload process
		const imagePath = await this.storageService.upload(image, `user/profile/${userId}`);

		// Update user's profile image
		await this.profileRepository.update({ userId }, { profile_image: imagePath });

		// Remove old image file
		await this.storageService.RemoveFile(profile_image);

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
		await this.storageService.RemoveFile(profile_image);

		// Update user's profile image
		await this.profileRepository.update({ userId }, { profile_image: () => "NULL" });

		return this.i18n.t('locale.PublicMessages.SuccessRemoval', {
			lang: I18nContext?.current()?.lang
		});
	}

	/**
	 * Updates or creates a user's profile
	 * @param {number} userId - User's ID
	 * @param {UpdateProfileDto} updateProfileDto - The updated profile data
	 */
	async updateUserProfile(userId: number, updateProfileDto: UpdateProfileDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(updateProfileDto, [], ["bio"]);
		escapeAndTrim(updateProfileDto);

		// Retrieve user data from request
		let user = await this.userService.findOne(userId);

		// Fetch or create a profile for the user
		const profile = await this.getOrCreateProfile(userId, updateProfileDto);

		// Save profile changes to the database
		await this.profileRepository.save(profile);

		// Update user's profileId if it's not set
		if (!user.profileId) {
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
	 * @param {number} id - Profile's ID
	 * @param {TMulterFile} image - The uploaded image file
	 */
	async updateUserProfileImage(id: number, image: TMulterFile) {
		// Retrieve user data from request
		let { userId, profile_image } = await this.findOne(id);

		// finalize image upload process
		const imagePath = await uploadFinalization(image, `/user/profile/${userId}`);

		// Update user's profile image
		await this.profileRepository.update({ userId }, { profile_image: imagePath });

		// Remove old image file
		await this.storageService.RemoveFile(profile_image);

		return this.i18n.t('locale.PublicMessages.SuccessUpdate', {
			lang: I18nContext?.current()?.lang
		});
	}

	/**
	 * Remove User's profile image
	 * @param {number} id - Profile's ID
	 */
	async removeUserProfileImage(id: number) {
		// Retrieve user data from request
		let { profile_image } = await this.findOne(id);

		// Remove image file
		await this.storageService.RemoveFile(profile_image);

		// Update user's profile image
		await this.profileRepository.update({ id }, { profile_image: () => "NULL" });

		return this.i18n.t('locale.PublicMessages.SuccessRemoval', {
			lang: I18nContext?.current()?.lang
		});
	}

	/**
	 * Retrieve single profile by ID
	 * @param id - Profile's ID
	 * @returns {Promise<ProfileEntity>} - Return profile data
	 */
	async findOne(id: number): Promise<ProfileEntity> {
		// Retrieve profile data
		const profile = await this.profileRepository.findOneBy({ id });

		// Throw error if profile not found
		if (!profile) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.ProfileNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return profile
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
}
