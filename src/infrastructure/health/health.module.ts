/**
 * Health Module
 * Provides health check endpoints for load balancers and monitoring
 */

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './indicators/prisma.health';
import { RedisHealthIndicator } from './indicators/redis.health';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [TerminusModule, PrismaModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, RedisHealthIndicator],
  exports: [PrismaHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
