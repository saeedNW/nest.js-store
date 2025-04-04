import { ApiProperty } from "@nestjs/swagger";
import { CreateApiBaseResponse, OkApiBaseResponse } from "src/common/abstracts/base.response";
import { PaginatedResult } from "src/common/utils/typeorm.pagination.utility";
import { BlogEntity } from "../entities/blog.entity";

export class CreateBlogSuccess extends CreateApiBaseResponse { }
export class UpdateBlogSuccess extends CreateApiBaseResponse { }
export class RemoveBlogSuccess extends CreateApiBaseResponse { }

export class FindAllBlogsSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			items: [
				{
					id: 8,
					created_at: "2025-03-31T07:38:41.094Z",
					updated_at: "2025-03-31T07:38:41.094Z",
					title: "blog title",
					description: "blog description (Summery)",
					content: "blog full content",
					image: "http://localhost:3000/uploads/gallery/2025/1743446388136-Screenshot_20250328_211111.png",
					status: "draft",
					slug: "string-slug",
					authorId: 1,
					author: {
						id: 1,
						profile: {
							first_name: "first name",
							last_name: "last name",
							profile_image: "http://localhost:3000/uploads/user/profile/1/1743188782720-Screenshot_20250312_193643.png"
						}
					},
					categories: [
						{
							id: 1,
							title: "NodeJS"
						},
						{
							id: 4,
							title: "BackEnd"
						},
						{
							id: 6,
							title: "NestJS"
						}
					]
				}
			],
			meta: {
				totalItems: 1,
				itemCount: 1,
				itemsPerPage: 10,
				totalPages: 1,
				currentPage: 1
			},
			links: {
				first: "http://localhost:3000/role?page=1&limit=10",
				previous: "",
				next: "",
				last: "http://localhost:3000/role?page=1&limit=10"
			}
		},
	})
	data: PaginatedResult<BlogEntity>;
}

export class FindOneBlogsSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			id: 8,
			created_at: "2025-03-31T07:38:41.094Z",
			updated_at: "2025-03-31T07:38:41.094Z",
			title: "blog title",
			description: "blog description (Summery)",
			content: "blog full content",
			image: "http://localhost:3000/uploads/gallery/2025/1743446388136-Screenshot_20250328_211111.png",
			status: "draft",
			slug: "string-slug",
			authorId: 1,
			author: {
				id: 1,
				profile: {
					first_name: "first name",
					last_name: "last name",
					profile_image: "http://localhost:3000/uploads/user/profile/1/1743188782720-Screenshot_20250312_193643.png"
				}
			},
			categories: [
				{
					id: 1,
					title: "NodeJS"
				},
				{
					id: 4,
					title: "BackEnd"
				},
				{
					id: 6,
					title: "NestJS"
				}
			]
		}
	})
	data: BlogEntity;
}
