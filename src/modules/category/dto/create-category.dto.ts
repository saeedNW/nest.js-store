import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { CategoryType } from "../enum/category-type.enum";

export class CreateCategoryDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	@Expose()
	title: string;

	@ApiProperty({ enum: CategoryType })
	@IsEnum(CategoryType)
	@Expose()
	type: CategoryType;

	@ApiPropertyOptional()
	@Transform((params) => (!params.value ? undefined : parseInt(params.value)))
	@IsOptional()
	@IsNumber()
	@Expose()
	parentId: number;
}
