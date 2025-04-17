import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BlogStatus } from "../enums/status.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { CategoryEntity } from "src/modules/category/entities/category.entity";
import { CommentEntity } from "src/modules/comment/entities/comment.entity";

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

	@ManyToMany(() => CategoryEntity, (category) => category.blogs)
	@JoinTable({
		name: 'blog_categories',
		joinColumn: { name: 'blog_id', referencedColumnName: 'id' },
		inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
	})
	categories: CategoryEntity[];

	@OneToMany(() => CommentEntity, (comment) => comment.blog)
	comments: CommentEntity[];
}
