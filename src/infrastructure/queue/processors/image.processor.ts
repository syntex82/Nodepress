/**
 * Image Queue Processor
 * Processes image optimization jobs in the background
 * Note: Sharp is an optional dependency - install with: npm install sharp
 */

import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import * as fs from 'fs/promises';
import * as path from 'path';
import { QUEUE_IMAGE } from '../queue.module';
import { ImageJobData } from '../queue.service';

// Try to load sharp at module level (optional dependency)
let sharpModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  sharpModule = require('sharp');
} catch {
  // Sharp not installed - will handle in processor
}

@Processor(QUEUE_IMAGE)
export class ImageQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(ImageQueueProcessor.name);

  constructor() {
    super();
    if (!sharpModule) {
      this.logger.warn('Sharp not installed - image processing will be skipped. Install with: npm install sharp');
    }
  }

  async process(job: Job<ImageJobData>): Promise<any> {
    const { sourcePath, operations, outputPath } = job.data;

    this.logger.debug(`Processing image job ${job.id}: ${sourcePath}`);

    // Check if sharp is available
    if (!sharpModule) {
      this.logger.warn('Sharp not installed - skipping image processing');
      return { success: false, reason: 'sharp not installed' };
    }

    try {
      // Verify source file exists
      await fs.access(sourcePath);

      let image = sharpModule(sourcePath);

      if (operations.resize) {
        image = image.resize(operations.resize.width, operations.resize.height, {
          fit: 'inside',
          withoutEnlargement: true,
        });
      }

      if (operations.format) {
        image = image.toFormat(operations.format, {
          quality: operations.quality || 80,
        });
      }

      if (operations.thumbnail) {
        image = image.resize(300, 300, { fit: 'cover' });
      }

      const ext = operations.format || 'webp';
      const output = outputPath || sourcePath.replace(/\.[^.]+$/, `.optimized.${ext}`);

      // Ensure output directory exists
      await fs.mkdir(path.dirname(output), { recursive: true });

      await image.toFile(output);

      this.logger.log(`Image processed: ${output}`);
      return { success: true, outputPath: output };
    } catch (error) {
      this.logger.error(`Failed to process image: ${error.message}`);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.debug(`Image job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Image job ${job.id} failed: ${error.message}`);
  }
}

