/**
 * Storage Interface
 * Defines the contract for storage providers
 */

export interface StorageFile {
  path: string;
  url: string;
  size: number;
  mimeType: string;
  filename: string;
}

export interface UploadOptions {
  folder?: string;
  filename?: string;
  mimeType?: string;
  metadata?: Record<string, string>;
}

export interface PresignedUrlOptions {
  expiresIn?: number; // seconds
  contentType?: string;
}

export interface StorageProvider {
  upload(file: Buffer, originalName: string, options?: UploadOptions): Promise<StorageFile>;

  delete(path: string): Promise<boolean>;

  exists(path: string): Promise<boolean>;

  getUrl(path: string): string;

  getPresignedUrl?(path: string, options?: PresignedUrlOptions): Promise<string>;

  getPresignedUploadUrl?(
    path: string,
    options?: PresignedUrlOptions,
  ): Promise<{ url: string; fields?: Record<string, string> }>;
}
