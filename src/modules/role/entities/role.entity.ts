import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { PermissionEntity } from "./permission.entity";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.ROLE)
export class RoleEntity extends BaseTimestampedEntity {
	@Column({ unique: true })
	title: string;
	@Column({ unique: true })
	label: string;
	@ManyToMany(() => PermissionEntity, (permission) => permission.roles)
	@JoinTable()
	permissions: PermissionEntity[];
	@OneToMany(() => UserEntity, (user) => user.role)
	users: UserEntity[];
}
