import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity(EntityName.USER_ADDRESS)
export class AddressEntity extends BaseTimestampedEntity {
	@Column()
	title: string;
	@Column()
	province: string;
	@Column()
	city: string;
	@Column()
	address: string;
	@Column()
	postal_code: string;
	@Column()
	userId: number;
	@ManyToOne(() => UserEntity, (user) => user.address, { onDelete: "CASCADE" })
	user: UserEntity;
}
