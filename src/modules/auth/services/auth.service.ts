import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { OtpEntity } from '../../user/entities/otp.entity';
import { randomInt } from 'crypto';
import { TokenService } from './token.service';
import { SendOtpDto } from '../dto/send-otp.dto';
import { CheckOtpDto } from '../dto/check-otp.dto';
import { ProfileEntity } from 'src/modules/user/entities/profile.entity';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class AuthService {
	constructor(
		// inject user repository
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		// inject otp repository
		@InjectRepository(OtpEntity)
		private otpRepository: Repository<OtpEntity>,
		// Register token service
		private tokenService: TokenService,
		// Register i18n service
		private readonly i18n: I18nService
	) { }

	/**
	 *
	 * @param {SendOtpDto} sendOtpDto - Client data need to generate and send OTP code
	 * @returns {Promise<string>} - Return the generated OTP code
	 */
	async createOtp(sendOtpDto: SendOtpDto): Promise<string> {
		// extract phone number from client data
		const { phone } = sendOtpDto;

		// retrieve user's data from database
		let user: UserEntity | null = await this.getUser(phone);

		if (!user) {
			// create new user and save it in database if user not found
			user = this.userRepository.create({ phone });
			user = await this.userRepository.save(user);
		}

		// Generates a new OTP
		const otp: OtpEntity = await this.saveOtp(user.id);

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
	 * @param {number} userId - he user's ID
	 * @returns {Promise<OtpEntity>} - The created or updated OTP entity
	 */
	async saveOtp(userId: number): Promise<OtpEntity> {
		// Generate a random 5-digit OTP code
		const code: string = randomInt(10000, 99999).toString();
		// Set expiration time to 2 minutes from now
		const expires_in = new Date(Date.now() + 2 * 60 * 1000);
		// Check if an existing OTP is associated with the user
		const existingOtp: OtpEntity | null = await this.otpRepository.findOneBy({ userId });

		// If an OTP exists and is still valid, throw an error
		if (existingOtp && existingOtp.expires_in > new Date()) {
			throw new BadRequestException(this.i18n.t('locale.AuthMessages.OTPNotExpired', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Update the existing OTP if found, otherwise create a new one
		const otp = existingOtp
			? Object.assign(existingOtp, { code, expires_in }) // Update the existing OTP
			: this.otpRepository.create({ userId, code, expires_in }); // Create a new OTP

		// Use a transaction to ensure data consistency when saving OTP and updating the user
		return await this.otpRepository.manager.transaction(async (manager) => {
			const savedOtp = await manager.save(otp);

			// If OTP is newly created, update the user
			if (!existingOtp) {
				await manager.update(UserEntity, { id: userId }, { otpId: savedOtp.id });
			}

			return savedOtp;
		});
	}

	/**
	 * Verifies an OTP code and logs in the user
	 * @param {CheckOtpDto} checkOtpDto - DTO containing phone and OTP code
	 * @returns {Promise<{ message: string; accessToken: string }>}
	 */
	async checkOtp(checkOtpDto: CheckOtpDto): Promise<{ message: string; accessToken: string }> {
		// extract phone number and OTP code from client data
		const { code, phone } = checkOtpDto;

		// Retrieve user's data
		const user = await this.getUser(phone);
		if (!user) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.AccountNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Retrieve OTP data
		const otp = await this.otpRepository.findOne({ where: { userId: user.id, code } });
		if (!otp) {
			throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.ExpiredOTP', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Validate OTP expiration
		if (otp.expires_in < new Date()) {
			throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.ExpiredOTP', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Generate an access token
		const accessToken = this.tokenService.createAccessToken({ userId: user.id });

		// Verify user's phone number if not already verified
		if (!user.verify_phone) {
			await this.userRepository.update({ id: user.id }, { verify_phone: true });
		}

		return {
			message: this.i18n.t('locale.AuthMessages.LoginSuccess', { lang: I18nContext?.current()?.lang }),
			accessToken,
		};
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
		const user = await this.userRepository.findOne({ where: { id: userId }, relations: ["profile"], });

		// throw error if user was not found
		if (!user) {
			throw new UnauthorizedException(this.i18n.t('locale.AuthMessages.AuthFailed', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return user;
	}
}
