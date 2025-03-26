import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { RoleService } from './role.service';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/configs/swagger.config';
import { CreateRoleDto } from './dto/create-role.dto';
import { AuthDecorator } from 'src/common/decorator/auth.decorator';
import { PermissionDecorator } from 'src/common/decorator/permission.decorator';
import { Permissions } from 'src/common/enums/permissions.enum';
import { plainToClass } from 'class-transformer';
import { PaginatedResult, PaginationDto } from 'src/common/utils/typeorm.pagination.utility';
import { RoleEntity } from './entities/role.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
	CreateRoleResponses,
	FindAllRolesResponses,
	FindOneRoleResponses,
	RemoveRoleResponses,
	UpdateRoleResponses
} from './decorators/role-swagger-responses.decorator';

@Controller('role')
@ApiTags("Role")
@AuthDecorator()
@PermissionDecorator(Permissions['Role.management'])
export class RoleController {
	constructor(private readonly roleService: RoleService) { }

	/**
	 * Create new Role
	 * @param createRoleDto - New role data
	 */
	@Post("/create")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@ApiOperation({ summary: "[ RBAC ]" })
	@CreateRoleResponses()
	create(@Body() createRoleDto: CreateRoleDto) {
		// filter client data and remove unwanted data
		createRoleDto = plainToClass(CreateRoleDto, createRoleDto, {
			excludeExtraneousValues: true,
		});

		return this.roleService.create(createRoleDto);
	}

	/**
	 * Retrieve roles paginated data list
	 * @param {PaginationDto} paginationDto - Pagination data
	 * @returns {Promise<PaginatedResult<RoleEntity>>} - Return role list with pagination
	 */
	@Get()
	@ApiOperation({ summary: "[ RBAC ]" })
	@FindAllRolesResponses()
	findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<RoleEntity>> {
		// filter client data and remove unwanted data
		paginationDto = plainToClass(PaginationDto, paginationDto, {
			excludeExtraneousValues: true,
		});

		return this.roleService.findAll(paginationDto)
	}

	/**
	 * Retrieve role by ID
	 * @param {number} id - Role ID
	 * @returns {Promise<RoleEntity>} - Return role entity
	 */
	@Get("/:id")
	@ApiOperation({ summary: "[ RBAC ]" })
	@FindOneRoleResponses()
	findOne(@Param('id', ParseIntPipe) id: number): Promise<RoleEntity> {
		return this.roleService.findOne(id);
	}

	/**
	 * Updates an existing role
	 * @param {number} id - The ID of the role to update
	 * @param {UpdateRoleDto} updateRoleDto - The new role details
	 */
	@Put("/:id")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@ApiOperation({ summary: "[ RBAC ]" })
	@UpdateRoleResponses()
	update(
		@Param("id", ParseIntPipe) id: number,
		@Body() updateRoleDto: UpdateRoleDto
	) {
		// filter client data and remove unwanted data
		updateRoleDto = plainToClass(UpdateRoleDto, updateRoleDto, {
			excludeExtraneousValues: true,
		});

		return this.roleService.update(id, updateRoleDto);
	}

	/**
	 * Remove role by ID
	 * @param id - Role ID
	 * @returns {Promise<string>} - Success message
	 */
	@Delete("/:id")
	@ApiOperation({ summary: "[ RBAC ]" })
	@RemoveRoleResponses()
	remove(@Param('id', ParseIntPipe) id: number): Promise<string> {
		return this.roleService.remove(id);
	}
}
