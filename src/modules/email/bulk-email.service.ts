/**
 * Bulk Email Service
 * Handles sending emails to multiple recipients
 */

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmailService } from './email.service';
import { EmailTemplatesService } from './email-templates.service';
import { UserRole } from '@prisma/client';

export interface BulkEmailOptions {
  templateId: string;
  subject?: string; // Override template subject
  recipientType: 'all' | 'role' | 'specific';
  role?: UserRole;
  userIds?: string[];
  variables?: Record<string, any>; // Global variables
  sendTestTo?: string; // Send test email first
}

export interface BulkEmailResult {
  totalRecipients: number;
  successful: number;
  failed: number;
  errors: { email: string; error: string }[];
}

@Injectable()
export class BulkEmailService {
  private readonly logger = new Logger(BulkEmailService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private templatesService: EmailTemplatesService,
  ) {}

  /**
   * Send bulk emails
   */
  async sendBulkEmail(options: BulkEmailOptions): Promise<BulkEmailResult> {
    const template = await this.templatesService.findById(options.templateId);

    // Get recipients
    const recipients = await this.getRecipients(options);

    if (recipients.length === 0) {
      throw new BadRequestException('No recipients found');
    }

    // Send test email first if specified
    if (options.sendTestTo) {
      await this.sendTestEmail(options.sendTestTo, template, options.variables || {});
    }

    const result: BulkEmailResult = {
      totalRecipients: recipients.length,
      successful: 0,
      failed: 0,
      errors: [],
    };

    // Send emails in batches to avoid overwhelming the SMTP server
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (user) => {
          const userVars = {
            ...options.variables,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              firstName: user.name.split(' ')[0],
            },
          };

          const renderedHtml = this.emailService.renderTemplate(template.htmlContent, userVars);
          const subject = options.subject
            ? this.emailService.renderTemplate(options.subject, userVars)
            : this.emailService.renderTemplate(template.subject, userVars);

          const sendResult = await this.emailService.send({
            to: user.email,
            toName: user.name,
            subject,
            html: renderedHtml,
            text: template.textContent
              ? this.emailService.renderTemplate(template.textContent, userVars)
              : undefined,
            templateId: template.id,
            recipientId: user.id,
            metadata: { bulkEmail: true, ...options.variables },
          });

          if (sendResult.success) {
            result.successful++;
          } else {
            result.failed++;
            result.errors.push({ email: user.email, error: sendResult.error || 'Unknown error' });
          }
        }),
      );

      // Small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    this.logger.log(`Bulk email sent: ${result.successful}/${result.totalRecipients} successful`);
    return result;
  }

  /**
   * Get recipients based on options
   */
  private async getRecipients(options: BulkEmailOptions) {
    if (options.recipientType === 'specific' && options.userIds?.length) {
      return this.prisma.user.findMany({
        where: { id: { in: options.userIds } },
        select: { id: true, name: true, email: true },
      });
    }

    if (options.recipientType === 'role' && options.role) {
      return this.prisma.user.findMany({
        where: { role: options.role },
        select: { id: true, name: true, email: true },
      });
    }

    // All users
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
  }

  /**
   * Send a test email
   */
  private async sendTestEmail(testEmail: string, template: any, variables: Record<string, any>) {
    const testVars = {
      ...variables,
      user: { id: 'test', name: 'Test User', email: testEmail, firstName: 'Test' },
    };

    await this.emailService.send({
      to: testEmail,
      toName: 'Test User',
      subject: `[TEST] ${this.emailService.renderTemplate(template.subject, testVars)}`,
      html: this.emailService.renderTemplate(template.htmlContent, testVars),
      templateId: template.id,
      metadata: { testEmail: true },
    });
  }
}
