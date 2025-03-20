import { NestFactory } from '@nestjs/core';
import { SeedService } from './seed/seed.service';
import { SeederModule } from './seed/seed.module';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(SeederModule);
	const seeder = app.get(SeedService);

	console.log('Begin seeding');

	await seeder.seed();

	console.log('Seeding completed');
	await app.close();
}

bootstrap();
