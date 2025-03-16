import { BadRequestException, Injectable } from '@nestjs/common';
import { SmsProvidersEnum } from './enum/providers.enum';
import { SmsProvider } from './providers/sms.provider';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class SmsService {
	constructor(
		// Register i18n service
		private readonly i18n: I18nService
	) { }

	private availableProviders = new Map<SmsProvidersEnum, SmsProvider>();

	/**
	 * Register a specific sms provider to be available to use.
	 * @param {SmsProvidersEnum} providerName - The name of the provider that needs to be activated
	 * @param {SmsProvider} providerInstance - The logic and functionality of the activated provider
	 */
	public registerSmsProviders(
		providerName: SmsProvidersEnum,
		providerInstance: SmsProvider,
	) {
		this.availableProviders.set(providerName, providerInstance);
	}

	/**
	 * Process an OTP (One-Time Password) request by sending it to the specified phone number using the specified SMS provider.
	 * @param {string} phone - The phone number to which the OTP should be sent.
	 * @param {string} code - The OTP code to be sent.
	 * @param {SmsProvidersEnum} smsProvider - The SMS provider to be used for sending the OTP.
	 */
	public async sendOtp(phone: string, code: string, smsProvider: SmsProvidersEnum): Promise<void> {
		// Check if the provider is available
		const provider = this.availableProviders.get(smsProvider);

		// Throw an error if provider is not available
		if (!provider) {
			throw new BadRequestException(this.i18n.t('locale.BadRequestMessages.UnsupportedSmsProvider', {
				lang: I18nContext?.current()?.lang
			}));
		}

		// Send the OTP
		await provider.sendOtp(phone, code)
	}
}
