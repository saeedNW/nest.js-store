import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TJwtOtpPayload } from '../types/jwt-payload.type';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class TokenService {
	constructor(
		// register jwt service
		private jwtService: JwtService,
		// Register i18n service
		private readonly i18n: I18nService
	) { }

	/**
	 * Create and return JWT access token
	 * @param {JwtPayload} payload - Data that will be used in token
	 * @returns {string} - JWT token
	 */
	createAccessToken(payload: TJwtOtpPayload): string {
		return this.jwtService.sign(payload, {
			secret: process.env.ACCESS_TOKEN_SECRET,
			expiresIn: "30d",
		});
	}

	/**
	 * Verify JWT access Token
	 * @param {string} token - Client's access Token
	 * @returns {TJwtOtpPayload} - Data object saved in JWT Payload
	 */
	verifyAccessToken(token: string): TJwtOtpPayload {
		try {
			// Verify access token
			const payload = this.jwtService.verify(token, {
				secret: process.env.ACCESS_TOKEN_SECRET,
			});

			// Throw error in case of invalid payload
			if (typeof payload !== "object" || !("userId" in payload)) {
				throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.InvalidAccessToken', {
					lang: I18nContext?.current()?.lang
				}));
			}

			return payload;
		} catch (error) {
			throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.AuthFailed', {
				lang: I18nContext?.current()?.lang
			}));
		}
	}
}
