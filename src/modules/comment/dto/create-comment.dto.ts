import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Length } from "class-validator";
import { CommentType } from "../enum/comment-type.enum";

export class CreateCommentDto {
	@ApiProperty()
	@Length(5)
	@IsString()
	@Expose()
	text: string;

	@ApiProperty({enum:CommentType})
	@IsEnum(CommentType)
	@Expose()
	type: CommentType;

	@ApiProperty({description: "The ID of blog or product"})
	@Transform((param) => parseInt(param.value))
	@IsNumber()
	@Expose()
	targetId: number;

	@ApiPropertyOptional()
	@Transform((params) => (!params.value ? undefined : parseInt(params.value)))
	@IsOptional()
	@IsNumber()
	@Expose()
	parentId: number;
}
