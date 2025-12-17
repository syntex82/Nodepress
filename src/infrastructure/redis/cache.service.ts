/**
 * Cache Service
 * High-level caching operations with JSON serialization
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTtl: number;

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {
    this.defaultTtl = this.config.get<number>('CACHE_TTL', 300); // 5 minutes default
  }

  private buildKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    if (!this.redis.isAvailable()) return null;

    const fullKey = this.buildKey(key, options?.prefix);
    const value = await this.redis.get(fullKey);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    if (!this.redis.isAvailable()) return false;

    const fullKey = this.buildKey(key, options?.prefix);
    const ttl = options?.ttl ?? this.defaultTtl;

    try {
      const serialized = JSON.stringify(value);
      return await this.redis.set(fullKey, serialized, ttl);
    } catch {
      return false;
    }
  }

  async getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  async invalidate(key: string, prefix?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, prefix);
    return await this.redis.del(fullKey);
  }

  async invalidatePattern(pattern: string): Promise<number> {
    return await this.redis.delPattern(pattern);
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    for (const tag of tags) {
      await this.invalidatePattern(`*${tag}*`);
    }
  }
}
