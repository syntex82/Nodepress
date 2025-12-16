/**
 * Send Email DTOs
 */

import { IsString, IsOptional, IsEnum, IsArray, IsEmail } from 'class-validator';
import { UserRole } from '@prisma/client';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsString()
  @IsOptional()
  toName?: string;

  @IsString()
  subject: string;

  @IsString()
  html: string;

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  templateId?: string;
}

export class SendTemplateEmailDto {
  @IsString()
  templateId: string;

  @IsEmail()
  to: string;

  @IsString()
  @IsOptional()
  toName?: string;

  @IsString()
  @IsOptional()
  subject?: string; // Override template subject

  @IsOptional()
  variables?: Record<string, any>;
}

export class SendBulkEmailDto {
  @IsString()
  templateId: string;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsEnum(['all', 'role', 'specific'])
  recipientType: 'all' | 'role' | 'specific';

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userIds?: string[];

  @IsOptional()
  variables?: Record<string, any>;

  @IsEmail()
  @IsOptional()
  sendTestTo?: string;
}

export class SendTestEmailDto {
  @IsString()
  templateId: string;

  @IsEmail()
  to: string;

  @IsOptional()
  variables?: Record<string, any>;
}
