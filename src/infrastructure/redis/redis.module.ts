/**
 * Redis Module
 * Provides Redis connection for caching, sessions, and job queues
 */

import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_OPTIONS',
      useFactory: (configService: ConfigService) => ({
        host: configService.get<string>('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        password: configService.get<string>('REDIS_PASSWORD'),
        db: configService.get<number>('REDIS_DB', 0),
        keyPrefix: configService.get<string>('REDIS_PREFIX', 'wpnode:'),
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        lazyConnect: true,
        enableReadyCheck: true,
      }),
      inject: [ConfigService],
    },
    RedisService,
    CacheService,
  ],
  exports: [RedisService, CacheService, 'REDIS_OPTIONS'],
})
export class RedisModule {}

