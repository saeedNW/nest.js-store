import { Inject, Injectable } from "@nestjs/common";
import { StorageStrategy } from "./interface/strategy.interface";

@Injectable()
export class StorageService {
	constructor(@Inject('StorageStrategy') private storageStrategy: StorageStrategy) { }

	/**
	 * Uploads a file to the storage
	 * @param {Express.Multer.File} file - The file to be uploaded
	 * @param {string} directory - The folder name where the file will be uploaded
	 * @returns {Promise<string>} - The URL of the uploaded file
	 */
	upload(file: Express.Multer.File, directory: string): Promise<string> {
		return this.storageStrategy.uploadFile(file, directory);
	}

	/**
	 * Removes a file from the storage
	 * @param {string} filePath - The path of the file to be removed
	 */
	RemoveFile(filePath: string): Promise<void> | void {
		return this.storageStrategy.RemoveFile(filePath);
	}
}
