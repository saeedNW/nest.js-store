import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Res, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthDecorator } from 'src/common/decorator/auth.decorator';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/configs/swagger.config';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { plainToClass } from 'class-transformer';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { SmsService } from '../sms/sms.service';
import { SmsProvidersEnum } from '../sms/enum/providers.enum';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { Response } from 'express';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { UpdateProfileDto, UpdateProfileImageDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerImageUploader, TMulterFile } from 'src/common/utils/multer.utility';
import { FileUploader } from 'src/common/decorator/file-uploader.decorator';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('user')
@ApiTags("User")
@AuthDecorator()
export class UserController {
	constructor(
		private readonly userService: UserService,
		private readonly smsService: SmsService,
		private readonly i18n: I18nService
	) { }

	/**
	 * Retrieve user data
	 */
	@Get()
	getProfile() {
		return this.userService.getProfile();
	}

	/**
	 * Update user password
	 * @param {UpdatePasswordDto} updatePasswordDto - client data for new password
	 */
	@Patch('/update-password')
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
		// filter client data and remove unwanted data
		updatePasswordDto = plainToClass(UpdatePasswordDto, updatePasswordDto, {
			excludeExtraneousValues: true,
		});

		return this.userService.updatePassword(updatePasswordDto);
	}

	/**
	 * Update user's phone number
	 * @param {UpdatePhoneDto} updatePhoneDto - Client data for new phone
	 * @param {Response} response - Response Object
	 */
	@Patch("/update-phone")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	async updatePhone(
		@Body() updatePhoneDto: UpdatePhoneDto,
		@Res({ passthrough: true }) response: Response
	) {
		// filter client data and remove unwanted data
		updatePhoneDto = plainToClass(UpdatePhoneDto, updatePhoneDto, {
			excludeExtraneousValues: true,
		});

		// Generate new OTP code for phone verification
		const otp: string = await this.userService.updatePhone(updatePhoneDto, response);

		// Send OTP code to user's phone number
		await this.smsService.sendOtp(updatePhoneDto.phone, otp, SmsProvidersEnum.SMS_IR)

		const res: { message: string, code?: string } = {
			message: this.i18n.t('locale.AuthMessages.SentOTP', {
				lang: I18nContext?.current()?.lang
			}),
		}

		if (process.env.NODE_ENV === "dev") {
			res.code = otp
		}

		return res;
	}

	/**
	 * Update phone verification
	 * @param {VerifyPhoneDto} verifyPhoneDto - Client's data
	 */
	@Patch("/verify-phone")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
		return this.userService.verifyPhone(verifyPhoneDto.code);
	}

	/**
	 * Updates or creates a user's profile
	 * @param {UpdateProfileDto} updateProfileDto - The updated profile data
	 */
	@Put("/update-profile")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	updateProfile(@Body() updateProfileDto: UpdateProfileDto) {
		// filter client data and remove unwanted data
		updateProfileDto = plainToClass(UpdateProfileDto, updateProfileDto, {
			excludeExtraneousValues: true,
		});

		return this.userService.updateProfile(updateProfileDto)
	}

	/**
	 * Updates the user's profile image
	 * @param {UpdateProfileImageDto} updateProfileImageDto - Data Object containing profile image update details
	 * @param {TMulterFile} image - The uploaded image file
	 */
	@Patch("/profile-image")
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

		return this.userService.updateProfileImage(image)
	}

	/**
	 * Remove User's profile image
	 */
	@Delete("/profile-image")
	removeProfileImage() {
		return this.userService.removeProfileImage()
	}

	/**
	 * Create new address for user
	 * @param {CreateAddressDto} createAddressDto - Client's address data
	 */
	@Post("/address")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	createAddress(@Body() createAddressDto: CreateAddressDto) {
		// filter client data and remove unwanted data
		createAddressDto = plainToClass(CreateAddressDto, createAddressDto, {
			excludeExtraneousValues: true,
		});

		return this.userService.createAddress(createAddressDto)
	}

	/**
	 * Find user's addresses list
	 */
	@Get('/address')
	findAllAddresses() {
		return this.userService.findAllAddresses()
	}

	/**
	 * Retrieve single address data
	 * @param id - Address's ID
	 */
	@Get("/address/:id")
	findOneAddress(@Param('id', ParseIntPipe) id: number) {
		return this.userService.findOneAddress(id)
	}

	/**
	 * Update user's address
	 * @param {UpdateAddressDto} updateAddressDto - Client's address data
	 * @param {number} id - Address's ID
	 */
	@Put("/address/:id")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	updateAddress(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateAddressDto: UpdateAddressDto
	) {
		// filter client data and remove unwanted data
		updateAddressDto = plainToClass(UpdateAddressDto, updateAddressDto, {
			excludeExtraneousValues: true,
		});

		return this.userService.updateAddress(id, updateAddressDto)
	}

	/**
	 * Remove user's address by ID
	 * @param {number} id - Address ID
	 */
	@Delete("/address/:id")
	removeAddress(@Param('id', ParseIntPipe) id: number) {
		return this.userService.removeAddress(id)
	}




	//* Admin APIs
	// TODO: retrieve all users list
	// todo: retrieve single user
	// todo: change user phone
	// todo: change user password
	// todo: update user role

	// todo: retrieve user profile
	// todo: update user profile
	// todo: update user profile image
	// todo: remove user profile image

	// todo: add user address
	// todo: retrieve user address list
	// todo: retrieve user single address
	// todo: update user address
	// todo: remove user address

}
