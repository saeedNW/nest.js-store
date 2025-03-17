import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TJwtOtpPayload, TJwtRefreshTokenPayload } from '../types/jwt-payload.type';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RedisService } from 'src/modules/redis/redis.service';

@Injectable()
export class TokenService {
	constructor(
		// register jwt service
		private jwtService: JwtService,
		// Register i18n service
		private readonly i18n: I18nService,
		// Register redis service
		private readonly redis: RedisService
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

	/**
	 * Create and return JWT refresh token
	 * @param {TJwtRefreshTokenPayload} payload - Data that will be used in token
	 * @returns {Promise<string>} - JWT token
	 */
	async createRefreshToken(payload: TJwtRefreshTokenPayload): Promise<string> {
		// Create client's refresh token
		const refreshToken = this.jwtService.sign(payload, {
			secret: process.env.REFRESH_TOKEN_SECRET,
			expiresIn: "1y",
		});

		// Store the token in redis
		await this.redis.set(`refresh_${payload.phone}`, refreshToken, 60 * 60 * 24 * 365);

		return refreshToken;
	}

	/**
	 * Verify JWT refresh Token
	 * @param {string} token - Client's refresh Token
	 * @returns {TJwtRefreshTokenPayload} - Data object saved in JWT Payload
	 */
	verifyRefreshToken(token: string): TJwtRefreshTokenPayload {
		try {
			// Verify refresh token
			const payload = this.jwtService.verify(token, {
				secret: process.env.REFRESH_TOKEN_SECRET,
			});

			// Throw error in case of invalid payload
			if (typeof payload !== "object" || !("phone" in payload)) {
				throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.InvalidRefreshToken', {
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
