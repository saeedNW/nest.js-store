import { ApiProperty } from "@nestjs/swagger";
import { FailureApiBaseResponse } from "src/common/abstracts/base.response";

/**
 * API process unauthorized swagger response
 */
export class UnauthorizedResponse extends FailureApiBaseResponse {
	@ApiProperty({
		description: "Response status code",
		example: 401,
	})
	statusCode: number;
}
