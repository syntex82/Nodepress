/**
 * Update Page DTO
 */

import { IsString, IsEnum, IsOptional, IsObject, Matches } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class UpdatePageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase with hyphens only (e.g., my-page-title)',
  })
  slug?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  template?: string;

  @IsString()
  @IsOptional()
  featuredImage?: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsObject()
  @IsOptional()
  customFields?: any;
}
