/**
 * Email Logs Service
 * Manages email history and delivery tracking
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailStatus } from '@prisma/client';

export interface EmailLogFilters {
  status?: EmailStatus;
  templateId?: string;
  recipientId?: string;
  toEmail?: string;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class EmailLogsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get email logs with filters and pagination
   */
  async findAll(page = 1, limit = 20, filters: EmailLogFilters = {}) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.templateId) {
      where.templateId = filters.templateId;
    }

    if (filters.recipientId) {
      where.recipientId = filters.recipientId;
    }

    if (filters.toEmail) {
      where.toEmail = { contains: filters.toEmail, mode: 'insensitive' };
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.emailLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          template: { select: { id: true, name: true, slug: true, type: true } },
          recipient: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.emailLog.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single email log by ID
   */
  async findById(id: string) {
    const log = await this.prisma.emailLog.findUnique({
      where: { id },
      include: {
        template: { select: { id: true, name: true, slug: true, type: true } },
        recipient: { select: { id: true, name: true, email: true } },
      },
    });

    if (!log) {
      throw new NotFoundException(`Email log with ID "${id}" not found`);
    }

    return log;
  }

  /**
   * Get email statistics
   */
  async getStats(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [total, sent, delivered, failed, pending] = await Promise.all([
      this.prisma.emailLog.count({ where }),
      this.prisma.emailLog.count({ where: { ...where, status: EmailStatus.SENT } }),
      this.prisma.emailLog.count({ where: { ...where, status: EmailStatus.DELIVERED } }),
      this.prisma.emailLog.count({ where: { ...where, status: EmailStatus.FAILED } }),
      this.prisma.emailLog.count({ where: { ...where, status: EmailStatus.PENDING } }),
    ]);

    // Get emails by template type
    const byTemplate = await this.prisma.emailLog.groupBy({
      by: ['templateId'],
      _count: { id: true },
      where,
    });

    return {
      total,
      sent,
      delivered,
      failed,
      pending,
      successRate: total > 0 ? (((sent + delivered) / total) * 100).toFixed(2) : '0.00',
      byTemplate,
    };
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 10) {
    return this.prisma.emailLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        template: { select: { name: true, type: true } },
        recipient: { select: { name: true, email: true } },
      },
    });
  }

  /**
   * Delete old logs (older than specified days)
   */
  async cleanupOldLogs(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.emailLog.deleteMany({
      where: { createdAt: { lt: cutoffDate } },
    });

    return { deleted: result.count };
  }
}
