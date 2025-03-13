import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as yaml from 'yaml';
import { readFileSync } from 'fs';

@Module({
	imports: [
		ConfigModule.forRoot({
			load: [
				() => yaml.parse(readFileSync(`src/configs/env/${process.env.NODE_ENV}.yaml`, 'utf8')),
			],
			isGlobal: true,
		}),
	]
})
export class CustomConfigModule { }
