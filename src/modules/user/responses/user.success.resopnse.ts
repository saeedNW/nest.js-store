import { ApiProperty } from "@nestjs/swagger";
import { OkApiBaseResponse } from "src/common/abstracts/base.response";
import { UserEntity } from "../entities/user.entity";
import { ProfileEntity } from "../entities/profile.entity";
import { RoleEntity } from "src/modules/role/entities/role.entity";
import { PaginatedResult } from "src/common/utils/typeorm.pagination.utility";

export class RetrieveUserSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			id: 1,
			created_at: "2025-03-24T09:02:12.954Z",
			updated_at: "2025-03-25T13:38:41.343Z",
			phone: "09171111111",
			new_phone: null,
			verify_phone: true,
			profileId: 1,
			profile: {
				id: 1,
				first_name: "سعید",
				last_name: "نوروزی",
				bio: null,
				profile_image: null,
				birthday: null,
				userId: 1,
				updated_at: "2025-03-25T11:34:37.592Z"
			},
			role: {
				id: 1,
				created_at: "2025-03-24T08:52:30.775Z",
				updated_at: "2025-03-24T08:52:30.775Z",
				title: "admin",
				label: "Admin"
			}
		},
	})
	data: UserEntity & { profile: ProfileEntity } & { role: RoleEntity }
}

export class UpdatePhoneSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data (Development Environment Only)",
		example: { code: "78363" },
	})
	data: { code: string };
}

export class FindAllUsersSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data (Development Environment Only)",
		example: {
			items: [
				{
					id: 1,
					created_at: "2025-03-24T09:02:12.954Z",
					updated_at: "2025-03-25T13:38:41.343Z",
					phone: "09171111111",
					new_phone: null,
					verify_phone: true,
					profileId: 1,
					profile: {
						id: 1,
						first_name: "سعید",
						last_name: "نوروزی",
						bio: null,
						profile_image: null,
						birthday: null,
						userId: 1,
						updated_at: "2025-03-25T11:34:37.592Z"
					}
				},
				{
					id: 2,
					created_at: "2025-03-25T11:36:07.063Z",
					updated_at: "2025-03-26T03:17:19.938Z",
					phone: "09364139756",
					new_phone: null,
					verify_phone: true,
					profileId: null,
					profile: null
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
				first: "http://localhost:3000/user/list?page=1&limit=10",
				previous: "",
				next: "",
				last: "http://localhost:3000/user/list?page=1&limit=10"
			}
		}
	})
	data: PaginatedResult<UserEntity>
}

export class FindOneUserSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data (Development Environment Only)",
		example: {
			id: 1,
			created_at: "2025-03-24T09:02:12.954Z",
			updated_at: "2025-03-25T13:38:41.343Z",
			phone: "09171111111",
			new_phone: null,
			verify_phone: true,
			profileId: 1,
			profile: {
				id: 1,
				first_name: "سعید",
				last_name: "نوروزی",
				bio: null,
				profile_image: null,
				birthday: null,
				userId: 1,
				updated_at: "2025-03-25T11:34:37.592Z"
			},
			role: {
				id: 1,
				created_at: "2025-03-24T08:52:30.775Z",
				updated_at: "2025-03-24T08:52:30.775Z",
				title: "admin",
				label: "Admin"
			}
		}
	})
	data: UserEntity
}

export class VerifyPhoneSuccess extends OkApiBaseResponse { }
export class UpdatePasswordSuccess extends OkApiBaseResponse { }
export class UpdateUserPasswordSuccess extends OkApiBaseResponse { }
export class UpdateUserPhoneSuccess extends OkApiBaseResponse { }
export class AssignRoleSuccess extends OkApiBaseResponse { }
