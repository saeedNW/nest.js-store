import { BadRequestException, Inject, Injectable, NotFoundException, Scope, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { randomInt } from 'crypto';
import { TokenService } from './token.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { CheckOtpDto } from './dto/check-otp.dto';
import { ProfileEntity } from 'src/modules/user/entities/profile.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { RedisService } from 'src/modules/redis/redis.service';
import { TOtpObject } from './types/otp.type';
import { LoginDto } from './dto/login.dto';
import { compareSync } from 'bcrypt';
import { fixDataNumbers } from 'src/common/utils/number.utility';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { OtpMethods } from 'src/common/enums/otp-methods.enum';
import { RoleService } from '../role/role.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
	constructor(
		// inject user repository
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		// Make the current request accessible in service
		@Inject(REQUEST)
		private request: Request,
		// Register token service
		private tokenService: TokenService,
		// Register i18n service
		private readonly i18n: I18nService,
		// Register redis service
		private readonly redis: RedisService,
		// Register role service
		private readonly roleService: RoleService,

	) { }

	/**
	 * Check account existence
	 * @param {SendOtpDto} sendOtpDto - Client data need to check account existence
	 * @returns Return true if account exists otherwise return false
	 */
	async accountExistence(sendOtpDto: SendOtpDto) {
		// extract phone number from client data
		const { phone } = fixDataNumbers(sendOtpDto);

		// retrieve user's data from database
		let user: UserEntity | null = await this.getUser(phone);

		return { exists: !!user };
	}

	/**
	 * Create OTP code
	 * @param {SendOtpDto} sendOtpDto - Client data need to generate and send OTP code
	 * @returns {Promise<string>} - Return the generated OTP code
	 */
	async createOtp(sendOtpDto: SendOtpDto): Promise<string> {
		// extract phone number from client data
		const { phone } = fixDataNumbers(sendOtpDto);

		// retrieve user's data from database
		let user: UserEntity | null = await this.getUser(phone);

		if (!user) {
			// Retrieve user role
			const role = await this.roleService.findOneByTitle('user');

			// create new user and save it in database if user not found
			user = this.userRepository.create({ phone, role });
			user = await this.userRepository.save(user);
		}

		// Generates a new OTP
		const otp: TOtpObject = await this.saveOtp(user.id);

		// Return the OTP code
		return otp.code;
	}

	/**
	 * Retrieve user's data based on the given phone number
	 * @param {string} phone - The input data sent by client
	 */
	async getUser(phone: string) {
		return await this.userRepository.findOneBy({ phone });
	}

	/**
	 * Generates a new OTP and stores it in the database.
	 * @param {number} userId - The user's ID
	 * @param {string} [method] - The method that the OTP belongs to
	 * @returns {Promise<TOtpObject>} - The created or updated OTP
	 */
	async saveOtp(userId: number, method: string = OtpMethods.AUTH): Promise<TOtpObject> {
		// Generate OTP data object
		const otp: TOtpObject = {
			// Generate a random 5-digit OTP code
			code: randomInt(10000, 99999).toString(),
			// Set expiration time to 2 minutes from now
			expires_in: new Date(Date.now() + 2 * 60 * 1000),
			// Set the user's ID
			userId,
			// Set the method that the OTP belongs to
			method
		}

		// Check if an existing OTP is associated with the user
		const existingOtp: TOtpObject | null = await this.redis.get(`OTP_${userId}`)

		// If an OTP exists and is still valid, throw an error
		if (existingOtp && new Date(existingOtp.expires_in) > new Date()) {
			throw new BadRequestException(this.i18n.t('locale.AuthMessages.OTPNotExpired', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Save the OTP in redis
		await this.redis.set(`OTP_${userId}`, otp, 60 * 2)

		return otp;
	}

	/**
	 * Verifies an OTP code and logs in the user
	 * @param {CheckOtpDto} checkOtpDto - DTO containing phone and OTP code
	 */
	async checkOtp(checkOtpDto: CheckOtpDto) {
		// extract phone number and OTP code from client data
		const { code, phone } = fixDataNumbers(checkOtpDto);

		// Retrieve user's data
		const user = await this.getUser(phone);
		if (!user) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.AccountNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Verify client's OTP code
		this.verifyOtp(user.id, code)

		// Generate access and refresh tokens concurrently
		const [accessToken, refreshToken] = await Promise.all([
			this.tokenService.createAccessToken({ userId: user.id }),
			this.tokenService.createRefreshToken({ phone: user.phone }),
		]);

		// Update user access token
		const updateUserData: { token: string, verify_phone?: boolean } = {
			token: accessToken
		}

		// Verify user's phone number if not already verified
		if (!user.verify_phone) {
			updateUserData.verify_phone = true
		}

		// Update user data
		await this.userRepository.update({ id: user.id }, updateUserData);

		return {
			message: this.i18n.t('locale.AuthMessages.LoginSuccess', { lang: I18nContext?.current()?.lang }),
			accessToken,
			refreshToken
		};
	}

	/**
	 * Refresh client's access token
	 * @param {string} token - Client's refresh token
	 * @returns Return new access and refresh tokens
	 */
	async refreshAccessToken(token: string) {
		// retrieve user's data using refresh token
		const user: UserEntity = await this.validateRefreshToken(token);

		// Generate new access and refresh tokens concurrently
		const [accessToken, refreshToken] = await Promise.all([
			this.tokenService.createAccessToken({ userId: user.id }),
			this.tokenService.createRefreshToken({ phone: user.phone }),
		]);

		// Update user access token
		await this.userRepository.update({ id: user.id }, { token: accessToken });

		return {
			message: this.i18n.t('locale.AuthMessages.LoginSuccess', { lang: I18nContext?.current()?.lang }),
			accessToken,
			refreshToken
		};
	}

	/**
	 * Clients' login process
	 * @param {LoginDto} loginDto - Client credentials
	 */
	async login(loginDto: LoginDto) {
		// extract phone number and password from client data
		const { password, phone } = fixDataNumbers(loginDto);

		// Retrieve user's data
		const user = await this.getUser(phone);
		if (!user) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.AccountNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Verify if user's phone number is verified
		if (!user.verify_phone) {
			throw new BadRequestException(this.i18n.t('locale.AuthMessages.NotVerifiedPhone', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Ensure both password and user.password are defined before comparing
		if (!password || !user.password) {
			throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.InvalidCredential', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Verify user's password
		if (!compareSync(password, user.password)) {
			throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.InvalidCredential', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Generate access and refresh tokens concurrently
		const [accessToken, refreshToken] = await Promise.all([
			this.tokenService.createAccessToken({ userId: user.id }),
			this.tokenService.createRefreshToken({ phone: user.phone }),
		]);

		// Update user access token
		await this.userRepository.update({ id: user.id }, { token: accessToken });

		return {
			message: this.i18n.t('locale.AuthMessages.LoginSuccess', { lang: I18nContext?.current()?.lang }),
			accessToken,
			refreshToken
		};
	}

	/**
	 * Logout user from system by removing access and refresh tokens from database
	 */
	async logout() {
		// Retrieve user's data from request
		const user = this.request.user;

		// Remove access and refresh token
		await Promise.all([
			this.userRepository.createQueryBuilder()
				.update(UserEntity)
				.set({ token: () => "NULL" })
				.where("id = :id", { id: user?.id })
				.execute(),

			this.redis.del(`refresh_${user?.phone}`)
		]);

		return this.i18n.t('locale.AuthMessages.LogoutSuccess', { lang: I18nContext?.current()?.lang })
	}

	/**
	 * Verify client's OTP code
	 * @param userId - Client's ID
	 * @param code - Client's OTP code
	 */
	async verifyOtp(userId: number, code: string) {
		// Retrieve OTP data
		const otp = await this.redis.get(`OTP_${userId}`);
		if (!otp) {
			throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.ExpiredOTP', {
				lang: I18nContext?.current()?.lang
			}));
		}

		//? NOTE: Since Redis TTL already ensures expiration of the OTP, we don't need to check the expiration here

		// Validate OTP method
		if (otp.method !== OtpMethods.AUTH) {
			throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.InvalidOtpCode', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Validate OTP code
		if (otp.code !== code) {
			throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.InvalidOtpCode', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return otp;
	}

	/**
	 * Clients' access token validation process
	 * @param {string} token - Access token retrieved from client's request
	 * @throws {UnauthorizedException} - In case of invalid token throw "Unauthorized Exception" error
	 * @returns {Promise<UserEntity & { profile: ProfileEntity } | never>} - Returns user's data or throw an error
	 */
	async validateAccessToken(token: string): Promise<UserEntity & { profile: ProfileEntity } | never> {
		// extract user's id from access token
		const { userId } = this.tokenService.verifyAccessToken(token);

		// retrieve user's data from database
		const user = await this.userRepository.findOne({ where: { id: userId, token }, relations: ["profile"], });

		// throw error if user was not found
		if (!user) {
			throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.AuthFailed', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return user;
	}

	/**
	 * Validate client's refresh token
	 * @param {string} token - Client's refresh token
	 * @returns {Promise<UserEntity>} - Return user's data
	 */
	async validateRefreshToken(token: string): Promise<UserEntity> {
		// extract user's phone from refresh token
		const { phone } = this.tokenService.verifyRefreshToken(token);

		// Retrieve user's data
		const user = await this.getUser(phone);
		if (!user) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.AccountNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// retrieve existing refresh token from redis
		const existingRefreshToken = await this.redis.get(`refresh_${phone}`);

		// Validate refresh toke
		if (token !== existingRefreshToken) {
			throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.InvalidRefreshToken', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return user;
	}
}
