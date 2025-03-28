import { Injectable } from "@nestjs/common";
import { StorageStrategy } from "../interface/strategy.interface";
import { fileRemoval, uploadFinalization } from "src/common/utils/multer.utility";

/**
 * Local storage strategy
 * @description In order to use this strategy you should use the multerFileUploader and express
 * FileInterceptor for the controller methods => @UseInterceptors(FileInterceptor("image", multerFileUploader()))
 */
@Injectable()
export class LocalStorageStrategy implements StorageStrategy {
	/**
	 * Uploads a file to the Local storage
	 * @param {Express.Multer.File} file - The file to be uploaded
	 * @param {string} directory - The folder name where the file will be uploaded
	 * @returns {Promise<string>} - The URL of the uploaded file.
	 */
	async uploadFile(file: Express.Multer.File, directory: string): Promise<string> {
		return uploadFinalization(file, directory);
	}

	/**
	 * Removes a file from the Local storage
	 * @param {string} filePath - The path of the file to be removed
	 */
	async RemoveFile(filePath: string): Promise<void> {
		fileRemoval(filePath);
	}
}
