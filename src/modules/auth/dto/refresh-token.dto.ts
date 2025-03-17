import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsJWT, IsNotEmpty } from "class-validator";
import { I18nContext } from 'nestjs-i18n';

export class RefreshTokenDto {
	@ApiProperty()
	@IsJWT({
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.InvalidRefreshTokenFormat'))
		},
	})
	@Expose()
	refreshToken: string;
}
