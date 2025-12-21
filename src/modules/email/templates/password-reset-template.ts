/**
 * Password Reset Email Template
 * Secure password reset email with clear instructions
 */

import { getBaseEmailTemplate } from './base-template';

interface PasswordResetTemplateData {
  user: { firstName: string };
  resetUrl: string;
  expiresIn: string;
  supportUrl: string;
}

export function getPasswordResetTemplate(data: PasswordResetTemplateData): string {
  const { user, resetUrl, expiresIn, supportUrl } = data;

  const content = `
<!-- Hero Section -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="text-align: center; padding-bottom: 32px;">
      <div style="width: 100px; height: 100px; margin: 0 auto 20px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 48px; box-shadow: 0 8px 16px rgba(245, 158, 11, 0.2);">
        🔐
      </div>
      <h1 style="margin: 0 0 12px; font-size: 32px; font-weight: 800; color: #111827; letter-spacing: -1px;">
        Reset Your Password
      </h1>
      <p style="margin: 0; font-size: 16px; color: #6b7280;">
        Secure your account with a new password
      </p>
    </td>
  </tr>
</table>

<!-- Main Message -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding-bottom: 32px;">
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.8; color: #374151;">
        Hi {{user.firstName}},
      </p>
      <p style="margin: 0; font-size: 16px; line-height: 1.8; color: #374151;">
        We received a request to reset your password. Click the button below to create a new, secure password for your account.
      </p>
    </td>
  </tr>
</table>

<!-- CTA Button -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="text-align: center; padding-bottom: 32px;">
      <a href="{{resetUrl}}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);">
        Reset Password Now
      </a>
    </td>
  </tr>
</table>

<!-- Security Alert -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding-bottom: 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="background: linear-gradient(135deg, #fef3c7 0%, #fef08a 100%); border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="width: 30px; vertical-align: top; padding-right: 12px; font-size: 20px;">⏰</td>
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 8px; font-size: 14px; font-weight: 700; color: #92400e;">
                    Link Expires in {{expiresIn}}
                  </p>
                  <p style="margin: 0; font-size: 13px; color: #b45309; line-height: 1.6;">
                    For security reasons, this password reset link will expire after {{expiresIn}}. If you don't reset your password within this time, you'll need to request a new link.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

<!-- Security Tips -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding-bottom: 32px;">
      <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 700; color: #111827;">🛡️ Security Tips</h3>
      <ul style="margin: 0; padding-left: 20px; color: #6b7280; font-size: 14px; line-height: 1.8;">
        <li style="margin-bottom: 8px;">Use a strong password with uppercase, lowercase, numbers, and symbols</li>
        <li style="margin-bottom: 8px;">Never share your password with anyone</li>
        <li>If you didn't request this reset, your account may be at risk. Contact support immediately.</li>
      </ul>
    </td>
  </tr>
</table>

<!-- Fallback Link -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding-bottom: 24px; border-top: 1px solid #e5e7eb; padding-top: 24px;">
      <p style="margin: 0 0 12px; font-size: 13px; color: #6b7280;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin: 0; font-size: 12px; color: #9ca3af; word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace;">
        {{resetUrl}}
      </p>
    </td>
  </tr>
</table>

<!-- Support -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding-top: 16px;">
      <p style="margin: 0; font-size: 13px; color: #6b7280;">
        <strong style="color: #111827;">Didn't request this?</strong> <a href="${supportUrl}" style="color: #f59e0b; text-decoration: none; font-weight: 600;">Contact our support team</a> immediately if you believe your account has been compromised.
      </p>
    </td>
  </tr>
</table>`;

  // Replace placeholders with actual values
  const processedContent = content
    .replace(/\{\{user\.firstName\}\}/g, user.firstName)
    .replace(/\{\{resetUrl\}\}/g, resetUrl)
    .replace(/\{\{expiresIn\}\}/g, expiresIn)
    .replace(/\{\{supportUrl\}\}/g, supportUrl);

  return getBaseEmailTemplate(processedContent, { preheader: 'Reset your password securely' });
}
