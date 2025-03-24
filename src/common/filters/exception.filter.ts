import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common';
import { Request } from 'express';
import { removeUploadedFiles } from '../utils/multer.utility';

/**
 * Implement custom response logic for exceptions.
 * This filter will change the application exception
 * response structure before sending it to client
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		// Get the request & response object from context
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request: Request = ctx.getRequest<Request>();
		// Retrieve the exception's response status code
		const statusCode: number = exception.getStatus();
		// Retrieve the exception's response message
		const exceptionResponse: string | object = exception.getResponse();

		// Retrieve the exception's response message
		const message =
			typeof exceptionResponse === 'string'
				? exceptionResponse
				: (exceptionResponse as { message?: string }).message || '';

		/** Retrieve files from the request */
		let files = request.files || request.file;

		/** Handle single or multiple files removal process */
		if (files) {
			const isMultiFile = !Object.keys(files).includes("fieldname");
			// @ts-ignore
			removeUploadedFiles(files, isMultiFile);
		}

		// Send the response`
		response.status(statusCode).json({
			statusCode,
			success: false,
			message,
			timestamp: new Date().toISOString(),
		});
	}
}
