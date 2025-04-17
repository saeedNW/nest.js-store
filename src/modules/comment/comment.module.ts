import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity';
import { AuthModule } from '../auth/auth.module';
import { BlogModule } from '../blog/blog.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([CommentEntity]),
		AuthModule,
		BlogModule
	],
	controllers: [CommentController],
	providers: [CommentService],
})
export class CommentModule { }
