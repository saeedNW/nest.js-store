import { ApiProperty } from "@nestjs/swagger";
import { CreateApiBaseResponse, OkApiBaseResponse } from "src/common/abstracts/base.response";
import { AddressEntity } from "../entities/address.entity";

export class CreateAddressSuccess extends CreateApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			id: 4,
			created_at: "2025-03-26T18:03:22.596Z",
			updated_at: "2025-03-26T18:03:22.596Z",
			title: "title",
			province: "province",
			city: "city",
			address: "address",
			postal_code: 1234567890,
			location: {
				type: "Point",
				coordinates: [
					38.256487,
					26.256328
				]
			},
			userId: 1
		}
	})
	data: AddressEntity
}

export class findAllAddressesSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			addressList: [
				{
					id: 4,
					created_at: "2025-03-26T18:03:22.596Z",
					updated_at: "2025-03-26T18:03:22.596Z",
					title: "title",
					province: "province",
					city: "city",
					address: "address",
					postal_code: 1234567890,
					location: {
						type: "Point",
						coordinates: [
							38.256487,
							26.256328
						]
					},
					userId: 1
				}
			]
		}
	})
	data: AddressEntity[]
}

export class findOneAddressSuccess extends CreateApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			id: 4,
			created_at: "2025-03-26T18:03:22.596Z",
			updated_at: "2025-03-26T18:03:22.596Z",
			title: "title",
			province: "province",
			city: "city",
			address: "address",
			postal_code: 1234567890,
			location: {
				type: "Point",
				coordinates: [
					38.256487,
					26.256328
				]
			},
			userId: 1
		}
	})
	data: AddressEntity
}

export class UpdateAddressSuccess extends CreateApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: {
			id: 4,
			created_at: "2025-03-26T18:03:22.596Z",
			updated_at: "2025-03-26T18:03:22.596Z",
			title: "title",
			province: "province",
			city: "city",
			address: "address",
			postal_code: 1234567890,
			location: {
				type: "Point",
				coordinates: [
					38.256487,
					26.256328
				]
			},
			userId: 1
		}
	})
	data: AddressEntity
}

export class RemoveAddressSuccess extends OkApiBaseResponse { }
