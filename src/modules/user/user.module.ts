import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { AddressEntity } from './entities/address.entity';
import { ProfileEntity } from './entities/profile.entity';
import { OtpEntity } from './entities/otp.entity';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, AddressEntity, ProfileEntity, OtpEntity])],
	controllers: [UserController],
	providers: [UserService],
})
export class UserModule { }
