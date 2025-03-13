import { swaggerConfiguration } from './configs/swagger.config';
import { ResponseTransformerInterceptor } from './common/interceptor/response-transformer.interceptor';
import { UnprocessableEntityPipe } from './common/pipe/unprocessable-entity.pipe';
import { HttpExceptionFilter } from './common/filters/exception.filter';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	// initialize swagger
	swaggerConfiguration(app);
	// initialize custom response interceptor
	app.useGlobalInterceptors(new ResponseTransformerInterceptor());
	// initialize custom validation pipe
	app.useGlobalPipes(new UnprocessableEntityPipe());
	// initialize custom exception filter
	app.useGlobalFilters(new HttpExceptionFilter());
	// Initialize config service
	const configService = app.get(ConfigService);
	// Starting server
	await app.listen(configService.get<number>("app.port") || 3000, () => {
		console.log(`Server is running on ${configService.get<string>("app.server_link")}`)
	});
}
bootstrap();
