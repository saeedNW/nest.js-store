import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { CommentType } from "../enum/comment-type.enum";
import { UserEntity } from "src/modules/user/entities/user.entity";
import { BlogEntity } from "src/modules/blog/entities/blog.entity";

@Entity(EntityName.COMMENT)
export class CommentEntity extends BaseEntity {
	@Column()
	text: string;

	@Column({ type: 'enum', enum: CommentType })
	type: CommentType; // Either 'PRODUCT' or 'BLOG'

	@Column({ default: false })
	accepted: boolean;

	@Column()
	userId: number;

	@ManyToOne(() => UserEntity, (user) => user.comments, {
		onDelete: "CASCADE",
	})
	user: UserEntity;

	@Column()
	blogId: number;

	@ManyToOne(() => BlogEntity, (blog) => blog.comments, { onDelete: "CASCADE" })
	blog: BlogEntity;

	@Column({ nullable: true })
	parentId: number;

	@ManyToOne(() => CommentEntity, (parent) => parent.children, {
		onDelete: "CASCADE",
	})
	parent: CommentEntity;

	@OneToMany(() => CommentEntity, (comment) => comment.parent)
	@JoinColumn({ name: "parent" })
	children: CommentEntity[];

	@CreateDateColumn()
	created_at: Date;
}
