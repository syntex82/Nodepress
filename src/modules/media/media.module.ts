/**
 * Media Module
 * Handles file uploads and media library management
 */

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaModule } from '../../database/prisma.module';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB default
      },
    }),
  ],
  providers: [MediaService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
