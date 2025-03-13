import { ApiProperty } from "@nestjs/swagger";
import { FailureApiBaseResponse } from "src/common/abstracts/base.response";

/**
 * API process result not found swagger response
 */
export class NotFoundResponse extends FailureApiBaseResponse {
	@ApiProperty({
		description: "Response status code",
		example: 404,
	})
	statusCode: number;
}
