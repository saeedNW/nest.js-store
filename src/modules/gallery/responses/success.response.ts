import { ApiProperty } from "@nestjs/swagger";
import { CreateApiBaseResponse, OkApiBaseResponse } from "src/common/abstracts/base.response";
import { GalleryEntity } from "../entities/gallery.entity";

export class FileUploadSuccess extends CreateApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			file: {
				id: 1,
				name: "file name",
				address: "http://localhost:3000/uploads/gallery/2025/1743446388136-Screenshot_20250328_211111.png",
				mimeType: "image/png",
				size: 270142,
				alt: "file alt",
				created_at: "2025-03-31T15:09:48.138Z"
			}
		},
	})
	data: { file: GalleryEntity }
}

export class FindAllFilesSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			files: [
				{
					id: 1,
					name: "file name",
					address: "http://localhost:3000/uploads/gallery/2025/1743446388136-Screenshot_20250328_211111.png",
					mimeType: "image/png",
					size: 270142,
					alt: "file alt",
					created_at: "2025-03-31T15:09:48.138Z"
				}
			]
		},
	})
	data: { files: GalleryEntity[] }
}

export class FindSingleFilesSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			id: 6,
			name: "string",
			address: "http://localhost:3000/uploads/gallery/2025/1743446388136-Screenshot_20250328_211111.png",
			mimeType: "image/png",
			size: "270142",
			alt: "string",
			created_at: "2025-03-31T15:09:48.138Z"
		}
	})
	data: GalleryEntity
}

export class RemoveFileSuccess extends OkApiBaseResponse { }
