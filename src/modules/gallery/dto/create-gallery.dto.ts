import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateGalleryDto {
	@ApiProperty()
	@IsNotEmpty()
	@IsString()
	@Expose()
	name: string;

	@ApiProperty({ format: "binary" })
	@Expose()
	file: string;

	@ApiPropertyOptional()
	@Expose()
	alt: string;
}
