/**
 * Email Service
 * Handles sending emails via SMTP/Nodemailer
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import { PrismaService } from '../../database/prisma.service';
import { EmailStatus } from '@prisma/client';

export interface EmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  templateId?: string;
  recipientId?: string;
  metadata?: Record<string, any>;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  logId?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;
  private defaultFromName: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const secure = this.configService.get<boolean>('SMTP_SECURE', false);
    const user = this.configService.get<string>('SMTP_USER', '');
    const pass = this.configService.get<string>('SMTP_PASS', '');

    this.defaultFrom = this.configService.get<string>('SMTP_FROM', user);
    this.defaultFromName = this.configService.get<string>('SMTP_FROM_NAME', 'WordPress Node CMS');

    if (!user || !pass) {
      this.logger.warn('SMTP credentials not configured. Email sending will fail.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });

    this.logger.log(`Email transporter initialized: ${host}:${port}`);
  }

  /**
   * Send an email and log it
   */
  async send(options: EmailOptions): Promise<SendResult> {
    const fromEmail = options.from || this.defaultFrom;
    const fromName = options.fromName || this.defaultFromName;

    // Create email log entry
    const emailLog = await this.prisma.emailLog.create({
      data: {
        templateId: options.templateId,
        recipientId: options.recipientId,
        toEmail: options.to,
        toName: options.toName,
        fromEmail,
        fromName,
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text,
        status: EmailStatus.PENDING,
        metadata: options.metadata,
      },
    });

    if (!this.transporter) {
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.FAILED,
          failedAt: new Date(),
          errorMessage: 'SMTP transporter not configured',
        },
      });
      return { success: false, error: 'SMTP not configured', logId: emailLog.id };
    }

    try {
      const result = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: options.toName ? `"${options.toName}" <${options.to}>` : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      });

      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.SENT,
          sentAt: new Date(),
          providerMessageId: result.messageId,
          providerResponse: result as any,
        },
      });

      this.logger.log(`Email sent to ${options.to}: ${result.messageId}`);
      return { success: true, messageId: result.messageId, logId: emailLog.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: EmailStatus.FAILED,
          failedAt: new Date(),
          errorMessage,
        },
      });
      this.logger.error(`Failed to send email to ${options.to}: ${errorMessage}`);
      return { success: false, error: errorMessage, logId: emailLog.id };
    }
  }

  /**
   * Render a template with variables
   */
  renderTemplate(template: string, variables: Record<string, any>): string {
    const compiled = Handlebars.compile(template);
    return compiled(variables);
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) return false;
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
