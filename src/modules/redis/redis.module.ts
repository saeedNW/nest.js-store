import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

@Global()
@Module({
	providers: [
		RedisService,
		{
			provide: 'REDIS_CONNECTION',
			useFactory: () => {
				return new Redis({
					host: process.env.REDIS_HOST,
					port: process.env.REDIS_PORT,
					db: 0,
				});
			},
		},
	],
	exports: [RedisService],
})
export class RedisModule { }
