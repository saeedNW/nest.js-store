import { Body, Controller, Get, Patch, Res } from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { I18nContext, I18nService } from "nestjs-i18n";
import { AuthDecorator } from "src/common/decorator/auth.decorator";
import { SmsService } from "src/modules/sms/sms.service";
import { UserService } from "../services/user.service";
import { SwaggerConsumes } from "src/configs/swagger.config";
import { UpdatePasswordDto } from "../dto/update-password.dto";
import { plainToClass } from "class-transformer";
import { UpdatePhoneDto } from "../dto/update-phone.dto";
import { Response } from "express";
import { SmsProvidersEnum } from "src/modules/sms/enum/providers.enum";
import { VerifyPhoneDto } from "../dto/verify-phone.dto";

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
	 * Retrieve the authenticated user's data.
	 */
	@Get()
	retrieveUser() {
		return this.userService.retrieveUser();
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
}
