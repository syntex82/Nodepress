/**
 * Plugins Module
 * Manages plugin installation, activation, and lifecycle
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { PluginsService } from './plugins.service';
import { PluginsController } from './plugins.controller';
import { PluginLoaderService } from './plugin-loader.service';

@Module({
  imports: [PrismaModule],
  providers: [PluginsService, PluginLoaderService],
  controllers: [PluginsController],
  exports: [PluginsService, PluginLoaderService],
})
export class PluginsModule {}
