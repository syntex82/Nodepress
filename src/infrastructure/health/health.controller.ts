/**
 * Health Controller
 * Exposes health check endpoints for infrastructure monitoring
 */

import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from './indicators/prisma.health';
import { RedisHealthIndicator } from './indicators/redis.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private redisHealth: RedisHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  /**
   * Basic liveness probe - is the service running?
   * Use for Kubernetes liveness probe or load balancer health check
   */
  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([() => this.prismaHealth.isHealthy('database')]);
  }

  /**
   * Readiness probe - is the service ready to receive traffic?
   * Checks all dependencies including optional ones
   */
  @Get('ready')
  @HealthCheck()
  async checkReadiness() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('database'),
      () => this.redisHealth.isHealthy('redis'),
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024), // 500MB
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024), // 1GB
    ]);
  }

  /**
   * Detailed health check with all metrics
   * Use for monitoring dashboards
   */
  @Get('detailed')
  @HealthCheck()
  async checkDetailed() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('database'),
      () => this.redisHealth.isHealthy('redis'),
      () => this.memory.checkHeap('memory_heap', 500 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),
      () =>
        this.disk.checkStorage('disk', {
          path: process.cwd(),
          thresholdPercent: 0.9, // Alert if 90% full
        }),
    ]);
  }

  /**
   * Simple ping endpoint for basic availability check
   */
  @Get('ping')
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Get runtime info
   */
  @Get('info')
  info() {
    return {
      version: process.env.npm_package_version || '1.0.0',
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV || 'development',
      instance: process.env.INSTANCE_ID || 'primary',
    };
  }
}
