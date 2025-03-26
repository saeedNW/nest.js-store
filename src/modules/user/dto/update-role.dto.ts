import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { I18nContext } from 'nestjs-i18n';

export class UpdateUserRoleDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty({
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.EmptyRoleField'))
		}
	})
	@Expose()
	roleTitle: string;
}
