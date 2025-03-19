import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export function TypeOrmConfig(): TypeOrmModuleOptions {
	return {
		type: "postgres",
		port: Number(process.env.DB_PORT),
		host: process.env.DB_HOST,
		username: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		autoLoadEntities: true,
		synchronize: process.env?.NODE_ENV !== "prod",
	};
}
