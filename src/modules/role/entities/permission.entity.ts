import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { Column, Entity, ManyToMany } from "typeorm";
import { RoleEntity } from "./role.entity";

@Entity(EntityName.PERMISSION)
export class PermissionEntity extends BaseEntity {
	@Column({ unique: true })
	title: string;
	@ManyToMany(() => RoleEntity, (role) => role.permissions)
	roles: RoleEntity[];
}
