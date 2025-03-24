import { swaggerConfiguration } from './configs/swagger.config';
import { ResponseTransformerInterceptor } from './common/interceptor/response-transformer.interceptor';
import { UnprocessableEntityPipe } from './common/pipe/unprocessable-entity.pipe';
import { HttpExceptionFilter } from './common/filters/exception.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { helmetConfig } from './configs/helmet.config';
import { customHeadersMiddleware } from './common/middlewares/headers.middleware';
import { getCorsConfig } from './configs/cors.config';
import * as cookieParser from "cookie-parser";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);
	// Register public folder as static files directory
	app.useStaticAssets("public");
	// Apply CORS config
	app.enableCors(getCorsConfig);
	// Secure the app with Helmet
	app.use(helmet(helmetConfig));
	// Manually set custom headers for X-Powered-By and server
	app.use(customHeadersMiddleware);
	// Initialize swagger
	swaggerConfiguration(app);
	// Initialize custom response interceptor
	app.useGlobalInterceptors(new ResponseTransformerInterceptor());
	// Initialize custom validation pipe
	app.useGlobalPipes(new UnprocessableEntityPipe());
	// Initialize custom exception filter
	app.useGlobalFilters(new HttpExceptionFilter());
	// Initialize cookie parser
	app.use(cookieParser(process.env.COOKIE_SECRET));
	// Starting server
	await app.listen(process.env.PORT || 3000, () => {
		console.log(`Server is running on ${process.env.SERVER}`)
	});
}
bootstrap();
