import { Body, Controller, Delete, Patch, Put, UseInterceptors } from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { I18nService } from "nestjs-i18n";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { SmsService } from "src/modules/sms/sms.service";
import { ProfileService } from "../services/profile.service";
import { SwaggerConsumes } from "src/configs/swagger.config";
import { UpdateProfileDto, UpdateProfileImageDto } from "../dto/update-profile.dto";
import { plainToClass } from "class-transformer";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerImageUploader, TMulterFile } from "src/common/utils/multer.utility";
import { FileUploader } from "src/common/decorator/file-uploader.decorator";

@Controller('profile')
@ApiTags("Profile")
@AuthDecorator()
export class ProfileController {
	constructor(private readonly profileService: ProfileService) { }

	/**
	 * Updates or creates a user's profile
	 * @param {UpdateProfileDto} updateProfileDto - The updated profile data
	 */
	@Put("/update")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	updateProfile(@Body() updateProfileDto: UpdateProfileDto) {
		// filter client data and remove unwanted data
		updateProfileDto = plainToClass(UpdateProfileDto, updateProfileDto, {
			excludeExtraneousValues: true,
		});

		return this.profileService.updateProfile(updateProfileDto)
	}

	/**
	 * Updates the user's profile image
	 * @param {UpdateProfileImageDto} updateProfileImageDto - Data Object containing profile image update details
	 * @param {TMulterFile} image - The uploaded image file
	 */
	@Patch("/image")
	@UseInterceptors(FileInterceptor("image", multerImageUploader()))
	@ApiConsumes(SwaggerConsumes.MULTIPART_FORM_DATA)
	updateProfileImage(
		@Body() updateProfileImageDto: UpdateProfileImageDto,
		@FileUploader() image: TMulterFile
	) {
		// filter client data and remove unwanted data
		updateProfileImageDto = plainToClass(UpdateProfileImageDto, updateProfileImageDto, {
			excludeExtraneousValues: true,
		});

		return this.profileService.updateProfileImage(image)
	}

	/**
	 * Remove User's profile image
	 */
	@Delete("/image")
	removeProfileImage() {
		return this.profileService.removeProfileImage()
	}
}
