import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { TMulterFile } from 'src/common/utils/multer.utility';
import { InjectRepository } from '@nestjs/typeorm';
import { GalleryEntity } from './entities/gallery.entity';
import { Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { StorageService } from '../storage/storage.service';
import { deleteInvalidPropertyInObject } from 'src/common/utils/functions.utils';
import { escapeAndTrim } from 'src/common/utils/sanitizer.utility';

@Injectable()
export class GalleryService {
	constructor(
		// inject gallery repository
		@InjectRepository(GalleryEntity)
		private galleryRepository: Repository<GalleryEntity>,
		// Register i18n service
		private readonly i18n: I18nService,
		// Register storage service
		private storageService: StorageService
	) { }

	/**
	 * Upload new file to gallery
	 * @param file - The uploaded file
	 * @param createGalleryDto - New file data
	 */
	async create(file: TMulterFile, createGalleryDto: CreateGalleryDto) {
		// Sanitize client data
		deleteInvalidPropertyInObject(createGalleryDto);
		escapeAndTrim(createGalleryDto);

		// Use file name as alt if it was empty
		createGalleryDto.alt = createGalleryDto.alt || createGalleryDto.name;

		// Extract file's mimType and size
		const mimeType = file.mimetype;
		const size = file.size;

		// Finalize file upload
		const address = await this.storageService.upload(file, `gallery/${new Date().getFullYear()}`);

		// Create new file data
		let newFile = this.galleryRepository.create({
			...createGalleryDto,
			address,
			mimeType,
			size
		});

		// Save file data in database
		newFile = await this.galleryRepository.save(newFile);

		return { file: newFile }
	}

	/**
	 * Retrieve all files from gallery
	 */
	async findAll() {
		const files = await this.galleryRepository.find();

		return { files }
	}

	/**
	 * Retrieve single file from gallery by ID
	 * @param {number} fileId - The file ID
	 */
	async findOne(fileId: number) {
		const file = await this.galleryRepository.findOneBy({ id: fileId });

		if (!file) {
			throw new NotFoundException(this.i18n.t('locale.NotFoundMessages.FileNotFound', {
				lang: I18nContext?.current()?.lang
			}));
		}

		return file;
	}

	/**
	 * Retrieve a file from gallery by ID
	 * @param {number} fileId - The file ID
	 */
	async remove(fileId: number) {
		// Check file existence
		const file = await this.findOne(fileId);

		// Remove file data from database
		await this.galleryRepository.remove(file)

		// Remove file from storage
		await this.storageService.RemoveFile(file.address)

		return this.i18n.t('locale.PublicMessages.SuccessRemoval', {
			lang: I18nContext?.current()?.lang
		});
	}
}
