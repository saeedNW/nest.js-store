import { AfterLoad, Column, CreateDateColumn, Entity } from "typeorm";
import { BaseEntity } from "src/common/abstracts/base.entity";
import { EntityName } from "src/common/enums/entity-name.enum";

@Entity(EntityName.GALLERY)
export class GalleryEntity extends BaseEntity {
	@Column()
	name: string;

	@Column()
	address: string;

	@Column()
	mimeType: string;

	@Column({ type: 'bigint' })
	size: number;

	@Column({ nullable: true })
	alt: string;

	@CreateDateColumn()
	created_at: Date;

	@AfterLoad()
	map() {
		if (this.address && !(this.address.includes("https") || this.address.includes("http"))) {
			this.address = process.env.SERVER + this.address;
		}
	}
}
