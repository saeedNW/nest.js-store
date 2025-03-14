import { HttpService } from "@nestjs/axios";
import { SmsProvider } from "./sms.provider";
import { SmsIrTemplate } from "../enum/template.enum";
import { firstValueFrom } from "rxjs";
import { InternalServerErrorException } from "@nestjs/common";

export class SmsIrProvider implements SmsProvider {
	private readonly smsIrSendUrl: string;
	private readonly smsIrApiKey: string;

	constructor(private readonly httpService: HttpService) {
		// Load environment variables from ConfigService
		this.smsIrSendUrl = process.env.SMS_IR_SEND_URL;
		this.smsIrApiKey = process.env.SMS_IR_API_KEY;

		// Ensure essential configs exist
		if (!this.smsIrSendUrl || !this.smsIrApiKey) {
			throw new Error("Missing SMS.ir API configuration values");
		}
	}

	/**
	 * Sends an OTP via SMS.ir
	 * @param {string} phone - Recipient's phone number
	 * @param {string} code - OTP code to be sent
	 */
	async sendOtp(phone: string, code: string): Promise<void> {
		// Create request valid data structure
		const data = {
			mobile: phone,
			templateId: SmsIrTemplate.VERIFY,
			parameters: [{ name: "CODE", value: code }],
		};


		// Create request valid headers structure
		const headers = {
			"Content-Type": "application/json",
			Accept: "text/plain",
			"x-api-key": this.smsIrApiKey,
		};

		try {
			await firstValueFrom(this.httpService.post(this.smsIrSendUrl, data, { headers }));
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Unknown error";
			throw new InternalServerErrorException(`SMSIR Error: ${errorMessage}`);
		}
	}
}
