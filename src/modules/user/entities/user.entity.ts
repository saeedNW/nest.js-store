import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { AddressEntity } from "./address.entity";
import { ProfileEntity } from "./profile.entity";
import { RoleEntity } from "src/modules/role/entities/role.entity";
import { BlogEntity } from "src/modules/blog/entities/blog.entity";

@Entity(EntityName.USER)
export class UserEntity extends BaseTimestampedEntity {
	@Column({ unique: true })
	phone: string;

	@Column({ nullable: true })
	new_phone: string;

	@Column({ nullable: true, default: false })
	verify_phone: boolean;

	@Column({ nullable: true })
	password?: string;

	@Column({ nullable: true })
	token?: string;

	@OneToMany(() => AddressEntity, (address) => address.user)
	address: AddressEntity[];

	@Column({ nullable: true })
	profileId: number;

	@OneToOne(() => ProfileEntity, (profile) => profile.user, { nullable: true })
	@JoinColumn()
	profile: ProfileEntity;

	@ManyToOne(() => RoleEntity, (role) => role.users, { eager: true, nullable: true })
	role: RoleEntity;

	@OneToMany(() => BlogEntity, (blog) => blog.author)
	blogs: BlogEntity[];
}
