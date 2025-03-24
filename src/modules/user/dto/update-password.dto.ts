import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";
import { I18nContext } from 'nestjs-i18n';
import { ValidateConfirmedPassword } from "../decorators/confirm-password.decorator";

export class UpdatePasswordDto {
	@ApiPropertyOptional({
		description: "Optional only for the first time, due to empty password field"
	})
	@IsOptional()
	@Expose()
	currentPassword: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty({
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.EmptyNewPassword'))
		},
	})
	@Expose()
	newPassword: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty({
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.EmptyConfirmPassword'))
		},
	})
	@ValidateConfirmedPassword("newPassword", (args) =>
		String(I18nContext.current()?.t('locale.ValidationMessages.PasswordMismatch'))
	)
	@Expose()
	confirmPassword: string;
}
