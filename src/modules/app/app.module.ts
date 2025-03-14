import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from 'src/configs/typeorm.config';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';

@Module({
	imports: [
		/** Load environment variables from the specified .env file through 'ConfigModule' */
		ConfigModule.forRoot({
			envFilePath: resolve(".env"),
			isGlobal: true,
		}),

		// Database connection
		TypeOrmModule.forRoot(TypeOrmConfig()),

		// Modules
		UserModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
