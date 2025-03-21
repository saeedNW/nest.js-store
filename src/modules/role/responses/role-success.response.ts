import { ApiProperty } from "@nestjs/swagger";
import { CreateApiBaseResponse, OkApiBaseResponse } from "src/common/abstracts/base.response";
import { RoleEntity } from "../entities/role.entity";
import { PaginatedResult } from "src/common/utils/typeorm.pagination.utility";

export class CreateRoleSuccess extends CreateApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			newRole: {
				id: 7,
				created_at: "2025-03-21T02:40:22.799Z",
				updated_at: "2025-03-21T02:40:22.799Z",
				title: "role_title",
				label: "role_label",
				permissions: [
					{
						id: 1,
						title: "permission #1"
					},
					{
						id: 2,
						title: "permission #2"
					}
				]
			}
		},
	})
	data: { newRole: RoleEntity }
}

export class FindAllRolesSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			items: [
				{
					id: 1,
					created_at: "2025-03-19T16:35:18.052Z",
					updated_at: "2025-03-19T16:35:18.052Z",
					title: "Role #1",
					label: "Role #1"
				},
				{
					id: 2,
					created_at: "2025-03-19T16:35:18.060Z",
					updated_at: "2025-03-19T16:35:18.060Z",
					title: "Role #2",
					label: "Role #2"
				},
				{
					id: 3,
					created_at: "2025-03-20T16:44:00.564Z",
					updated_at: "2025-03-20T16:51:56.182Z",
					title: "Role #3",
					label: "Role #3"
				}
			],
			meta: {
				totalItems: 3,
				itemCount: 3,
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
	data: PaginatedResult<RoleEntity>;
}

export class FindOneRoleSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			id: 7,
			created_at: "2025-03-21T02:40:22.799Z",
			updated_at: "2025-03-21T02:40:22.799Z",
			title: "Role #1",
			label: "Role #1",
			permissions: [
				{
					id: 1,
					title: "Permission #1"
				},
				{
					id: 2,
					title: "Permission #2"
				}
			]
		},
	})
	data: RoleEntity;
}

export class UpdateRoleSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			updatedRole: {
				id: 7,
				created_at: "2025-03-21T02:40:22.799Z",
				updated_at: "2025-03-21T02:40:22.799Z",
				title: "role_title",
				label: "role_label",
				permissions: [
					{
						id: 1,
						title: "permission #1"
					},
					{
						id: 2,
						title: "permission #2"
					}
				]
			}
		},
	})
	data: { updatedRole: RoleEntity }
}

export class RemoveRoleSuccess extends OkApiBaseResponse { }
