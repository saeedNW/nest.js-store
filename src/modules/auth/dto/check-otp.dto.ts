import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsPhoneNumber, IsString, Length } from "class-validator";
import { I18nContext } from 'nestjs-i18n';

export class CheckOtpDto {
	@ApiProperty()
	@IsString()
	// @IsPhoneNumber("IR", { message: "Invalid phone number" })
	@IsPhoneNumber("IR", {
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.InvalidPhoneNumFormat'))
		},
	})
	@Expose()
	phone: string;

	@ApiProperty()
	@IsString()
	// @Length(5, 5, { message: "Invalid OTP code" })
	@Length(5, 5, {
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.InvalidOtpCodeFormat'))
		},
	})
	@Expose()
	code: string;
}
