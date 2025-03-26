import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Put, UseInterceptors } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { ProfileService } from "../services/profile.service";
import { SwaggerConsumes } from "src/configs/swagger.config";
import { UpdateProfileDto, UpdateProfileImageDto } from "../dto/update-profile.dto";
import { plainToClass } from "class-transformer";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerImageUploader, TMulterFile } from "src/common/utils/multer.utility";
import { FileUploader } from "src/common/decorator/file-uploader.decorator";
import { PermissionDecorator } from "src/common/decorator/permission.decorator";
import { Permissions } from "src/common/enums/permissions.enum";

@Controller('profile')
@ApiTags("Profile")
@AuthDecorator()
export class ProfileController {
	constructor(private readonly profileService: ProfileService) { }

	// ===================== User APIs =====================

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

	// ===================== Admin APIs =====================

	/**
	 * Updates or creates a profile's profile
	 * @param {UpdateProfileDto} updateProfileDto - The updated profile data
	 */
	@Put("/update/:userId")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@PermissionDecorator(Permissions['Users.data'])
	@ApiOperation({ summary: "[ RBAC ]" })
	updateUserProfile(
		@Param('userId', ParseIntPipe) userId: number,
		@Body() updateProfileDto: UpdateProfileDto
	) {
		// filter client data and remove unwanted data
		updateProfileDto = plainToClass(UpdateProfileDto, updateProfileDto, {
			excludeExtraneousValues: true,
		});

		return this.profileService.updateUserProfile(userId, updateProfileDto)
	}

	/**
	 * Updates the user's profile image
	 * @param {number} id - profile's ID
	 * @param {UpdateProfileImageDto} updateProfileImageDto - Data Object containing profile image update details
	 * @param {TMulterFile} image - The uploaded image file
	 */
	@Patch("/image/:id")
	@UseInterceptors(FileInterceptor("image", multerImageUploader()))
	@ApiConsumes(SwaggerConsumes.MULTIPART_FORM_DATA)
	@PermissionDecorator(Permissions['Users.data'])
	@ApiOperation({ summary: "[ RBAC ]" })
	updateUserProfileImage(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateProfileImageDto: UpdateProfileImageDto,
		@FileUploader() image: TMulterFile
	) {
		// filter client data and remove unwanted data
		updateProfileImageDto = plainToClass(UpdateProfileImageDto, updateProfileImageDto, {
			excludeExtraneousValues: true,
		});

		return this.profileService.updateUserProfileImage(id, image)
	}

	/**
	 * Remove User's profile image
	 * @param {number} id - Profile's ID
	 */
	@Delete("/image/:id")
	@PermissionDecorator(Permissions['Users.data'])
	@ApiOperation({ summary: "[ RBAC ]" })
	removeUserProfileImage(@Param('id', ParseIntPipe) id: number) {
		return this.profileService.removeUserProfileImage(id)
	}
}
