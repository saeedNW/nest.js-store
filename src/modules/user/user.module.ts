import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { AddressEntity } from './entities/address.entity';
import { ProfileEntity } from './entities/profile.entity';
import { AuthModule } from '../auth/auth.module';
import { SmsModule } from '../sms/sms.module';
import { UserController } from './controllers/user.controller';
import { ProfileController } from './controllers/profile.controller';
import { AddressController } from './controllers/address.controller';
import { UserService } from './services/user.service';
import { ProfileService } from './services/profile.service';
import { AddressService } from './services/address.service';
import { RoleModule } from '../role/role.module';
import { StorageModule } from '../storage/storage.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity, AddressEntity, ProfileEntity]),
		AuthModule,
		SmsModule,
		RoleModule,
		StorageModule
	],
	controllers: [UserController, ProfileController, AddressController],
	providers: [UserService, ProfileService, AddressService],
})
export class UserModule { }
