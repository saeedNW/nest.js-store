import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { OtpEntity } from '../user/entities/otp.entity';
import { SmsModule } from '../sms/sms.module';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { JwtService } from '@nestjs/jwt';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity, OtpEntity]),
		SmsModule
	],
	controllers: [AuthController],
	providers: [AuthService, TokenService, JwtService],
	exports: [AuthService, JwtService, TokenService, TypeOrmModule],
})
export class AuthModule { }
