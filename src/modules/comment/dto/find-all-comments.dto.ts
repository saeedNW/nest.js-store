import { ApiPropertyOptional } from "@nestjs/swagger"
import { CommentType } from "../enum/comment-type.enum"
import { Expose, Transform } from "class-transformer"
import { IsBoolean } from "class-validator"
import { toBoolean } from "src/common/utils/functions.utils"

export class FindAllCommentsDto {
	@ApiPropertyOptional({
		description: 'Comment target type',
		example: CommentType.BLOG,
		enum: CommentType
	})
	@Expose()
	type: CommentType

	@ApiPropertyOptional({
		description: 'Comment accepted status',
		type: Boolean,
		default: true
	})
	@Transform((params) => (!IsBoolean(params.value) ? undefined : toBoolean(params.value)))
	@Expose()
	accepted: boolean
}
