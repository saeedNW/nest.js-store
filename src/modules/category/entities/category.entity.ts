import { BaseTimestampedEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";
import { Column, Entity, ManyToOne, OneToMany, Tree, TreeChildren, TreeParent } from "typeorm";
import { CategoryType } from "../enum/category-type.enum";
import { BlogEntity } from "src/modules/blog/entities/blog.entity";

@Entity(EntityName.CATEGORY)
@Tree("closure-table") // Ensure closure-table strategy is used correctly
export class CategoryEntity extends BaseTimestampedEntity {
	@Column({ unique: true })
	title: string;

	@Column({ type: 'enum', enum: CategoryType })
	type: CategoryType; // Either 'PRODUCT' or 'BLOG'

	@TreeChildren()
	children: CategoryEntity[];

	@TreeParent({ onDelete: "CASCADE" })
	parent: CategoryEntity;

	@OneToMany(() => BlogEntity, (blog) => blog.category)
	blogs: BlogEntity[];
}
