import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsMobilePhone, IsPhoneNumber, IsString } from "class-validator";
import { I18nContext } from "nestjs-i18n";

/**
 * Create a dto for the process of updating user's phone number
 */
export class UpdatePhoneDto {
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
