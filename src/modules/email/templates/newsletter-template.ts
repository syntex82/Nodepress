/**
 * Newsletter Email Template
 */

import { getBaseEmailTemplate } from './base-template';

export function getNewsletterTemplate(): string {
  const content = `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="padding-bottom: 24px;">
      <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #4b5563;">
        Hi {{user.name}},
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 32px;">
      <!-- Dynamic content inserted here -->
      <div style="font-size: 16px; line-height: 1.7; color: #374151;">
        {{{content}}}
      </div>
    </td>
  </tr>
  {{#if featuredItems}}
  <tr>
    <td style="padding-bottom: 32px;">
      <h3 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #111827;">Featured This Week</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        {{#each featuredItems}}
        <tr>
          <td style="padding: 16px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 12px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                {{#if this.image}}
                <td style="width: 80px; vertical-align: top; padding-right: 16px;">
                  <img src="{{this.image}}" alt="{{this.title}}" width="70" height="70" style="border-radius: 8px; object-fit: cover;">
                </td>
                {{/if}}
                <td style="vertical-align: top;">
                  <h4 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #111827;">
                    <a href="{{this.url}}" style="color: #111827; text-decoration: none;">{{this.title}}</a>
                  </h4>
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">{{this.description}}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        {{#unless @last}}<tr><td style="height: 12px;"></td></tr>{{/unless}}
        {{/each}}
      </table>
    </td>
  </tr>
  {{/if}}
  {{#if callToAction}}
  <tr>
    <td style="text-align: center; padding-bottom: 32px;">
      <a href="{{callToAction.url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        {{callToAction.text}}
      </a>
    </td>
  </tr>
  {{/if}}
  <tr>
    <td style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="text-align: center;">
            <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">
              Follow us for more updates
            </p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
              <tr>
                {{#if social.twitter}}
                <td style="padding: 0 8px;">
                  <a href="{{social.twitter}}" style="display: inline-block; width: 36px; height: 36px; background-color: #1da1f2; border-radius: 50%; text-align: center; line-height: 36px; color: #fff; text-decoration: none; font-size: 16px;">𝕏</a>
                </td>
                {{/if}}
                {{#if social.facebook}}
                <td style="padding: 0 8px;">
                  <a href="{{social.facebook}}" style="display: inline-block; width: 36px; height: 36px; background-color: #1877f2; border-radius: 50%; text-align: center; line-height: 36px; color: #fff; text-decoration: none; font-size: 16px;">f</a>
                </td>
                {{/if}}
                {{#if social.linkedin}}
                <td style="padding: 0 8px;">
                  <a href="{{social.linkedin}}" style="display: inline-block; width: 36px; height: 36px; background-color: #0a66c2; border-radius: 50%; text-align: center; line-height: 36px; color: #fff; text-decoration: none; font-size: 16px;">in</a>
                </td>
                {{/if}}
                {{#if social.instagram}}
                <td style="padding: 0 8px;">
                  <a href="{{social.instagram}}" style="display: inline-block; width: 36px; height: 36px; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); border-radius: 50%; text-align: center; line-height: 36px; color: #fff; text-decoration: none; font-size: 16px;">📷</a>
                </td>
                {{/if}}
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

  return getBaseEmailTemplate(content);
}
