import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Length, Matches, Max, Min } from "class-validator";
import { Expose, Transform } from "class-transformer";
import { I18nContext } from "nestjs-i18n";
import { fixNumbers } from "src/common/utils/number.utility";

export class CreateAddressDto {
	@ApiProperty()
	@IsString()
	@Length(3, 50)
	@Expose()
	title: string;

	@ApiProperty()
	@Length(2, 50)
	@Expose()
	province: string;

	@ApiProperty()
	@Length(2, 50)
	@Expose()
	city: string;

	@ApiProperty()
	@Length(10, 150)
	@Expose()
	address: string;

	@ApiProperty()
	@Transform((params) => (!params.value ? undefined : parseInt(fixNumbers(params.value).toString())))
	@IsNumber()
	@Expose()
	postal_code: string;

	@ApiProperty()
	@Transform((params) => (!params.value ? undefined : Number(fixNumbers(params.value).toString())))
	@IsNumber({ maxDecimalPlaces: 6 })
	@Min(-90, {
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.InvalidLatitude'))
		},
	})
	@Max(90, {
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.InvalidLatitude'))
		},
	})
	@Expose()
	latitude: number;

	@ApiProperty()
	@Transform((params) => (!params.value ? undefined : Number(fixNumbers(params.value).toString())))
	@IsNumber({ maxDecimalPlaces: 6 })
	@Min(-180, {
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.InvalidLongitude'))
		},
	})
	@Max(180, {
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.InvalidLongitude'))
		},
	})
	@Expose()
	longitude: number;
}
