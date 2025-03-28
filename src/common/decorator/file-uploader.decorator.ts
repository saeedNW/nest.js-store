import {
	FileTypeValidator,
	MaxFileSizeValidator,
	ParseFilePipe,
	UploadedFile,
} from "@nestjs/common";
import { I18nContext } from 'nestjs-i18n';

/**
 * custom decorators for handling file upload in controllers.
 * Combines Uploaded Files with a ParseFilePipe into a custom decorator
 * to make the controller code cleaner and easier to maintain.
 */

export function ImageUploader() {
	return UploadedFile(
		new ParseFilePipe({
			validators: [
				new MaxFileSizeValidator({
					maxSize: 5 * 1024 * 1024,
					message(maxSize) {
						return String(I18nContext.current()?.t('locale.MulterMessages.LargeFile'))
					},
				}),
				new FileTypeValidator({ fileType: "image/(png|jpg|jpeg|webp)" }),
			],
		})
	);
}

export function OptionalImageUploader() {
	return UploadedFile(
		new ParseFilePipe({
			validators: [
				new MaxFileSizeValidator({
					maxSize: 5 * 1024 * 1024,
					message(maxSize) {
						return String(I18nContext.current()?.t('locale.MulterMessages.LargeFile'))
					}
				}),
				new FileTypeValidator({
					fileType: "image/(png|jpg|jpeg|webp)",
				}),
			],
			fileIsRequired: false,
		})
	);
}
