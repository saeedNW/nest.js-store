import { BaseEntity } from "src/common/abstracts/base.entity";
import { Column, Entity, OneToOne, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { EntityName } from "src/common/enums/entity-name.enum";

@Entity(EntityName.PROFILE)
export class ProfileEntity extends BaseEntity {
	@Column()
	nickname: string;
	@Column({ nullable: true })
	bio: string;
	@Column({ nullable: true })
	profile_image: string;
	@Column({ nullable: true })
	gender: string;
	@Column({ nullable: true })
	birthday: Date;
	@Column()
	userId: number;
	@OneToOne(() => UserEntity, (user) => user.profile, { onDelete: "CASCADE" })
	user: UserEntity;
	@UpdateDateColumn()
	updated_at: Date;
}
