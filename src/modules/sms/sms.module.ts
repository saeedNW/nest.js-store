import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { HttpModule, HttpService } from "@nestjs/axios";
import { SmsProvidersEnum } from './enum/providers.enum';
import { SmsIrProvider } from './providers/sms-ir.provider';

@Module({
	imports: [
		HttpModule.register({
			maxRedirects: 5,
			timeout: 5000,
		}),
	],
	providers: [
		SmsService,
		{
			// Register providers
			provide: 'SMS_PROVIDERS',
			useFactory: (httpService: HttpService, smsService: SmsService) => {
				smsService.registerSmsProviders(
					SmsProvidersEnum.SMS_IR,
					new SmsIrProvider(httpService),
				);
			},
			inject: [HttpService, SmsService],
		},
	],
	exports: [SmsService]
})
export class SmsModule { }
