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
	@ApiOperation({ summary: "[ RBAC ] - Create new role" })
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
	@ApiOperation({ summary: "[ RBAC ] - Retrieve roles list" })
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
	 * @param {number} roleId - Role ID
	 * @returns {Promise<RoleEntity>} - Return role entity
	 */
	@Get("/:roleId")
	@ApiOperation({ summary: "[ RBAC ] - Retrieve single role" })
	@FindOneRoleResponses()
	findOne(@Param('roleId', ParseIntPipe) roleId: number): Promise<RoleEntity> {
		return this.roleService.findOne(roleId);
	}

	/**
	 * Updates an existing role
	 * @param {number} roleId - The ID of the role to update
	 * @param {UpdateRoleDto} updateRoleDto - The new role details
	 */
	@Put("/:roleId")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@ApiOperation({ summary: "[ RBAC ] - Update role" })
	@UpdateRoleResponses()
	update(
		@Param("roleId", ParseIntPipe) roleId: number,
		@Body() updateRoleDto: UpdateRoleDto
	) {
		// filter client data and remove unwanted data
		updateRoleDto = plainToClass(UpdateRoleDto, updateRoleDto, {
			excludeExtraneousValues: true,
		});

		return this.roleService.update(roleId, updateRoleDto);
	}

	/**
	 * Remove role by ID
	 * @param roleId - Role ID
	 * @returns {Promise<string>} - Success message
	 */
	@Delete("/:roleId")
	@ApiOperation({ summary: "[ RBAC ] - remove Role" })
	@RemoveRoleResponses()
	remove(@Param('roleId', ParseIntPipe) roleId: number): Promise<string> {
		return this.roleService.remove(roleId);
	}
}
