/**
 * Welcome Email Template
 */

import { getBaseEmailTemplate } from './base-template';

export function getWelcomeTemplate(): string {
  const content = `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="text-align: center; padding-bottom: 24px;">
      <div style="width: 80px; height: 80px; margin: 0 auto 16px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: inline-block; line-height: 80px;">
        <span style="font-size: 36px;">🎉</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
        Welcome, {{user.firstName}}!
      </h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
        We're thrilled to have you join <strong>{{site.name}}</strong>! Your account has been created successfully and you're all set to explore everything we have to offer.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="background-color: #f3f4f6; border-radius: 8px; padding: 20px;">
            <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827;">Your Account Details</h3>
            <p style="margin: 0 0 8px; font-size: 14px; color: #4b5563;">
              <strong>Email:</strong> {{user.email}}
            </p>
            <p style="margin: 0; font-size: 14px; color: #4b5563;">
              <strong>Name:</strong> {{user.name}}
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 32px;">
      <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">What's Next?</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="width: 40px; vertical-align: top;">
                  <span style="font-size: 20px;">📚</span>
                </td>
                <td>
                  <p style="margin: 0; font-size: 14px; color: #4b5563;">
                    <strong>Explore Courses</strong> - Browse our library of courses and start learning
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="width: 40px; vertical-align: top;">
                  <span style="font-size: 20px;">🛒</span>
                </td>
                <td>
                  <p style="margin: 0; font-size: 14px; color: #4b5563;">
                    <strong>Shop Products</strong> - Discover amazing products in our store
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="width: 40px; vertical-align: top;">
                  <span style="font-size: 20px;">👤</span>
                </td>
                <td>
                  <p style="margin: 0; font-size: 14px; color: #4b5563;">
                    <strong>Complete Profile</strong> - Add your details and personalize your experience
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="text-align: center;">
      <a href="{{loginUrl}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);">
        Get Started →
      </a>
    </td>
  </tr>
</table>`;

  return getBaseEmailTemplate(content, { preheader: 'Welcome to our community!' });
}
