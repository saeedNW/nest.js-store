import { BaseEntity } from "src/common/abstracts/base.entity";
import { AfterLoad, Column, Entity, OneToOne, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { EntityName } from "src/common/enums/entity-name.enum";

@Entity(EntityName.PROFILE)
export class ProfileEntity extends BaseEntity {
	@Column({ nullable: true })
	first_name: string;
	@Column({ nullable: true })
	last_name: string;
	@Column({ nullable: true })
	bio: string;
	@Column({ nullable: true })
	profile_image: string;
	@Column({ nullable: true })
	birthday: Date;
	@Column()
	userId: number;
	@OneToOne(() => UserEntity, (user) => user.profile, { onDelete: "CASCADE" })
	user: UserEntity;
	@UpdateDateColumn()
	updated_at: Date;

	@AfterLoad()
	map() {
		this.profile_image = this.profile_image ?
			process.env.SERVER + this.profile_image : "null";
	}
}
