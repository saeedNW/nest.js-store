import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
	constructor(private configService: ConfigService) { }

	createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
		return {
			type: "postgres",
			port: this.configService.get("database.port"),
			host: this.configService.get("database.host"),
			username: this.configService.get("database.username"),
			password: this.configService.get("database.password"),
			database: this.configService.get("database.name"),
			autoLoadEntities: true,
			synchronize: process.env?.NODE_ENV !== "prod",
		};
	}
}
