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
import {
	CreateAddressResponses,
	findAllAddressesResponses,
	CreateUserAddressResponses,
	RemoveAddressResponses,
	RemoveUserAddressResponses,
	UpdateAddressResponses,
	UpdateUserAddressResponses,
	findOneAddressResponses,
	findUserAddressesResponses,
	findUserSingleAddressResponses
} from "../decorators/address-swagger-response.decorator";

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
	@CreateAddressResponses()
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
	@findAllAddressesResponses()
	findAll() {
		return this.addressService.findAll()
	}

	/**
	 * Retrieve single address data
	 * @param id - Address's ID
	 */
	@Get("/:id")
	@findOneAddressResponses()
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
	@UpdateAddressResponses()
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
	@RemoveAddressResponses()
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
	@CreateUserAddressResponses()
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
	@findUserAddressesResponses()
	findUserAddresses(@Param('userId', ParseIntPipe) userId: number) {
		return this.addressService.findUserAddresses(userId);
	}

	/**
	 * Retrieve single address data
	 * @param {number} id - Address's ID
	 */
	@Get("/single/:id")
	@PermissionDecorator(Permissions['Users.data'])
	@ApiOperation({ summary: "[ RBAC ] - Retrieve single address" })
	@findUserSingleAddressResponses()
	retrieveAddress(@Param('id', ParseIntPipe) id: number) {
		return this.addressService.retrieveAddress(id);
	}

	/**
	 * Update user's address
	 * @param {number} id - Address's ID
	 * @param {UpdateAddressDto} updateAddressDto - Client's address data
	 */
	@Put("/update/:id")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@PermissionDecorator(Permissions['Users.data'])
	@ApiOperation({ summary: "[ RBAC ] - Update address info" })
	@UpdateUserAddressResponses()
	updateForUser(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateAddressDto: UpdateAddressDto
	) {
		updateAddressDto = plainToClass(UpdateAddressDto, updateAddressDto, {
			excludeExtraneousValues: true,
		});

		return this.addressService.updateUserAddress(id, updateAddressDto);
	}

	/**
	 * Remove user's address by ID
	 * @param {number} id - Address ID
	 */
	@Delete("/remove/:id")
	@PermissionDecorator(Permissions['Users.data'])
	@ApiOperation({ summary: "[ RBAC ] - Remove address" })
	@RemoveUserAddressResponses()
	removeForUser(@Param('id', ParseIntPipe) id: number) {
		return this.addressService.removeUserAddress(id);
	}
}
