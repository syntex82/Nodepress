/**
 * Order Confirmation Email Template
 */

import { getBaseEmailTemplate } from './base-template';

export function getOrderConfirmationTemplate(): string {
  const content = `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td style="text-align: center; padding-bottom: 24px;">
      <div style="width: 80px; height: 80px; margin: 0 auto 16px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: inline-block; line-height: 80px;">
        <span style="font-size: 36px;">✓</span>
      </div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">
        Order Confirmed!
      </h1>
      <p style="margin: 8px 0 0; font-size: 16px; color: #6b7280;">
        Order #{{order.number}}
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 24px;">
      <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #4b5563;">
        Hi {{user.name}}, thank you for your order! We're getting it ready and will notify you when it ships.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding-bottom: 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
        <tr>
          <td style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">Order Summary</h3>
          </td>
        </tr>
        {{#each order.items}}
        <tr>
          <td style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="width: 60px; vertical-align: top;">
                  {{#if this.image}}
                  <img src="{{this.image}}" alt="{{this.name}}" width="50" height="50" style="border-radius: 6px; object-fit: cover;">
                  {{else}}
                  <div style="width: 50px; height: 50px; background-color: #e5e7eb; border-radius: 6px;"></div>
                  {{/if}}
                </td>
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #111827;">{{this.name}}</p>
                  <p style="margin: 0; font-size: 13px; color: #6b7280;">Qty: {{this.quantity}}</p>
                </td>
                <td style="text-align: right; vertical-align: top;">
                  <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">\${{this.price}}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        {{/each}}
        <tr>
          <td style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td><p style="margin: 0; font-size: 14px; color: #6b7280;">Subtotal</p></td>
                <td style="text-align: right;"><p style="margin: 0; font-size: 14px; color: #111827;">\${{order.subtotal}}</p></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 20px; border-bottom: 1px solid #e5e7eb;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td><p style="margin: 0; font-size: 14px; color: #6b7280;">Shipping</p></td>
                <td style="text-align: right;"><p style="margin: 0; font-size: 14px; color: #111827;">{{#if order.shipping}}\${{order.shipping}}{{else}}Free{{/if}}</p></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td><p style="margin: 0; font-size: 16px; font-weight: 700; color: #111827;">Total</p></td>
                <td style="text-align: right;"><p style="margin: 0; font-size: 18px; font-weight: 700; color: #6366f1;">\${{order.total}}</p></td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  {{#if order.shippingAddress}}
  <tr>
    <td style="padding-bottom: 32px;">
      <h3 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #111827;">Shipping Address</h3>
      <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
        {{order.shippingAddress.name}}<br>
        {{order.shippingAddress.street}}<br>
        {{order.shippingAddress.city}}, {{order.shippingAddress.state}} {{order.shippingAddress.zip}}<br>
        {{order.shippingAddress.country}}
      </p>
    </td>
  </tr>
  {{/if}}
  <tr>
    <td style="text-align: center;">
      <a href="{{orderUrl}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px;">
        View Order Details
      </a>
    </td>
  </tr>
</table>`;

  return getBaseEmailTemplate(content, { preheader: 'Your order has been confirmed!' });
}
