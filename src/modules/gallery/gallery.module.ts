import { Module } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { StorageModule } from '../storage/storage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryEntity } from './entities/gallery.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([GalleryEntity]),
		StorageModule,
		AuthModule,
	],
	controllers: [GalleryController],
	providers: [GalleryService],
})
export class GalleryModule { }
