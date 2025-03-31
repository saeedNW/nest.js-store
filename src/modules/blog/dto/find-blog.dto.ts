import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsString } from 'class-validator';

export class FindBlogsDto {
	@ApiPropertyOptional({ description: "Search by title, description, content, slug, or author's name" })
	search: string;
}

export class FindOneBlogDto {
	@ApiProperty({
		description: 'Blog ID (as a number) or slug (as a string)',
		example: '123 or my-blog-title',
	})
	@IsString()
	find: string;
}
