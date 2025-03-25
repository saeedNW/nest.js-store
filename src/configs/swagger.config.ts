import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

/**
 * Define swagger consumes type as an enum
 */
export enum SwaggerConsumes {
	// Swagger form input type
	URL_ENCODED = 'application/x-www-form-urlencoded',
	// Swagger raw json data type
	JSON = 'application/json',
	// Swagger multipart form data type
	MULTIPART_FORM_DATA = 'multipart/form-data',
}

/**
 * Initialize Swagger document
 * @param app NestJS Application instance
 */
export function swaggerConfiguration(app: INestApplication) {
	// Define Swagger options
	const document = new DocumentBuilder()
		.setTitle('NestJS Application')
		.setDescription('API documentation of the NestJS application')
		.setVersion('1.0.0')
		.addBearerAuth(swaggerBearerAuthConfig(), 'Authorization')
		.build();

	// Initialize Swagger document
	const swaggerDocument = SwaggerModule.createDocument(app, document);

	// Setup Swagger UI with custom options
	SwaggerModule.setup('/api-doc', app, swaggerDocument, {
		// customCssUrl: '/swagger-ui/custom.css', // Optional for CSS changes
		customJs: '/swagger-ui/custom.js' // Custom JavaScript
	});
}

/**
 * define and return swagger bearer auth scheme
 * @returns {SecuritySchemeObject} - Swagger bearer Auth scheme object
 */
function swaggerBearerAuthConfig(): SecuritySchemeObject {
	return {
		type: 'http',
		bearerFormat: 'JWT',
		in: 'header',
		scheme: 'bearer',
	};
}
