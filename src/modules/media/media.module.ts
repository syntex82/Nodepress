/**
 * Media Module
 * Handles file uploads and media library management
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';

@Module({
  imports: [PrismaModule],
  providers: [MediaService],
  controllers: [MediaController],
  exports: [MediaService],
})
export class MediaModule {}
