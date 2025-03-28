/**
 * Extend the 'ProcessEnv' interface in the NodeJS namespace to create
 * globally accessible types for environment variables.
 *
 * Adding types here provides type suggestions when accessing variables
 * through 'process.env'.
 */
namespace NodeJS {
	interface ProcessEnv {
		// Application configuration
		NODE_ENV: string;
		PORT: number;
		SERVER: string;
		CORS_ORIGIN: string;

		// Database configuration
		DB_PORT: number;
		DB_NAME: string;
		DB_USERNAME: string;
		DB_PASSWORD: string;
		DB_HOST: string;

		// SMS.ir
		REDIS_HOST: string;
		REDIS_PORT: number;
		REDIS_PASSWORD: string;

		// SMS.ir
		SMS_IR_API_KEY: string;
		SMS_IR_SEND_URL: string;

		// Secrets
		ACCESS_TOKEN_SECRET: string;
		REFRESH_TOKEN_SECRET: string;
		PHONE_TOKEN_SECRET: string;
		COOKIE_SECRET: string;

		// S3 Configuration
		LIARA_S3_SECRET_KEY: string
		LIARA_S3_ACCESS_KEY: string
		LIARA_S3_BUCKET_NAME: string
		LIARA_S3_ENDPOINT: string
	}
}
