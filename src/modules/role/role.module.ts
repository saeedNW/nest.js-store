import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([PermissionEntity, RoleEntity]),
		AuthModule,
	],
	controllers: [RoleController, PermissionController],
	providers: [RoleService, PermissionService],
})
export class RoleModule { }
