import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsPhoneNumber, IsString } from "class-validator";
import { I18nContext } from 'nestjs-i18n';

export class SendOtpDto {
	@ApiProperty()
	@IsString()
	@IsPhoneNumber("IR", {
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.InvalidPhoneNumFormat'))
		},
	})
	@Expose()
	phone: string;
}
