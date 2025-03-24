import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsString, Length } from "class-validator";
import { I18nContext } from 'nestjs-i18n';

export class VerifyPhoneDto {
	@ApiProperty()
	@IsString()
	@Length(5, 5, {
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.InvalidOtpCodeFormat'))
		},
	})
	@Expose()
	code: string;
}
