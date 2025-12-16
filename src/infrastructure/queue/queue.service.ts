/**
 * Queue Service
 * Provides high-level API for adding jobs to queues
 * This service is only used when Redis is configured
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue, JobsOptions } from 'bullmq';

// Queue names - duplicated here to avoid circular import
export const QUEUE_EMAIL = 'email';
export const QUEUE_IMAGE = 'image';
export const QUEUE_NOTIFICATIONS = 'notifications';

export interface EmailJobData {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  templateId?: string;
  metadata?: Record<string, any>;
}

export interface ImageJobData {
  sourcePath: string;
  operations: {
    resize?: { width: number; height: number };
    format?: 'jpeg' | 'png' | 'webp' | 'avif';
    quality?: number;
    thumbnail?: boolean;
  };
  outputPath?: string;
}

export interface NotificationJobData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue(QUEUE_EMAIL) private readonly emailQueue: Queue,
    @InjectQueue(QUEUE_IMAGE) private readonly imageQueue: Queue,
    @InjectQueue(QUEUE_NOTIFICATIONS) private readonly notificationQueue: Queue,
  ) {}

  async addEmailJob(data: EmailJobData, options?: JobsOptions) {
    try {
      const job = await this.emailQueue.add('send', data, {
        priority: 2, // Normal priority
        ...options,
      });
      this.logger.debug(`Email job added: ${job.id} -> ${data.to}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add email job: ${error.message}`);
      throw error;
    }
  }

  async addBulkEmailJobs(emails: EmailJobData[], options?: JobsOptions) {
    const jobs = emails.map((data) => ({
      name: 'send',
      data,
      opts: { priority: 3, ...options }, // Lower priority for bulk
    }));

    return this.emailQueue.addBulk(jobs);
  }

  async addImageJob(data: ImageJobData, options?: JobsOptions) {
    try {
      const job = await this.imageQueue.add('process', data, {
        priority: 1, // High priority
        ...options,
      });
      this.logger.debug(`Image job added: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add image job: ${error.message}`);
      throw error;
    }
  }

  async addNotificationJob(data: NotificationJobData, options?: JobsOptions) {
    try {
      const job = await this.notificationQueue.add('send', data, options);
      this.logger.debug(`Notification job added: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error(`Failed to add notification job: ${error.message}`);
      throw error;
    }
  }

  async getQueueStats() {
    const [emailCounts, imageCounts, notificationCounts] = await Promise.all([
      this.emailQueue.getJobCounts(),
      this.imageQueue.getJobCounts(),
      this.notificationQueue.getJobCounts(),
    ]);

    return {
      email: emailCounts,
      image: imageCounts,
      notifications: notificationCounts,
    };
  }

  async pauseQueue(queueName: 'email' | 'image' | 'notifications') {
    const queue = this.getQueueByName(queueName);
    await queue.pause();
    this.logger.log(`Queue ${queueName} paused`);
  }

  async resumeQueue(queueName: 'email' | 'image' | 'notifications') {
    const queue = this.getQueueByName(queueName);
    await queue.resume();
    this.logger.log(`Queue ${queueName} resumed`);
  }

  private getQueueByName(name: string): Queue {
    switch (name) {
      case 'email':
        return this.emailQueue;
      case 'image':
        return this.imageQueue;
      case 'notifications':
        return this.notificationQueue;
      default:
        throw new Error(`Unknown queue: ${name}`);
    }
  }
}

