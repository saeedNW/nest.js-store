import { Body, Controller, Post } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/configs/swagger.config';
import { plainToClass } from 'class-transformer';
import { SmsService } from '../../sms/sms.service';
import { SmsProvidersEnum } from '../../sms/enum/providers.enum';
import { AuthService } from '../services/auth.service';
import { SendOtpDto } from '../dto/send-otp.dto';
import { CheckOtpDto } from '../dto/check-otp.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly smsService: SmsService,
		private readonly i18n: I18nService
	) { }

	/**
	 * create and send OTP code to user's phone number
	 * @param {SendOtpDto} sendOtpDto - Client data need to generate and send OTP code
	 */
	@Post("/send-otp")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	async sendOtp(@Body() sendOtpDto: SendOtpDto) {
		// filter client data and remove unwanted data
		sendOtpDto = plainToClass(SendOtpDto, sendOtpDto, {
			excludeExtraneousValues: true,
		});

		// Generate OTP code
		const otp: string = await this.authService.createOtp(sendOtpDto);

		// Send OTP code to user's phone number
		if (process.env?.NODE_ENV === "prod") {
			await this.smsService.sendOtp(sendOtpDto.phone, otp, SmsProvidersEnum.SMS_IR)
		}

		return {
			message: this.i18n.t('locale.AuthMessages.SentOTP', { lang: I18nContext?.current()?.lang }),
			otp: process.env.NODE_ENV === "dev" ? otp : undefined,
		}
	}

	/**
	 * Validating client's OTP code
	 * @param checkOtpDto - Client OTP code
	 */
	@Post("/check-otp")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	checkOtp(@Body() checkOtpDto: CheckOtpDto) {
		// filter client data and remove unwanted data
		checkOtpDto = plainToClass(CheckOtpDto, checkOtpDto, {
			excludeExtraneousValues: true,
		});

		return this.authService.checkOtp(checkOtpDto);
	}
}
