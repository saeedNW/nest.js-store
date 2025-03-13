import { ApiProperty } from "@nestjs/swagger";
import { FailureApiBaseResponse } from "src/common/abstracts/base.response";

/**
 * APi process conflict swagger response
 */
export class ConflictResponse extends FailureApiBaseResponse {
	@ApiProperty({
		description: "Response status code",
		example: 409,
	})
	statusCode: number;
}
