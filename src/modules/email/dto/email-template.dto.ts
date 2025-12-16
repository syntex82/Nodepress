/**
 * Email Template DTOs
 */

import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EmailTemplateType } from '@prisma/client';

export class TemplateVariableDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  example?: string;
}

export class CreateEmailTemplateDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsEnum(EmailTemplateType)
  @IsOptional()
  type?: EmailTemplateType;

  @IsString()
  subject: string;

  @IsString()
  htmlContent: string;

  @IsString()
  @IsOptional()
  textContent?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariableDto)
  @IsOptional()
  variables?: TemplateVariableDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}

export class UpdateEmailTemplateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsEnum(EmailTemplateType)
  @IsOptional()
  type?: EmailTemplateType;

  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  htmlContent?: string;

  @IsString()
  @IsOptional()
  textContent?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariableDto)
  @IsOptional()
  variables?: TemplateVariableDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;
}

export class PreviewTemplateDto {
  @IsOptional()
  variables?: Record<string, any>;
}
