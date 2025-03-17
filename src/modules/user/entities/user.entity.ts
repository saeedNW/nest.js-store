import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { AddressEntity } from "./address.entity";
import { ProfileEntity } from "./profile.entity";

@Entity(EntityName.USER)
export class UserEntity extends BaseTimestampedEntity {
	@Column({ nullable: true })
	first_name: string;
	@Column({ nullable: true })
	last_name: string;
	@Column({ unique: true })
	phone: string;
	@Column({ nullable: true })
	new_phone: string;
	@Column({ nullable: true, default: false })
	verify_phone: boolean;
	@Column({ nullable: true })
	password: string;
	@Column({ nullable: true })
	token: string;
	@OneToMany(() => AddressEntity, (address) => address.user)
	address: AddressEntity[];
	@Column({ nullable: true })
	profileId: number;
	@OneToOne(() => ProfileEntity, (profile) => profile.user, { nullable: true })
	@JoinColumn()
	profile: ProfileEntity;
}
