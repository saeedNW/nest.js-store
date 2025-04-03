import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { BlogStatus } from "../enums/status.enum";
import { stringToArray } from "src/common/utils/string-to-array.utility";

export class CreateBlogDto {
	@ApiProperty()
	@IsNotEmpty()
	@Length(10, 150)
	@Expose()
	title: string;

	@ApiProperty()
	@IsNotEmpty()
	@Length(10, 300)
	@Expose()
	description: string;

	@ApiProperty()
	@IsNotEmpty()
	@Length(100)
	@Expose()
	content: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Expose()
	image: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	@Expose()
	slug: string;

	@ApiPropertyOptional({ default: BlogStatus.DRAFT, enum: BlogStatus })
	@IsOptional()
	@IsEnum(BlogStatus)
	@Expose()
	status: BlogStatus;

	@ApiProperty({ type: String, isArray: true, description: "Category IDs" })
	@Transform((params) => (!params.value ? [] : stringToArray(params.value)))
	@IsArray()
	@IsString({ each: true })
	@Expose()
	categories: string[];
}
