import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from 'src/configs/typeorm.config';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { SmsModule } from '../sms/sms.module';
import { AuthModule } from '../auth/auth.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';
import { RedisModule } from '../redis/redis.module';
import { RoleModule } from '../role/role.module';
import { GalleryModule } from '../gallery/gallery.module';
import { BlogModule } from '../blog/blog.module';
import { CategoryModule } from '../category/category.module';

@Module({
	imports: [
		// Load ENVs
		ConfigModule.forRoot({
			envFilePath: path.resolve(".env"),
			isGlobal: true,
		}),

		// Register and config I18n
		I18nModule.forRoot({
			fallbackLanguage: 'en',
			loaderOptions: {
				path: path.join(__dirname, '../../common/i18n/'),
				watch: true,
			},
			resolvers: [
				{ use: QueryResolver, options: ['lang'] },
				AcceptLanguageResolver,
			],
		}),

		// Database connection
		TypeOrmModule.forRoot(TypeOrmConfig()),

		// Modules
		RedisModule,
		UserModule,
		SmsModule,
		AuthModule,
		RoleModule,
		GalleryModule,
		BlogModule,
		CategoryModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule { }
