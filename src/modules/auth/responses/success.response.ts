import { ApiProperty } from "@nestjs/swagger";
import { CreateApiBaseResponse, OkApiBaseResponse } from "src/common/abstracts/base.response";

export class AccountExistenceSuccess extends OkApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: { exists: true },
	})
	data: { code: boolean };
}

export class SendOtpSuccess extends CreateApiBaseResponse {
	@ApiProperty({
		description: "Response data (Development Environment Only)",
		example: { code: "78363" },
	})
	data: { code: string };
}


export class CheckOtpSuccess extends CreateApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: { accessToken: "JWT Token", refreshToken: "JWT Token" },
	})
	data: { accessToken: string, refreshToken: string };
}

export class RefreshTokenSuccess extends CreateApiBaseResponse {
	@ApiProperty({
		description: "Response data",
		example: { accessToken: "JWT Token", refreshToken: "JWT Token" },
	})
	data: { accessToken: string, refreshToken: string };
}
