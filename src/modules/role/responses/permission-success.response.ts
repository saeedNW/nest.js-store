import { ApiProperty } from "@nestjs/swagger";
import { CreateApiBaseResponse, OkApiBaseResponse } from "src/common/abstracts/base.response";
import { RoleEntity } from "../entities/role.entity";
import { PaginatedResult } from "src/common/utils/typeorm.pagination.utility";
import { PermissionEntity } from "../entities/permission.entity";

export class FindRawPermissionsSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			permissions: [
				{
					"id": 1,
					"title": "Permission #1"
				},
				{
					"id": 2,
					"title": "Permission #2"
				}
			]
		}
	})
	data: { permissions: PermissionEntity[] };
}

export class FindPaginatedPermissionsSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			items: [
				{
					id: 1,
					title: "Permission #1"
				},
				{
					id: 2,
					title: "Permission #2"
				}
			],
			meta: {
				totalItems: 2,
				itemCount: 2,
				itemsPerPage: 10,
				totalPages: 1,
				currentPage: 1
			},
			links: {
				first: "http://localhost:3000/permission/paginate?page=1&limit=10",
				previous: "",
				next: "",
				last: "http://localhost:3000/permission/paginate?page=1&limit=10"
			}
		}
	})
	data: PaginatedResult<PermissionEntity>;
}
