/**
 * Email Templates Service
 * Manages email templates CRUD and rendering
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from './email.service';
import { EmailTemplateType } from '@prisma/client';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from './dto/email-template.dto';

@Injectable()
export class EmailTemplatesService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Create a new email template
   */
  async create(dto: CreateEmailTemplateDto, userId?: string) {
    // Check if slug already exists
    const existing = await this.prisma.emailTemplate.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new ConflictException(`Template with slug "${dto.slug}" already exists`);
    }

    return this.prisma.emailTemplate.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        type: dto.type || EmailTemplateType.CUSTOM,
        subject: dto.subject,
        htmlContent: dto.htmlContent,
        textContent: dto.textContent,
        variables: dto.variables ? JSON.parse(JSON.stringify(dto.variables)) : undefined,
        isActive: dto.isActive ?? true,
        isSystem: dto.isSystem ?? false,
        createdById: userId,
      },
    });
  }

  /**
   * Get all templates with pagination
   */
  async findAll(page = 1, limit = 20, type?: EmailTemplateType) {
    const skip = (page - 1) * limit;

    const where = type ? { type } : {};

    const [templates, total] = await Promise.all([
      this.prisma.emailTemplate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { emailLogs: true } },
        },
      }),
      this.prisma.emailTemplate.count({ where }),
    ]);

    return {
      data: templates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a template by ID
   */
  async findById(id: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { emailLogs: true } },
      },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found`);
    }

    return template;
  }

  /**
   * Get a template by slug
   */
  async findBySlug(slug: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { slug },
    });

    if (!template) {
      throw new NotFoundException(`Template with slug "${slug}" not found`);
    }

    return template;
  }

  /**
   * Update a template
   */
  async update(id: string, dto: UpdateEmailTemplateDto) {
    const template = await this.findById(id);

    // Check if it's a system template
    if (template.isSystem && dto.isSystem === false) {
      throw new ConflictException('Cannot change system template status');
    }

    // Check slug uniqueness if changing
    if (dto.slug && dto.slug !== template.slug) {
      const existing = await this.prisma.emailTemplate.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(`Template with slug "${dto.slug}" already exists`);
      }
    }

    const updateData: any = { ...dto };
    if (dto.variables) {
      updateData.variables = JSON.parse(JSON.stringify(dto.variables));
    }

    return this.prisma.emailTemplate.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a template
   */
  async delete(id: string) {
    const template = await this.findById(id);

    if (template.isSystem) {
      throw new ConflictException('Cannot delete system templates');
    }

    return this.prisma.emailTemplate.delete({ where: { id } });
  }

  /**
   * Preview a template with sample data
   */
  async preview(id: string, variables: Record<string, any>) {
    const template = await this.findById(id);
    const renderedHtml = this.emailService.renderTemplate(template.htmlContent, variables);
    const renderedSubject = this.emailService.renderTemplate(template.subject, variables);

    return {
      subject: renderedSubject,
      html: renderedHtml,
      text: template.textContent
        ? this.emailService.renderTemplate(template.textContent, variables)
        : null,
    };
  }
}
