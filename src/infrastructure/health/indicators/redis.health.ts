/**
 * Redis Health Indicator
 * Checks Redis connectivity (optional dependency)
 */

import { Injectable, Optional } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Optional() private readonly redis?: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.redis) {
      return this.getStatus(key, true, { status: 'not_configured' });
    }

    if (!this.redis.isAvailable()) {
      return this.getStatus(key, true, { status: 'unavailable' });
    }

    try {
      const start = Date.now();
      const client = this.redis.getClient();
      if (client) {
        await client.ping();
        const responseTime = Date.now() - start;
        return this.getStatus(key, true, { responseTime, status: 'connected' });
      }
      return this.getStatus(key, true, { status: 'not_connected' });
    } catch (error) {
      // Redis is optional, so we return healthy even if it fails
      return this.getStatus(key, true, { status: 'error', error: error.message });
    }
  }
}
