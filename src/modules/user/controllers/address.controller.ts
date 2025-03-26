import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { AddressService } from "../services/address.service";
import { SwaggerConsumes } from "src/configs/swagger.config";
import { CreateAddressDto } from "../dto/create-address.dto";
import { plainToClass } from "class-transformer";
import { UpdateAddressDto } from "../dto/update-address.dto";
import { PermissionDecorator } from "src/common/decorator/permission.decorator";
import { Permissions } from "src/common/enums/permissions.enum";

@Controller('address')
@ApiTags("Address")
@AuthDecorator()
export class AddressController {
	constructor(private readonly addressService: AddressService) { }

	// ===================== User APIs =====================

	/**
	 * Create new address for user
	 * @param {CreateAddressDto} createAddressDto - Client's address data
	 */
	@Post()
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	create(@Body() createAddressDto: CreateAddressDto) {
		// filter client data and remove unwanted data
		createAddressDto = plainToClass(CreateAddressDto, createAddressDto, {
			excludeExtraneousValues: true,
		});

		return this.addressService.create(createAddressDto)
	}

	/**
	 * Find user's addresses list
	 */
	@Get()
	findAll() {
		return this.addressService.findAll()
	}

	/**
	 * Retrieve single address data
	 * @param id - Address's ID
	 */
	@Get("/:id")
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.addressService.findOne(id)
	}

	/**
	 * Update user's address
	 * @param {UpdateAddressDto} updateAddressDto - Client's address data
	 * @param {number} id - Address's ID
	 */
	@Put("/:id")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateAddressDto: UpdateAddressDto
	) {
		// filter client data and remove unwanted data
		updateAddressDto = plainToClass(UpdateAddressDto, updateAddressDto, {
			excludeExtraneousValues: true,
		});

		return this.addressService.update(id, updateAddressDto)
	}

	/**
	 * Remove user's address by ID
	 * @param {number} id - Address ID
	 */
	@Delete("/:id")
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.addressService.remove(id)
	}

	// ===================== Admin APIs =====================

	/**
	 * Create new address for user
	 * @param {number} userId - User's ID
	 * @param {CreateAddressDto} createAddressDto - Client's address data
	 */
	@Post("/create/:userId")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@PermissionDecorator(Permissions['Users.data'])
	@ApiOperation({ summary: "[ RBAC ] - Create new address for user" })
	createForUser(
		@Param('userId', ParseIntPipe) userId: number,
		@Body() createAddressDto: CreateAddressDto
	) {
		createAddressDto = plainToClass(CreateAddressDto, createAddressDto, {
			excludeExtraneousValues: true,
		});

		return this.addressService.createUserAddress(userId, createAddressDto);
	}

	/**
	 * Find user's addresses list
	 * @param {number} userId - user's ID
	 */
	@Get("/list/:userId")
	@PermissionDecorator(Permissions['Users.data'])
	@ApiOperation({ summary: "[ RBAC ] - Retrieve user address list" })
	findUserAddresses(@Param('userId', ParseIntPipe) userId: number) {
		return this.addressService.findUserAddresses(userId);
	}

	/**
	 * Retrieve single address data
	 * @param {number} addressId - Address's ID
	 */
	@Get("/single/:addressId")
	@PermissionDecorator(Permissions['Users.data'])
	@ApiOperation({ summary: "[ RBAC ] - Retrieve single address" })
	retrieveAddress(@Param('addressId', ParseIntPipe) addressId: number) {
		return this.addressService.retrieveAddress(addressId);
	}

	/**
	 * Update user's address
	 * @param {number} addressId - Address's ID
	 * @param {UpdateAddressDto} updateAddressDto - Client's address data
	 */
	@Put("/update/:addressId")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@PermissionDecorator(Permissions['Users.data'])
	@ApiOperation({ summary: "[ RBAC ] - Update address info" })
	updateForUser(
		@Param('addressId', ParseIntPipe) addressId: number,
		@Body() updateAddressDto: UpdateAddressDto
	) {
		updateAddressDto = plainToClass(UpdateAddressDto, updateAddressDto, {
			excludeExtraneousValues: true,
		});

		return this.addressService.updateUserAddress(addressId, updateAddressDto);
	}

	/**
	 * Remove user's address by ID
	 * @param {number} addressId - Address ID
	 */
	@Delete("/remove/:addressId")
	@PermissionDecorator(Permissions['Users.data'])
	@ApiOperation({ summary: "[ RBAC ] - Remove address" })
	removeForUser(@Param('addressId', ParseIntPipe) addressId: number) {
		return this.addressService.removeUserAddress(addressId);
	}
}
