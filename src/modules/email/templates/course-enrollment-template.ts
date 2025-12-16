/**
 * Course Enrollment Email Template
 */

import { getBaseEmailTemplate } from './base-template';

export function getCourseEnrollmentTemplate(): string {
  const content = `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="text-align: center; padding-bottom: 24px;">
      <div style="width: 80px; height: 80px; margin: 0 auto 16px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 50%; display: inline-block; line-height: 80px;">
        <span style="font-size: 36px;">📚</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
        You're Enrolled!
      </h1>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
        Hi {{user.name}}, congratulations! You've successfully enrolled in this course. Get ready to start learning!
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
        {{#if course.thumbnail}}
        <tr>
          <td>
            <img src="{{course.thumbnail}}" alt="{{course.title}}" width="560" style="width: 100%; height: auto; display: block;">
          </td>
        </tr>
        {{/if}}
        <tr>
          <td style="padding: 24px;">
            <h2 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #111827;">
              {{course.title}}
            </h2>
            {{#if course.description}}
            <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #6b7280;">
              {{course.description}}
            </p>
            {{/if}}
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              {{#if course.duration}}
              <tr>
                <td style="padding: 4px 12px 4px 0;">
                  <span style="font-size: 14px; color: #6b7280;">⏱️ {{course.duration}}</span>
                </td>
              </tr>
              {{/if}}
              {{#if course.lessons}}
              <tr>
                <td style="padding: 4px 12px 4px 0;">
                  <span style="font-size: 14px; color: #6b7280;">📖 {{course.lessons}} lessons</span>
                </td>
              </tr>
              {{/if}}
              {{#if course.instructor}}
              <tr>
                <td style="padding: 4px 0;">
                  <span style="font-size: 14px; color: #6b7280;">👨‍🏫 Instructor: {{course.instructor}}</span>
                </td>
              </tr>
              {{/if}}
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 32px;">
      <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">Tips for Success</h3>
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="width: 40px; vertical-align: top;"><span style="font-size: 20px;">🎯</span></td>
                <td><p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Set a schedule</strong> - Dedicate regular time for learning</p></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="width: 40px; vertical-align: top;"><span style="font-size: 20px;">📝</span></td>
                <td><p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Take notes</strong> - Writing helps retention</p></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="width: 40px; vertical-align: top;"><span style="font-size: 20px;">🏆</span></td>
                <td><p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>Complete quizzes</strong> - Test your understanding</p></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="text-align: center;">
      <a href="{{courseUrl}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        Start Learning Now →
      </a>
    </td>
  </tr>
</table>`;

  return getBaseEmailTemplate(content, { preheader: 'Your course enrollment is confirmed!' });
}
