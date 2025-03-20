import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Permissions } from 'src/common/enums/permissions.enum';
import { PermissionEntity } from 'src/modules/role/entities/permission.entity';
import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
	constructor(
		@InjectRepository(RoleEntity)
		private roleRepository: Repository<RoleEntity>,
		@InjectRepository(PermissionEntity)
		private readonly permissionRepository: Repository<PermissionEntity>,
	) { }

	async seed() {
		await this.seedRoles();
	}

	private async seedRoles() {
		const permissions = Object.values(Permissions);

		const permissionEntities = await Promise.all(
			permissions.map(async (title) => {
				let perm = await this.permissionRepository.findOne({ where: { title } });
				if (!perm) {
					perm = this.permissionRepository.create({ title });
					await this.permissionRepository.save(perm);
				}
				return perm;
			})
		);

		const roles = [
			{ title: 'admin', label: 'Admin', permissions: permissionEntities },
			{ title: 'user', label: 'User' },
		];

		for (const roleData of roles) {
			let role = await this.roleRepository.findOne({ where: { title: roleData.title }, relations: ['permissions'] });
			if (!role) {
				role = this.roleRepository.create(roleData);
				await this.roleRepository.save(role);
			}
		}
	}

}
