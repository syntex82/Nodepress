/**
 * Email Controller
 * Handles email-related HTTP requests
 */

import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, EmailTemplateType, EmailStatus } from '@prisma/client';
import { EmailService } from './email.service';
import { EmailTemplatesService } from './email-templates.service';
import { EmailLogsService } from './email-logs.service';
import { BulkEmailService } from './bulk-email.service';
import {
  CreateEmailTemplateDto,
  UpdateEmailTemplateDto,
  PreviewTemplateDto,
} from './dto/email-template.dto';
import {
  SendEmailDto,
  SendTemplateEmailDto,
  SendBulkEmailDto,
  SendTestEmailDto,
} from './dto/send-email.dto';

@Controller('api/email')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailController {
  constructor(
    private emailService: EmailService,
    private templatesService: EmailTemplatesService,
    private logsService: EmailLogsService,
    private bulkEmailService: BulkEmailService,
  ) {}

  // ==================== TEMPLATES ====================

  @Get('templates')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async getTemplates(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('type') type?: EmailTemplateType,
  ) {
    return this.templatesService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      type,
    );
  }

  @Get('templates/:id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async getTemplate(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @Post('templates')
  @Roles(UserRole.ADMIN)
  async createTemplate(@Body() dto: CreateEmailTemplateDto, @CurrentUser() user: any) {
    return this.templatesService.create(dto, user.id);
  }

  @Put('templates/:id')
  @Roles(UserRole.ADMIN)
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateEmailTemplateDto) {
    return this.templatesService.update(id, dto);
  }

  @Delete('templates/:id')
  @Roles(UserRole.ADMIN)
  async deleteTemplate(@Param('id') id: string) {
    return this.templatesService.delete(id);
  }

  @Post('templates/:id/preview')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async previewTemplate(@Param('id') id: string, @Body() dto: PreviewTemplateDto) {
    return this.templatesService.preview(id, dto.variables || {});
  }

  // ==================== SENDING ====================

  @Post('send')
  @Roles(UserRole.ADMIN)
  async sendEmail(@Body() dto: SendEmailDto) {
    return this.emailService.send(dto);
  }

  @Post('send-template')
  @Roles(UserRole.ADMIN)
  async sendTemplateEmail(@Body() dto: SendTemplateEmailDto) {
    const template = await this.templatesService.findById(dto.templateId);
    const variables = dto.variables || {};

    const renderedHtml = this.emailService.renderTemplate(template.htmlContent, variables);
    const subject = dto.subject
      ? this.emailService.renderTemplate(dto.subject, variables)
      : this.emailService.renderTemplate(template.subject, variables);

    return this.emailService.send({
      to: dto.to,
      toName: dto.toName,
      subject,
      html: renderedHtml,
      text: template.textContent
        ? this.emailService.renderTemplate(template.textContent, variables)
        : undefined,
      templateId: template.id,
    });
  }

  @Post('send-bulk')
  @Roles(UserRole.ADMIN)
  async sendBulkEmail(@Body() dto: SendBulkEmailDto) {
    return this.bulkEmailService.sendBulkEmail(dto);
  }

  @Post('send-test')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async sendTestEmail(@Body() dto: SendTestEmailDto) {
    const template = await this.templatesService.findById(dto.templateId);
    const variables = {
      ...dto.variables,
      user: { id: 'test', name: 'Test User', email: dto.to, firstName: 'Test' },
    };

    const renderedHtml = this.emailService.renderTemplate(template.htmlContent, variables);
    const subject = `[TEST] ${this.emailService.renderTemplate(template.subject, variables)}`;

    return this.emailService.send({
      to: dto.to,
      toName: 'Test User',
      subject,
      html: renderedHtml,
      templateId: template.id,
      metadata: { testEmail: true },
    });
  }

  @Get('verify')
  @Roles(UserRole.ADMIN)
  async verifyConnection() {
    const connected = await this.emailService.verifyConnection();
    return {
      connected,
      message: connected ? 'SMTP connection successful' : 'SMTP connection failed',
    };
  }

  // ==================== LOGS ====================

  @Get('logs')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async getLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: EmailStatus,
    @Query('templateId') templateId?: string,
    @Query('toEmail') toEmail?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.logsService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 20, {
      status,
      templateId,
      toEmail,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('logs/stats')
  @Roles(UserRole.ADMIN)
  async getLogStats(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.logsService.getStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('logs/recent')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.logsService.getRecentActivity(limit ? parseInt(limit) : 10);
  }

  @Get('logs/:id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async getLog(@Param('id') id: string) {
    return this.logsService.findById(id);
  }

  @Delete('logs/cleanup')
  @Roles(UserRole.ADMIN)
  async cleanupLogs(@Query('daysOld') daysOld?: string) {
    return this.logsService.cleanupOldLogs(daysOld ? parseInt(daysOld) : 90);
  }
}
