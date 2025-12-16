/**
 * Storage Module
 * Provides abstracted file storage supporting local and cloud (S3/R2)
 */

import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { LocalStorageProvider } from './providers/local.provider';
import { S3StorageProvider } from './providers/s3.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'STORAGE_CONFIG',
      useFactory: (configService: ConfigService) => ({
        provider: configService.get<string>('STORAGE_PROVIDER', 'local'),
        local: {
          uploadDir: configService.get<string>('UPLOAD_DIR', './uploads'),
          baseUrl: configService.get<string>('STORAGE_LOCAL_URL', '/uploads'),
        },
        s3: {
          bucket: configService.get<string>('S3_BUCKET'),
          region: configService.get<string>('S3_REGION', 'us-east-1'),
          endpoint: configService.get<string>('S3_ENDPOINT'), // For R2, DigitalOcean, etc.
          accessKeyId: configService.get<string>('S3_ACCESS_KEY_ID'),
          secretAccessKey: configService.get<string>('S3_SECRET_ACCESS_KEY'),
          publicUrl: configService.get<string>('S3_PUBLIC_URL'), // CDN URL if different
          forcePathStyle: configService.get<boolean>('S3_FORCE_PATH_STYLE', false),
        },
      }),
      inject: [ConfigService],
    },
    LocalStorageProvider,
    S3StorageProvider,
    StorageService,
  ],
  exports: [StorageService, 'STORAGE_CONFIG'],
})
export class StorageModule {}

