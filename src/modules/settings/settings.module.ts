/**
 * Settings Module
 * Manages global site settings
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
  imports: [PrismaModule],
  providers: [SettingsService],
  controllers: [SettingsController],
  exports: [SettingsService],
})
export class SettingsModule {}
