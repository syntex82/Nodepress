/**
 * Prisma Service
 * Manages database connection with connection pooling and query optimization
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly config?: ConfigService) {
    const isDev = process.env.NODE_ENV === 'development';
    const connectionLimit = parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10', 10);
    const poolTimeout = parseInt(process.env.DATABASE_POOL_TIMEOUT || '10', 10);

    // Build connection URL with pooling parameters
    let datasourceUrl = process.env.DATABASE_URL;
    if (datasourceUrl && !datasourceUrl.includes('connection_limit')) {
      const separator = datasourceUrl.includes('?') ? '&' : '?';
      datasourceUrl = `${datasourceUrl}${separator}connection_limit=${connectionLimit}&pool_timeout=${poolTimeout}`;
    }

    super({
      log: isDev
        ? [
            { level: 'query', emit: 'event' },
            { level: 'error', emit: 'stdout' },
            { level: 'warn', emit: 'stdout' },
          ]
        : [{ level: 'error', emit: 'stdout' }],
      datasourceUrl,
    });

    // Log slow queries in development
    if (isDev) {
      (this as any).$on('query', (e: Prisma.QueryEvent) => {
        if (e.duration > 100) {
          this.logger.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
      });
    }
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected');
    } catch (error) {
      this.logger.error(`Failed to connect to database: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('👋 Database disconnected');
  }

  /**
   * Execute with retry logic for transient failures
   */
  async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Only retry on connection errors
        if (error.code === 'P2024' || error.code === 'P1001') {
          this.logger.warn(
            `Database operation failed (attempt ${attempt}/${maxRetries}): ${error.message}`,
          );
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, delay * attempt));
            continue;
          }
        }
        throw error;
      }
    }

    throw lastError!;
  }

  /**
   * Paginate query results
   */
  async paginate<T>(
    model: any,
    args: {
      where?: any;
      orderBy?: any;
      include?: any;
      select?: any;
    },
    page = 1,
    limit = 20,
  ): Promise<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      model.findMany({
        ...args,
        skip,
        take: limit,
      }),
      model.count({ where: args.where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Clean database (useful for testing)
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }

    const models = Reflect.ownKeys(this).filter(
      (key) => typeof key === 'string' && key[0] !== '_' && key[0] !== '$',
    );

    return Promise.all(
      models.map((modelKey) => {
        const model = this[modelKey as string];
        if (model && typeof model.deleteMany === 'function') {
          return model.deleteMany();
        }
      }),
    );
  }

  /**
   * Get database metrics (for monitoring)
   */
  async getMetrics() {
    try {
      const result = await this.$queryRaw<any[]>`
        SELECT
          numbackends as active_connections,
          xact_commit as transactions_committed,
          xact_rollback as transactions_rolled_back,
          blks_read as blocks_read,
          blks_hit as blocks_hit,
          tup_returned as rows_returned,
          tup_fetched as rows_fetched,
          tup_inserted as rows_inserted,
          tup_updated as rows_updated,
          tup_deleted as rows_deleted
        FROM pg_stat_database
        WHERE datname = current_database()
      `;
      return result[0] || {};
    } catch {
      return {};
    }
  }
}
