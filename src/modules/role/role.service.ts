import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { Not, Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { CreateRoleDto } from './dto/create-role.dto';
import { deleteInvalidPropertyInObject } from 'src/common/utils/functions.utils';
import { escapeAndTrim } from 'src/common/utils/sanitizer.utility';
import { PermissionService } from './permission.service';
import { PermissionEntity } from './entities/permission.entity';
import { paginate, PaginatedResult, PaginationDto } from 'src/common/utils/typeorm.pagination.utility';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
	constructor(
		// inject role repository
		@InjectRepository(RoleEntity)
		private roleRepository: Repository<RoleEntity>,
		// Register i18n service
		private readonly i18n: I18nService,
		// Register permission service
		private permissionService: PermissionService
	) { }

	/**
	 * Create new Role
	 * @param createRoleDto - New role data
	 */
	async create(createRoleDto: CreateRoleDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(createRoleDto);
		escapeAndTrim(createRoleDto);

		// Validate role title and label uniqueness
		await this.checkDuplicatedRole(createRoleDto.title)
		await this.checkDuplicatedRole(createRoleDto.label)

		// Fetch valid permissions
		const validPermissions = await this.getValidPermissions(createRoleDto.permissions);

		// Create new role entity
		let newRole: RoleEntity = this.roleRepository.create({
			...createRoleDto,
			permissions: validPermissions,
		});

		// Save role to database
		newRole = await this.roleRepository.save(newRole);

		return { newRole }
	}

	/**
	 * Retrieve roles paginated data list
	 * @param {PaginationDto} paginationDto - Pagination data
	 * @returns {Promise<PaginatedResult<RoleEntity>>} - Return role list with pagination
	 */
	async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<RoleEntity>> {
		return await paginate(
			paginationDto,
			this.roleRepository,
			undefined,
			process.env.SERVER + "/role"
		);
	}

	/**
	 * Retrieve role by ID
	 * @param {number} id - Role ID
	 * @returns {Promise<RoleEntity>} - Return role entity
	 */
	async findOne(id: number): Promise<RoleEntity> {
		const role: RoleEntity | null = await this.roleRepository.findOne({ where: { id }, relations: ["permissions"] });

		if (!role) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.RoleNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return role
	}

	/**
	 * Updates an existing role with new details.
	 * @param {number} id - The ID of the role to update.
	 * @param {UpdateRoleDto} updateRoleDto - The new role details.
	 * @returns {Promise<{ updatedRole: RoleEntity }>} - The updated role entity.
	 */
	async update(id: number, updateRoleDto: UpdateRoleDto): Promise<{ updatedRole: RoleEntity; }> {
		// check for role existence
		const role = await this.findOne(id);

		// Prevent updates to protected roles
		if (["admin", "user"].includes(role.title.toLowerCase())) {
			throw new BadRequestException(this.i18n.t("locale.BadRequestMessages.ProtectedRoleUpdate", {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Sanitize client data
		deleteInvalidPropertyInObject(updateRoleDto);
		escapeAndTrim(updateRoleDto);

		// Validate role title and label uniqueness
		if (updateRoleDto.title) await this.checkDuplicatedRole(updateRoleDto.title, id)
		if (updateRoleDto.label) await this.checkDuplicatedRole(updateRoleDto.label, id)

		// Fetch valid permissions
		const validPermissions = await this.getValidPermissions(updateRoleDto.permissions);

		// Apply updates
		Object.assign(role, {
			title: updateRoleDto.title || role.title,
			label: updateRoleDto.label || role.label,
			permissions: validPermissions
		});

		// Save and return updated role
		const updatedRole = await this.roleRepository.save(role);
		return { updatedRole };
	}

	/**
	 * Remove role by ID
	 * @param id - Role ID
	 * @returns {Promise<string>} - Success message
	 */
	async remove(id: number): Promise<string> {
		// check for role existence
		const role = await this.findOne(id);

		// Prevent removal of protected roles
		if (["admin", "user"].includes(role.title.toLowerCase())) {
			throw new BadRequestException(this.i18n.t("locale.BadRequestMessages.ProtectedRoleRemove", {
				lang: I18nContext?.current()?.lang
			}));
		}

		/** remove category */
		await this.roleRepository.delete({ id });

		return this.i18n.t('locale.PublicMessages.SuccessRemoval', {
			lang: I18nContext?.current()?.lang
		})
	}

	/**
	 * Check if the Role title or label are duplicated
	 * @param {string} query - Role title or label
	 * @param {number} [id] - (Optional) Role ID to exclude from the check
	 * @returns {Promise<boolean>} - Returns true if role is not duplicated
	 */
	async checkDuplicatedRole(query: string, id?: number): Promise<boolean> {
		const whereConditions: any[] = [
			{ title: query },
			{ label: query },
		];

		// If id is provided, exclude the role with this id
		if (id) {
			whereConditions.forEach(condition => {
				condition.id = Not(id);
			});
		}

		const role = await this.roleRepository.findOne({
			where: whereConditions,
		});

		if (role) {
			throw new ConflictException(
				this.i18n.t('locale.ConflictMessages.ConflictRole', {
					lang: I18nContext?.current()?.lang,
				}),
			);
		}

		return true;
	}

	/**
	 * Retrieves valid permissions from the provided list.
	 * @param {number[]} [permissions] - The list of permission IDs.
	 * @returns {Promise<PermissionEntity[]>} - A list of valid permissions.
	 */
	private async getValidPermissions(permissions?: number[]): Promise<PermissionEntity[]> {
		if (!permissions || permissions.length === 0) return [];

		const results = await Promise.allSettled(
			permissions.map(id => this.permissionService.checkPermissionExists(id))
		);

		return results
			.filter(result => result.status === "fulfilled" && result.value)
			.map(result => (result as PromiseFulfilledResult<PermissionEntity>).value);
	}

}
