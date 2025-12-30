/**
 * Users Module
 * Manages user CRUD operations, profiles, and role-based permissions
 */

import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../../database/prisma.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, forwardRef(() => NotificationsModule)],
  providers: [UsersService, ProfilesService],
  controllers: [UsersController, ProfilesController],
  exports: [UsersService, ProfilesService],
})
export class UsersModule {}
