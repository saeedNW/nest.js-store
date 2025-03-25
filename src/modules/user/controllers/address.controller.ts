import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { AddressService } from "../services/address.service";
import { SwaggerConsumes } from "src/configs/swagger.config";
import { CreateAddressDto } from "../dto/create-address.dto";
import { plainToClass } from "class-transformer";
import { UpdateAddressDto } from "../dto/update-address.dto";

@Controller('address')
@ApiTags("Address")
@AuthDecorator()
export class AddressController {
	constructor(private readonly addressService: AddressService) { }

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
}
