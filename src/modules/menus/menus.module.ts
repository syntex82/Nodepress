/**
 * Menus Module
 * Provides menu management functionality
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';

@Module({
  imports: [PrismaModule],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
