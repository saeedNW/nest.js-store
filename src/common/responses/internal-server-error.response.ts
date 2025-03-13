import { ApiProperty } from "@nestjs/swagger";
import { FailureApiBaseResponse } from "src/common/abstracts/base.response";

/**
 * Internal server error swagger response
 */
export class InternalServerErrorResponse extends FailureApiBaseResponse {
	@ApiProperty({
		description: "Response status code",
		example: 500,
	})
	statusCode: number;
}
