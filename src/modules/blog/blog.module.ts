import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { RoleModule } from '../role/role.module';
import { CategoryModule } from '../category/category.module';
import { UserInjector } from '../auth/middlewares/user-injector.middleware';

@Module({
	imports: [
		TypeOrmModule.forFeature([BlogEntity]),
		AuthModule,
		RoleModule,
		CategoryModule
	],
	controllers: [BlogController],
	providers: [BlogService],
	exports: [BlogService]
})
export class BlogModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		// Activate user injector middleware for
		consumer.apply(UserInjector).forRoutes("/blog", "/blog/single/:find")
	}
}
