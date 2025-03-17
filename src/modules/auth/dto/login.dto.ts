import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";
import { I18nContext } from 'nestjs-i18n';

export class LoginDto {
	@ApiProperty()
	@IsString()
	@IsPhoneNumber("IR", {
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.InvalidPhoneNumFormat'))
		},
	})
	@Expose()
	phone: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty({
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.EmptyPassword'))
		},
	})
	@Expose()
	password: string;
}
