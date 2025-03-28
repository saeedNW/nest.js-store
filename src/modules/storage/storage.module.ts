import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { LocalStorageStrategy } from './strategies/local.strategy';

@Module({
	providers: [
		{
			provide: 'StorageStrategy',
			useClass: LocalStorageStrategy,
		},
		StorageService
	],
	exports: [StorageService],
})
export class StorageModule { }
