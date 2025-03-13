import { ApiProperty } from "@nestjs/swagger";
import { FailureApiBaseResponse } from "src/common/abstracts/base.response";

/**
 * API process access denied swagger response
 */
export class AccessDeniedResponse extends FailureApiBaseResponse {
	@ApiProperty({
		description: "Response status code",
		example: 403,
	})
	statusCode: number;
}
