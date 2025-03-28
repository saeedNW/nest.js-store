import { Injectable } from "@nestjs/common";
import { StorageStrategy } from "../interface/strategy.interface";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { basename, extname } from "path";

/**
 * Liara storage strategy
 * @description In order to use this strategy you should use the file uploader interceptors
 * located in this module for the controller methods => @UseInterceptors(S3SingleFile("image"))
 */
@Injectable()
export class LiaraStorageStrategy implements StorageStrategy {
	private readonly s3Client: S3Client;
	private readonly bucketName: string;
	private readonly endpoint: string;

	constructor() {
		const accessKeyId = this.getEnvVariable("LIARA_S3_ACCESS_KEY");
		const secretAccessKey = this.getEnvVariable("LIARA_S3_SECRET_KEY");
		this.bucketName = this.getEnvVariable("LIARA_S3_BUCKET_NAME");
		this.endpoint = this.getEnvVariable("LIARA_S3_ENDPOINT");

		// Initialize S3 client
		this.s3Client = new S3Client({
			region: "default",
			endpoint: this.endpoint,
			credentials: { accessKeyId, secretAccessKey },
		});
	}

	/**
	 * Uploads a file to the Liara S3 storage
	 * @param {Express.Multer.File} file - The file to be uploaded
	 * @param {string} directory - The folder name where the file will be uploaded
	 * @returns {Promise<string>} - The URL of the uploaded file.
	 */
	async uploadFile(file: Express.Multer.File, directory: string): Promise<string> {
		// Generate a unique file name
		const fileName = this.generateFileName(file.originalname);
		const fileKey = `${directory}/${fileName}`;

		// Create the upload command
		const uploadCommand = new PutObjectCommand({
			Bucket: this.bucketName,
			Key: fileKey,
			Body: file.buffer,
		});

		// Execute upload command
		await this.s3Client.send(uploadCommand);

		// Construct and return the file URL
		return `${this.endpoint}/${this.bucketName}/${fileKey}`;
	}

	/**
	 * Removes a file from the Liara S3 storage
	 * @param {string} filePath - The path of the file to be removed
	 */
	async RemoveFile(filePath: string): Promise<void> {
		// Create a DeleteObjectCommand instance
		const command = new DeleteObjectCommand({
			Bucket: this.bucketName,
			Key: decodeURI(this.convertToFileKey(filePath)),
		});

		// Send the command to the S3 client
		await this.s3Client.send(command);
	}

	/**
	 * Converts file's URL to Liara file key
	 * @param {string} fileUrl - The files URL to be converted to Liara file key
	 * @returns {string} - Liara file key
	 */
	convertToFileKey(fileUrl: string): string {
		// define S3 server url
		const serverURL: string = this.endpoint + "/liara-storage";

		// Remove the base URL from the complete URL.
		const fileKey: string = fileUrl.replace(serverURL + "/", "");

		return fileKey;
	}

	/**
	 * Retrieves and validates required environment variables
	 * @param {string} key - The environment variable key
	 * @returns {string} - The retrieved environment variable value
	 */
	private getEnvVariable(key: string): string {
		const value = process.env[key];
		if (!value) {
			throw new Error(`Missing required environment variable: ${key}`);
		}
		return value;
	}

	/**
	 * Generates a sanitized file name for storage
	 * @param {string} originalName - The original file name
	 * @returns {string} - The generated file name
	 */
	private generateFileName(originalName: string): string {
		const fileExt = extname(originalName).toLowerCase();
		const baseName = basename(originalName, fileExt).replace(/\s+/g, "-");

		return `${Date.now()}-${baseName}${fileExt}`;
	}
}
