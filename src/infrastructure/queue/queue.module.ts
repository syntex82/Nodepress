/**
 * Queue Module
 * Provides background job processing using BullMQ
 */

import { Module, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { EmailQueueProcessor } from './processors/email.processor';
import { ImageQueueProcessor } from './processors/image.processor';
import { QueueService } from './queue.service';

// Queue names
export const QUEUE_EMAIL = 'email';
export const QUEUE_IMAGE = 'image';
export const QUEUE_NOTIFICATIONS = 'notifications';

@Global()
@Module({
  imports: [
    ConfigModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('QueueModule');
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);
        const redisPassword = configService.get<string>('REDIS_PASSWORD');

        logger.log(`📋 Queue system configured (Redis: ${redisHost}:${redisPort})`);

        return {
          connection: {
            host: redisHost,
            port: redisPort,
            password: redisPassword || undefined,
            maxRetriesPerRequest: 3,
          },
          defaultJobOptions: {
            removeOnComplete: 100, // Keep last 100 completed jobs
            removeOnFail: 500, // Keep last 500 failed jobs
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: QUEUE_EMAIL },
      { name: QUEUE_IMAGE },
      { name: QUEUE_NOTIFICATIONS },
    ),
  ],
  providers: [QueueService, EmailQueueProcessor, ImageQueueProcessor],
  exports: [QueueService, BullModule],
})
export class QueueModule {}

