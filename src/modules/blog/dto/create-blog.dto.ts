import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, Length } from "class-validator";
import { BlogStatus } from "../enums/status.enum";

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
	@Expose()
	image: string;

	@ApiPropertyOptional()
	@Expose()
	slug: string;

	@ApiPropertyOptional({ default: BlogStatus.DRAFT, enum: BlogStatus })
	@IsOptional()
	@IsEnum(BlogStatus)
	@Expose()
	status: string;

}
