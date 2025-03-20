import { ApiProperty } from "@nestjs/swagger";
import { Expose, Transform } from "class-transformer";
import { ArrayMinSize, IsNotEmpty, IsString } from "class-validator";
import { I18nContext } from 'nestjs-i18n';
import { stringToArray } from "src/common/utils/string-to-array.utility";

export class CreateRoleDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty({
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.EmptyRoleTitle'))
		}
	})
	@Expose()
	title: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty({
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.EmptyRoleLabel'))
		}
	})
	@Expose()
	label: string;

	@ApiProperty()
	@Transform((params) =>
		!params.value ? undefined : stringToArray(params.value)
	)
	@ArrayMinSize(1, {
		message(validationArguments) {
			return String(I18nContext.current()?.t('locale.ValidationMessages.EmptyRolePermissions'))
		}
	})
	@Expose()
	permissions: number[];
}
