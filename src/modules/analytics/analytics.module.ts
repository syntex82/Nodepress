/**
 * Analytics Module
 */
import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../../database/prisma.module';
import { FeatureGuard } from '../../common/guards/feature.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, FeatureGuard],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
