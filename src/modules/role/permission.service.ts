import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { Repository } from 'typeorm';
import { paginate, PaginatedResult, PaginationDto } from 'src/common/utils/typeorm.pagination.utility';

@Injectable()
export class PermissionService {
	constructor(
		// inject user repository
		@InjectRepository(PermissionEntity)
		private permissionRepository: Repository<PermissionEntity>,
	) { }

	/**
	 * Retrieve permissions raw data list
	 * @returns {: Promise<PermissionEntity[]>} - Return permissions list
	 */
	async getRawData(): Promise<PermissionEntity[]> {
		return await this.permissionRepository.find()
	}

	/**
	 * Retrieve permissions paginated data list
	 * @param {PaginationDto} paginationDto - Pagination data
	 * @returns {Promise<PaginatedResult<PermissionEntity>>} - Return permission list with pagination
	 */
	async getPaginatedData(paginationDto: PaginationDto): Promise<PaginatedResult<PermissionEntity>> {
		return await paginate(
			paginationDto,
			this.permissionRepository,
			undefined,
			process.env.SERVER + "/permission/paginate"
		);
	}

	/**
	 * Check if permission exists
	 * @param {number} id - Permission id
	 * @returns {Promise<PermissionEntity | undefined>} - return permission if exists, otherwise return undefined
	 */
	async checkPermissionExists(id: number): Promise<PermissionEntity | undefined> {
		const permission = await this.permissionRepository.findOneBy({ id });
		if (!permission) return undefined;
		return permission
	}
}
