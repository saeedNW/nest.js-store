import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export const getCorsConfig = (configService: ConfigService): CorsOptions => ({
	origin: configService.get<Array<string>>('cors_origin') || ["http://localhost:3000"], // Restrict origins (use env variable)
	methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // OPTIONS is automatically handled
	allowedHeaders: ["Content-Type", "Authorization"], // Restrict headers
	credentials: true, // Allow cookies, but only if origin is not "*"
	preflightContinue: false, // Automatically handle preflight requests
	optionsSuccessStatus: 204, // Respond with 204 for preflight requests (improves performance)
});
