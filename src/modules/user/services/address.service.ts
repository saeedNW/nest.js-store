import { Inject, Injectable, NotFoundException, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Point, Repository } from "typeorm";
import { AddressEntity } from "../entities/address.entity";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { I18nContext, I18nService } from "nestjs-i18n";
import { CreateAddressDto } from "../dto/create-address.dto";
import { deleteInvalidPropertyInObject } from "src/common/utils/functions.utils";
import { escapeAndTrim } from "src/common/utils/sanitizer.utility";
import { UpdateAddressDto } from "../dto/update-address.dto";
import { UserService } from "./user.service";

@Injectable({ scope: Scope.REQUEST })
export class AddressService {
	constructor(
		// inject address repository
		@InjectRepository(AddressEntity)
		private addressRepository: Repository<AddressEntity>,
		// Make the current request accessible in service
		@Inject(REQUEST) private request: Request,
		// Register i18n service
		private readonly i18n: I18nService,
		// Register user service
		private userService: UserService
	) { }

	/**
	 * Create new address for user
	 * @param {CreateAddressDto} createAddressDto - Client's address data
	 */
	async create(createAddressDto: CreateAddressDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(createAddressDto);
		escapeAndTrim(createAddressDto);

		// Retrieve user data from request
		const { id: userId } = this.getRequestUser();

		// Create address data
		let address = await this.createOrUpdateAddressData(createAddressDto, userId);

		return address
	}

	/**
	 * Find user's addresses list
	 */
	async findAll() {
		// Retrieve user data from request
		const { id: userId } = this.getRequestUser();

		// Retrieve user's address list
		const addressList = await this.addressRepository.findBy({ userId });

		return { addressList }
	}

	/**
	 * Retrieve single address data
	 * @param {number} id - Address's ID
	 */
	async findOne(id: number) {
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
	async update(id: number, updateAddressDto: UpdateAddressDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(updateAddressDto);
		escapeAndTrim(updateAddressDto);

		// Validate address existence
		let address = await this.findOne(id);

		// Retrieve user data from request
		const { id: userId } = this.getRequestUser();

		// Update address data
		address = await this.createOrUpdateAddressData(updateAddressDto, userId, address);

		return address
	}

	/**
	 * Remove user's address by ID
	 * @param {number} id - Address ID
	 */
	async remove(id: number) {
		// Check address existence
		await this.findOne(id);

		// Remove address
		await this.addressRepository.delete({ id });

		return this.i18n.t('locale.PublicMessages.SuccessRemoval', {
			lang: I18nContext?.current()?.lang
		})
	}

	/**
	 * Create new address for user
	 * @param {number} userId - User's ID
	 * @param {CreateAddressDto} createAddressDto - Client's address data
	 */
	async createUserAddress(userId: number, createAddressDto: CreateAddressDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(createAddressDto);
		escapeAndTrim(createAddressDto);

		// Validate user's existence
		await this.userService.findOne(userId)

		// Create address data
		let address = await this.createOrUpdateAddressData(createAddressDto, userId);

		return address;
	}

	/**
	 * Find user's addresses list
	 * @param {number} userId - user's ID
	 */
	async findUserAddresses(userId: number) {
		// Retrieve user's address list
		const addressList = await this.addressRepository.findBy({ userId });

		return { addressList }
	}

	/**
	 * Retrieve single address data
	 * @param {number} id - Address's ID
	 */
	async retrieveAddress(id: number) {
		// Retrieve address data
		const address = await this.addressRepository.findOneBy({ id });

		if (!address) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.AddressNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return address
	}

	/**
	 * Update user's address
	 * @param {number} id - Address's ID
	 * @param {UpdateAddressDto} updateAddressDto - Client's address data
	 */
	async updateUserAddress(id: number, updateAddressDto: UpdateAddressDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(updateAddressDto);
		escapeAndTrim(updateAddressDto);

		// Validate address existence
		let address = await this.retrieveAddress(id);

		// Update address data
		address = await this.createOrUpdateAddressData(updateAddressDto, address.userId, address);

		return address
	}

	/**
	 * Remove user's address by ID
	 * @param {number} id - Address ID
	 */
	async removeUserAddress(id: number) {
		// Check address existence
		await this.retrieveAddress(id);

		// Remove address
		await this.addressRepository.delete({ id });

		return this.i18n.t('locale.PublicMessages.SuccessRemoval', {
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
	 * Update address data object
	 * @param {CreateAddressDto|UpdateAddressDto} addressData - Client's address data
	 * @param {number} userId - Address's ID
	 * @param {AddressEntity} [address] - Address's ID
	 * @returns {Promise<AddressEntity>} - Updated address data object
	 */
	private async createOrUpdateAddressData(addressData: CreateAddressDto | UpdateAddressDto, userId: number, address?: AddressEntity): Promise<AddressEntity> {
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
}
