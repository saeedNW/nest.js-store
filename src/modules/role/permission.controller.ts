import { Controller, Get, Query } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginatedResult, PaginationDto } from 'src/common/utils/typeorm.pagination.utility';
import { plainToClass } from 'class-transformer';
import { PermissionEntity } from './entities/permission.entity';
import { AuthDecorator } from 'src/common/decorator/auth.decorator';
import { PermissionDecorator } from 'src/common/decorator/permission.decorator';
import { Permissions } from 'src/common/enums/permissions.enum';
import { FindPaginatedPermissionsResponses, FindRawPermissionsResponses } from './decorators/permission-swagger-responses.decorator';

@Controller('permission')
@ApiTags("Permission")
@AuthDecorator()
@PermissionDecorator(Permissions['Role.management'])
export class PermissionController {
	constructor(private readonly permissionService: PermissionService) { }

	/**
	 * Retrieve permissions raw data list
	 * @returns {Promise<PermissionEntity[]>} - Return permissions list
	 */
	@Get("/raw")
	@ApiOperation({ summary: "Auth and Role protected API" })
	@FindRawPermissionsResponses()
	getRawData(): Promise<{ permissions: PermissionEntity[] }> {
		return this.permissionService.getRawData()
	}

	/**
	 * Retrieve permissions paginated data list
	 * @param {PaginationDto} paginationDto - Pagination data
	 * @returns {Promise<PaginatedResult<PermissionEntity>>} - Return permission list with pagination
	 */
	@Get("/paginate")
	@ApiOperation({ summary: "Auth and Role protected API" })
	@FindPaginatedPermissionsResponses()
	getPaginatedData(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<PermissionEntity>> {
		// filter client data and remove unwanted data
		paginationDto = plainToClass(PaginationDto, paginationDto, {
			excludeExtraneousValues: true,
		});

		return this.permissionService.getPaginatedData(paginationDto)
	}
}
