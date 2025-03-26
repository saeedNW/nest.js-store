import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { fixNumbers } from 'src/common/utils/number.utility';

export class FindUsersDto {
	@ApiPropertyOptional()
	@Transform((params) => (!params.value ? undefined : fixNumbers(params.value)))
	@IsOptional()
	@IsString()
	@Expose()
	search: string;
}
