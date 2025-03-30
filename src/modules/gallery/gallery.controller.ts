import { Controller, Get, Post, Body, Param, Delete, ParseIntPipe, UseInterceptors } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { AuthDecorator } from 'src/common/decorator/auth.decorator';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionDecorator } from 'src/common/decorator/permission.decorator';
import { Permissions } from 'src/common/enums/permissions.enum';
import { SwaggerConsumes } from 'src/configs/swagger.config';
import { plainToClass } from 'class-transformer';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerFileUploader, TMulterFile } from 'src/common/utils/multer.utility';
import { FileUploader } from 'src/common/decorator/file-uploader.decorator';

@Controller('gallery')
@ApiTags("Gallery`")
export class GalleryController {
	constructor(private readonly galleryService: GalleryService) { }

	/**
	 * Upload new file to gallery
	 * @param {CreateGalleryDto} createGalleryDto - New file data
	 * @param {TMulterFile} file - The uploaded file
	 */
	@Post()
	@AuthDecorator()
	@PermissionDecorator(Permissions['Gallery.manager'])
	@ApiOperation({ summary: "[ RBAC ] - Upload new file [Image/Video]" })
	@UseInterceptors(FileInterceptor("file", multerFileUploader()))
	@ApiConsumes(SwaggerConsumes.MULTIPART_FORM_DATA)
	create(
		@Body() createGalleryDto: CreateGalleryDto,
		@FileUploader() file: TMulterFile
	) {
		// filter client data and remove unwanted data
		createGalleryDto = plainToClass(CreateGalleryDto, createGalleryDto, {
			excludeExtraneousValues: true,
		});

		return this.galleryService.create(file, createGalleryDto);
	}

	/**
	 * Retrieve all files from gallery
	 */
	@Get()
	findAll() {
		return this.galleryService.findAll();
	}

	/**
	 * Retrieve single file from gallery by ID
	 * @param {number} fileId - The file ID
	 */
	@Get(':fileId')
	findOne(@Param('fileId', ParseIntPipe) fileId: number) {
		return this.galleryService.findOne(fileId);
	}

	/**
	 * Retrieve a file from gallery by ID
	 * @param {number} fileId - The file ID
	 */
	@Delete(':fileId')
	@AuthDecorator()
	@PermissionDecorator(Permissions['Gallery.manager'])
	@ApiOperation({ summary: "[ RBAC ] - File removal" })
	remove(@Param('fileId', ParseIntPipe) fileId: number) {
		return this.galleryService.remove(fileId);
	}
}
