import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs';
import { I18nContext } from 'nestjs-i18n';

/**
 * Response transformer interceptor.
 * This interceptor is used to transform the response object.
 */
@Injectable()
export class ResponseTransformerInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler<any>): any {
		// Switch to HTTP context
		const ctx = context.switchToHttp();
		// Get the request object from context
		const request = ctx.getRequest();
		// Get the response object from context
		const Response = ctx.getResponse();
		// Get the status code from the response object
		const statusCode: number = Response.statusCode;
		// Get the language from the request headers
		const lang = request.headers['accept-language'] || 'fa';

		/**
		 * Handle the request and return the response object.
		 */
		return next.handle().pipe(
			map((data) => {
				// Return a simple text response if data was a string
				if (typeof data === 'string') {
					return {
						statusCode,
						success: true,
						message: data,
					};
				}

				// Get the I18nContext for translation
				const i18n = I18nContext.current();

				// Set the default message
				let message = i18n?.translate('locale.PublicMessages.Successfully', { lang });

				// Check if the data object has a message property
				if (data && typeof data === 'object' && 'message' in data) {
					message = data.message;
					delete data.message;
				}

				// Return the response object
				return {
					statusCode,
					success: true,
					message,
					data: Object.keys(data).length ? data : undefined,
				};
			}),
		);
	}
}
