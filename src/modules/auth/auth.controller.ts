import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from 'src/configs/swagger.config';
import { plainToClass } from 'class-transformer';
import { SmsService } from '../sms/sms.service';
import { SmsProvidersEnum } from '../sms/enum/providers.enum';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { CheckOtpDto } from './dto/check-otp.dto';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginDto } from './dto/login.dto';
import { AccountExistenceResponses, CheckOtpResponses, LoginResponses, RefreshTokenResponses, SendOtpResponses } from './decorators/swagger-responses.decorator';
import { AuthDecorator } from 'src/common/decorator/auth.decorator';

@Controller("auth")
@ApiTags("Auth")
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly smsService: SmsService,
		private readonly i18n: I18nService
	) { }

	/**
	 * Check account existence
	 * @param {SendOtpDto} sendOtpDto - Client data need to check account existence
	 * @returns Return true if account exists otherwise return false
	 */
	@Post("/exists")
	@HttpCode(200)
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@ApiOperation({ summary: "Check if an account already exists" })
	@AccountExistenceResponses()
	async accountExistence(@Body() sendOtpDto: SendOtpDto) {
		// filter client data and remove unwanted data
		sendOtpDto = plainToClass(SendOtpDto, sendOtpDto, {
			excludeExtraneousValues: true,
		});

		// Check account existence
		return await this.authService.accountExistence(sendOtpDto);
	}

	/**
	 * create and send OTP code to user's phone number
	 * @param {SendOtpDto} sendOtpDto - Client data need to generate and send OTP code
	 */
	@Post("/send-otp")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@SendOtpResponses()
	async sendOtp(@Body() sendOtpDto: SendOtpDto) {
		// filter client data and remove unwanted data
		sendOtpDto = plainToClass(SendOtpDto, sendOtpDto, {
			excludeExtraneousValues: true,
		});

		// Generate OTP code
		const otp: string = await this.authService.createOtp(sendOtpDto);

		// Send OTP code to user's phone number
		await this.smsService.sendOtp(sendOtpDto.phone, otp, SmsProvidersEnum.SMS_IR)

		const response: { message: string, code?: string } = {
			message: this.i18n.t('locale.AuthMessages.SentOTP', { lang: I18nContext?.current()?.lang }),
		}

		if (process.env.NODE_ENV === "dev") {
			response.code = otp
		}

		return response;
	}

	/**
	 * Validating client's OTP code
	 * @param checkOtpDto - Client OTP code
	 */
	@Post("/check-otp")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@CheckOtpResponses()
	checkOtp(@Body() checkOtpDto: CheckOtpDto) {
		// filter client data and remove unwanted data
		checkOtpDto = plainToClass(CheckOtpDto, checkOtpDto, {
			excludeExtraneousValues: true,
		});

		return this.authService.checkOtp(checkOtpDto);
	}

	/**
	 * Refresh client's access token
	 * @param refreshTokenDto - Client refresh token
	 */
	@Post("/refresh")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@ApiOperation({ summary: "tokens renewal using refresh token" })
	@RefreshTokenResponses()
	refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
		// filter client data and remove unwanted data
		refreshTokenDto = plainToClass(RefreshTokenDto, refreshTokenDto, {
			excludeExtraneousValues: true,
		});

		return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
	}

	/**
	 * Clients' login process
	 * @param {LoginDto} loginDto - Client credentials
	 */
	@Post("/login")
	@ApiConsumes(SwaggerConsumes.URL_ENCODED, SwaggerConsumes.JSON)
	@ApiOperation({ summary: "Login using phone and password" })
	@LoginResponses()
	register(@Body() loginDto: LoginDto) {
		// filter client data and remove unwanted data
		loginDto = plainToClass(LoginDto, loginDto, {
			excludeExtraneousValues: true,
		});

		return this.authService.login(loginDto);
	}

	/**
	 * Logout user from system by removing access and refresh tokens from database
	 */
	@Get("/logout")
	@ApiOperation({ summary: "Remove user access and refresh token" })
	@AuthDecorator()
	logout() {
		return this.authService.logout()
	}
}
