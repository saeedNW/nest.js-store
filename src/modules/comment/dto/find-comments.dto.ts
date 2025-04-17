import { ApiProperty } from "@nestjs/swagger";
import { CommentType } from "../enum/comment-type.enum";

export class FindCommentsDto {
	@ApiProperty({
		description: 'Comment target type',
		example: CommentType.BLOG,
		enum: CommentType
	})
	type: CommentType

	@ApiProperty({ description: 'The ID of the blog or product' })
	targetId: number
}
