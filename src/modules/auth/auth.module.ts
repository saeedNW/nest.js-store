import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { SmsModule } from '../sms/sms.module';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { RoleModule } from '../role/role.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity]),
		SmsModule,
		RoleModule
	],
	controllers: [AuthController],
	providers: [AuthService, TokenService, JwtService],
	exports: [AuthService, JwtService, TokenService, TypeOrmModule],
})
export class AuthModule { }
