import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { Column, Entity, ManyToOne } from "typeorm";
import { BlogStatus } from "../enums/status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";

@Entity(EntityName.BLOG)
export class BlogEntity extends BaseTimestampedEntity {
	@Column()
	title: string;
	@Column()
	description: string;
	@Column()
	content: string;
	@Column({ nullable: true })
	image: string;
	@Column({ default: BlogStatus.DRAFT })
	status: string;
	@Column({ unique: true })
	slug: string;
	@Column()
	authorId: number;
	@ManyToOne(() => UserEntity, (user) => user.blogs, { onDelete: "CASCADE" })
	author: UserEntity;
}
