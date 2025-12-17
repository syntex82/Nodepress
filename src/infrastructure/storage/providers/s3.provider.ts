/**
 * S3 Storage Provider
 * Stores files in S3-compatible storage (AWS S3, Cloudflare R2, DigitalOcean Spaces, MinIO)
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  StorageProvider,
  StorageFile,
  UploadOptions,
  PresignedUrlOptions,
} from '../storage.interface';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private client: S3Client | null = null;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(@Inject('STORAGE_CONFIG') private readonly config: any) {
    this.bucket = this.config.s3.bucket || '';
    this.publicUrl = this.config.s3.publicUrl || '';

    if (this.config.s3.accessKeyId && this.config.s3.secretAccessKey && this.bucket) {
      this.client = new S3Client({
        region: this.config.s3.region,
        endpoint: this.config.s3.endpoint,
        credentials: {
          accessKeyId: this.config.s3.accessKeyId,
          secretAccessKey: this.config.s3.secretAccessKey,
        },
        forcePathStyle: this.config.s3.forcePathStyle,
      });
      this.logger.log('✅ S3 storage initialized');
    }
  }

  isConfigured(): boolean {
    return this.client !== null;
  }

  async upload(file: Buffer, originalName: string, options?: UploadOptions): Promise<StorageFile> {
    if (!this.client) {
      throw new Error('S3 storage not configured');
    }

    const ext = path.extname(originalName);
    const filename = options?.filename || `${uuidv4()}${ext}`;
    const folder = options?.folder || this.getDateFolder();
    const key = `${folder}/${filename}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: options?.mimeType,
        Metadata: options?.metadata,
      }),
    );

    return {
      path: key,
      url: this.getUrl(key),
      size: file.length,
      mimeType: options?.mimeType || 'application/octet-stream',
      filename,
    };
  }

  async delete(key: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch (_error) {
      this.logger.warn(`Failed to delete S3 object: ${key}`);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client) return false;

    try {
      await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      return true;
    } catch {
      return false;
    }
  }

  getUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    if (this.config.s3.endpoint) {
      return `${this.config.s3.endpoint}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.config.s3.region}.amazonaws.com/${key}`;
  }

  async getPresignedUrl(key: string, options?: PresignedUrlOptions): Promise<string> {
    if (!this.client) {
      throw new Error('S3 storage not configured');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: options?.expiresIn || 3600,
    });
  }

  private getDateFolder(): string {
    const now = new Date();
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
