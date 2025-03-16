import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsPhoneNumber, IsString, ValidationArguments } from "class-validator";
import { I18nContext } from 'nestjs-i18n';

export class SendOtpDto {
	@ApiProperty()
	@IsString()
	@IsPhoneNumber("IR", {
		message: (args: ValidationArguments) =>
			String(I18nContext.current()?.t('locale.ValidationMessages.InvalidPhoneNum')),
	})
	@Expose()
	phone: string;
}
