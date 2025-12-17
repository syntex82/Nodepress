/**
 * Storage Service
 * Abstraction layer that routes to the configured storage provider
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { StorageFile, UploadOptions, PresignedUrlOptions } from './storage.interface';
import { LocalStorageProvider } from './providers/local.provider';
import { S3StorageProvider } from './providers/s3.provider';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly provider: string;

  constructor(
    @Inject('STORAGE_CONFIG') private readonly config: any,
    private readonly local: LocalStorageProvider,
    private readonly s3: S3StorageProvider,
  ) {
    this.provider = this.config.provider;
    this.logger.log(`📦 Storage provider: ${this.provider}`);
  }

  async upload(file: Buffer, originalName: string, options?: UploadOptions): Promise<StorageFile> {
    if (this.provider === 's3' && this.s3.isConfigured()) {
      return this.s3.upload(file, originalName, options);
    }
    return this.local.upload(file, originalName, options);
  }

  async delete(path: string): Promise<boolean> {
    if (this.provider === 's3' && this.s3.isConfigured()) {
      return this.s3.delete(path);
    }
    return this.local.delete(path);
  }

  async exists(path: string): Promise<boolean> {
    if (this.provider === 's3' && this.s3.isConfigured()) {
      return this.s3.exists(path);
    }
    return this.local.exists(path);
  }

  getUrl(path: string): string {
    if (this.provider === 's3' && this.s3.isConfigured()) {
      return this.s3.getUrl(path);
    }
    return this.local.getUrl(path);
  }

  async getPresignedUrl(path: string, options?: PresignedUrlOptions): Promise<string | null> {
    if (this.provider === 's3' && this.s3.isConfigured()) {
      return this.s3.getPresignedUrl(path, options);
    }
    // Local storage doesn't support presigned URLs
    return null;
  }

  isCloudStorage(): boolean {
    return this.provider === 's3' && this.s3.isConfigured();
  }

  getProviderName(): string {
    return this.provider;
  }
}
