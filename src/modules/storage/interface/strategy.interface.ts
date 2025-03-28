/**
 * S3 storage main strategy interface
 * @interface StorageStrategy
 * @description This interface defines the contract for any storage strategy implementation.
 */
export interface StorageStrategy {
	uploadFile(file: Express.Multer.File, directory: string): Promise<string>;
	RemoveFile(filePath: string): Promise<void>;
}
