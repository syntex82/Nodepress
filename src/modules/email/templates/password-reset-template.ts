/**
 * Password Reset Email Template
 */

import { getBaseEmailTemplate } from './base-template';

export function getPasswordResetTemplate(): string {
  const content = `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="text-align: center; padding-bottom: 24px;">
      <div style="width: 80px; height: 80px; margin: 0 auto 16px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: inline-block; line-height: 80px;">
        <span style="font-size: 36px;">🔐</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
        Reset Your Password
      </h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #4b5563;">
        Hi {{user.name}},
      </p>
      <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
        We received a request to reset your password. Click the button below to create a new password. If you didn't make this request, you can safely ignore this email.
      </p>
    </td>
  </tr>
  <tr>
    <td style="text-align: center; padding-bottom: 32px;">
      <a href="{{resetUrl}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);">
        Reset Password
      </a>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 16px;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>⏰ This link expires in {{expiresIn}}.</strong><br>
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 16px;">
      <p style="margin: 0; font-size: 14px; color: #6b7280;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
    </td>
  </tr>
  <tr>
    <td>
      <p style="margin: 0; font-size: 12px; color: #9ca3af; word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px;">
        {{resetUrl}}
      </p>
    </td>
  </tr>
</table>`;

  return getBaseEmailTemplate(content, { preheader: 'Reset your password for your account' });
}
