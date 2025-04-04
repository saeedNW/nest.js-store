import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BlogStatus } from '../enums/status.enum';

export class FindBlogsDto {
	@ApiPropertyOptional({ description: "Search by title, description, content, slug, or author's name" })
	search: string;

	@ApiPropertyOptional({ description: "Filter by category title" })
	category: string;

	@ApiPropertyOptional({ description: "Filter by blog published status", enum: BlogStatus, default: BlogStatus.PUBLISHED })
	@IsOptional()
	@IsEnum(BlogStatus)
	status: BlogStatus;
}

export class FindOneBlogDto {
	@ApiProperty({
		description: 'Blog ID (as a number) or slug (as a string)',
		example: '123 or my-blog-title',
	})
	@IsString()
	find: string;
}
