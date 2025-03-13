import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomConfigModule } from '../configs/configs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from 'src/configs/typeorm.config';

@Module({
	imports: [
		// Database connection
		TypeOrmModule.forRootAsync({
			useClass: TypeOrmConfig,
			inject: [TypeOrmConfig],
		}),

		// Modules
		CustomConfigModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
