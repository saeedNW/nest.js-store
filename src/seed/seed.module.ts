import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from 'src/configs/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { UserModule } from 'src/modules/user/user.module';
import { RoleModule } from 'src/modules/role/role.module';
import { SeedService } from './seed.service';
import { PermissionEntity } from 'src/modules/role/entities/permission.entity';
import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { AddressEntity } from 'src/modules/user/entities/address.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { ProfileEntity } from 'src/modules/user/entities/profile.entity';

@Module({
	imports: [
		// Load ENVs
		ConfigModule.forRoot({
			envFilePath: path.resolve(".env"),
			isGlobal: true,
		}),

		// Database connection
		TypeOrmModule.forRoot(TypeOrmConfig()),

		TypeOrmModule.forFeature([PermissionEntity, RoleEntity, AddressEntity, UserEntity, ProfileEntity]),
	],
	controllers: [],
	providers: [SeedService],
})
export class SeederModule { }
