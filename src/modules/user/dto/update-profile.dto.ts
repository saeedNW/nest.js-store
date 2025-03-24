import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, Length } from "class-validator";
import { Expose } from "class-transformer";

export class UpdateProfileDto {
	@ApiPropertyOptional()
	@IsOptional()
	@Length(3, 100)
	@Expose()
	first_name: string;

	@ApiPropertyOptional()
	@IsOptional()
	@Length(3, 100)
	@Expose()
	last_name: string;

	@ApiPropertyOptional({ nullable: true })
	@IsOptional()
	@Length(10, 200)
	@Expose()
	bio: string;

	@ApiPropertyOptional({ nullable: true, example: "1996-02-22T12:01:26.487Z" })
	@IsOptional()
	@IsDateString()
	@Expose()
	birthday: string;
}

export class UpdateProfileImageDto {
	@ApiProperty({ format: "binary" })
	@Expose()
	image: string;
}
