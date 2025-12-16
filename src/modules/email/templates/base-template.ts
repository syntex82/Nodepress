/**
 * Base Email Template
 * Mobile-responsive template that works across all major email clients
 */

export function getBaseEmailTemplate(
  content: string,
  options: { preheader?: string } = {},
): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>{{site.name}}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    /* Base styles */
    body {
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      background-color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }
    
    /* Container */
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    
    /* Responsive styles */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .fluid { max-width: 100% !important; height: auto !important; margin-left: auto !important; margin-right: auto !important; }
      .stack-column { display: block !important; width: 100% !important; max-width: 100% !important; }
      .center-on-narrow { text-align: center !important; display: block !important; margin-left: auto !important; margin-right: auto !important; float: none !important; }
      .mobile-padding { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
  ${options.preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${options.preheader}</div>` : ''}
  
  <!-- Background wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <!-- Email container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="email-container" style="margin: 0 auto; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; text-align: center; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);">
              {{#if site.logo}}
                <img src="{{site.logo}}" alt="{{site.name}}" width="150" style="max-width: 150px; height: auto;">
              {{else}}
                <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">{{site.name}}</h1>
              {{/if}}
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;" class="mobile-padding">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 32px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">
                      © {{year}} {{site.name}}. All rights reserved.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                      {{#if site.address}}{{site.address}}{{/if}}
                    </p>
                    {{#if unsubscribeUrl}}
                    <p style="margin: 16px 0 0; font-size: 12px;">
                      <a href="{{unsubscribeUrl}}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a>
                    </p>
                    {{/if}}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
