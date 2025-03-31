import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { RoleModule } from '../role/role.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([BlogEntity]),
		AuthModule,
		RoleModule
	],
	controllers: [BlogController],
	providers: [BlogService],
})
export class BlogModule { }
