/**
 * Email Service
 * Handles transactional emails via SendGrid
 */
import sgMail from '@sendgrid/mail';
import { log } from '../utils/logger.js';

class EmailService {
  constructor() {
    this.configured = false;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@slayseason.com';
    this.fromName = process.env.FROM_NAME || 'Slay Season';

    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.configured = true;
      log.info('Email service initialized with SendGrid');
    } else {
      log.warn('Email service initialized without SENDGRID_API_KEY - emails will be simulated');
    }

    // Email templates
    this.templates = {
      verification: {
        subject: 'Verify your Slay Season account',
        templateId: process.env.SENDGRID_TEMPLATE_VERIFICATION || null
      },
      passwordReset: {
        subject: 'Reset your Slay Season password',
        templateId: process.env.SENDGRID_TEMPLATE_PASSWORD_RESET || null
      },
      welcome: {
        subject: 'Welcome to Slay Season!',
        templateId: process.env.SENDGRID_TEMPLATE_WELCOME || null
      },
      paymentFailed: {
        subject: 'Payment Failed - Action Required',
        templateId: process.env.SENDGRID_TEMPLATE_PAYMENT_FAILED || null
      },
      subscriptionCancelled: {
        subject: 'Subscription Cancelled',
        templateId: process.env.SENDGRID_TEMPLATE_SUBSCRIPTION_CANCELLED || null
      },
      dataExportReady: {
        subject: 'Your data export is ready',
        templateId: process.env.SENDGRID_TEMPLATE_DATA_EXPORT || null
      }
    };
  }

  /**
   * Check if email service is properly configured
   */
  isConfigured() {
    return this.configured;
  }

  /**
   * Send email verification link
   */
  async sendVerificationEmail(email, name, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
    
    if (this.templates.verification.templateId) {
      return this.sendTemplateEmail(
        email,
        this.templates.verification.templateId,
        {
          name,
          verification_url: verificationUrl
        },
        'verification'
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Slay Season!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #667eea;">
          <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Thanks for signing up! Please click the button below to verify your email address and activate your account.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #667eea; word-break: break-all;">${verificationUrl}</a>
          </p>
          
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            This verification link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 14px;">
          <p>© ${new Date().getFullYear()} Slay Season. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail(
      email,
      this.templates.verification.subject,
      html,
      'verification',
      { name, verificationUrl }
    );
  }

  /**
   * Send password reset link
   */
  async sendPasswordResetEmail(email, name, token) {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    
    if (this.templates.passwordReset.templateId) {
      return this.sendTemplateEmail(
        email,
        this.templates.passwordReset.templateId,
        {
          name,
          reset_url: resetUrl
        },
        'password_reset'
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #e74c3c;">
          <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #e74c3c; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <p style="color: #999; font-size: 14px; margin-top: 20px;">
            This reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 14px;">
          <p>© ${new Date().getFullYear()} Slay Season. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail(
      email,
      this.templates.passwordReset.subject,
      html,
      'password_reset',
      { name, resetUrl }
    );
  }

  /**
   * Send welcome email after signup
   */
  async sendWelcomeEmail(email, name) {
    const dashboardUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`;
    
    if (this.templates.welcome.templateId) {
      return this.sendTemplateEmail(
        email,
        this.templates.welcome.templateId,
        {
          name,
          dashboard_url: dashboardUrl
        },
        'welcome'
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🎉 Welcome to Slay Season!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #27ae60;">
          <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your account has been verified and you're all set! Get ready to supercharge your ecommerce analytics with powerful insights and automated reporting.
          </p>
          
          <h3 style="color: #333; margin-top: 30px;">🚀 What's Next?</h3>
          <ul style="color: #666; padding-left: 20px;">
            <li style="margin-bottom: 10px;">Connect your Shopify store to start importing data</li>
            <li style="margin-bottom: 10px;">Link your advertising platforms (Meta, Google) for unified reporting</li>
            <li style="margin-bottom: 10px;">Set up Klaviyo integration for email marketing insights</li>
            <li style="margin-bottom: 10px;">Explore AI-powered forecasting and budget optimization</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background: linear-gradient(135deg, #27ae60 0%, #229954 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Need help getting started? Check out our <a href="${process.env.FRONTEND_URL}/docs" style="color: #667eea;">documentation</a> or reply to this email for support.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 14px;">
          <p>© ${new Date().getFullYear()} Slay Season. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail(
      email,
      this.templates.welcome.subject,
      html,
      'welcome',
      { name, dashboardUrl }
    );
  }

  /**
   * Send payment failed notification
   */
  async sendPaymentFailedEmail(email, name, amount, retryUrl) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Payment Failed</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #e74c3c;">
          <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We were unable to process your payment of $${amount} for your Slay Season subscription. To continue using our service without interruption, please update your payment method.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${retryUrl}" 
               style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              Update Payment Method
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">
            Your account will remain active for 3 days while we attempt to process payment. After that, access to your dashboard will be temporarily suspended until payment is updated.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(
      email,
      this.templates.paymentFailed.subject,
      html,
      'payment_failed',
      { name, amount, retryUrl }
    );
  }

  /**
   * Send data export ready notification
   */
  async sendDataExportEmail(email, name, downloadUrl, expiresAt) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">📊 Data Export Ready</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #3498db;">
          <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your requested data export has been generated and is ready for download.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" 
               style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold;
                      display: inline-block;">
              Download Export
            </a>
          </div>
          
          <p style="color: #999; font-size: 14px;">
            This download link will expire on ${new Date(expiresAt).toLocaleString()}. Please download your file before then.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(
      email,
      this.templates.dataExportReady.subject,
      html,
      'data_export',
      { name, downloadUrl, expiresAt }
    );
  }

  /**
   * Send email using template (if available)
   */
  async sendTemplateEmail(to, templateId, dynamicData, type) {
    if (!this.configured) {
      log.email('template_simulated', to, { type, templateId });
      return { messageId: 'simulated', type: 'template' };
    }

    try {
      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        templateId,
        dynamicTemplateData: {
          ...dynamicData,
          frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',
          support_email: process.env.SUPPORT_EMAIL || 'support@slayseason.com',
          company_name: 'Slay Season',
          year: new Date().getFullYear()
        }
      };

      const [response] = await sgMail.send(msg);
      
      log.email('template_sent', to, { 
        type, 
        templateId,
        messageId: response.headers['x-message-id']
      });

      return {
        messageId: response.headers['x-message-id'],
        type: 'template',
        templateId
      };
    } catch (error) {
      log.error('Failed to send template email', error, { to, type, templateId });
      throw new Error(`Template email sending failed: ${error.message}`);
    }
  }

  /**
   * Send email with HTML content
   */
  async sendEmail(to, subject, html, type, metadata = {}) {
    if (!this.configured) {
      log.email('html_simulated', to, { type, subject });
      return { messageId: 'simulated', type: 'html' };
    }

    try {
      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject,
        html,
        text: this.htmlToText(html) // Auto-generate plain text
      };

      const [response] = await sgMail.send(msg);
      
      log.email('html_sent', to, { 
        type,
        subject,
        messageId: response.headers['x-message-id'],
        ...metadata
      });

      return {
        messageId: response.headers['x-message-id'],
        type: 'html'
      };
    } catch (error) {
      log.error('Failed to send HTML email', error, { to, type, subject });
      throw new Error(`HTML email sending failed: ${error.message}`);
    }
  }

  /**
   * Convert HTML to plain text (basic implementation)
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Bulk email sending (for newsletters, notifications)
   */
  async sendBulkEmail(recipients, subject, html, type) {
    if (!this.configured) {
      log.email('bulk_simulated', 'multiple', { 
        type, 
        subject, 
        count: recipients.length 
      });
      return { messageIds: ['simulated'], type: 'bulk' };
    }

    try {
      const messages = recipients.map(recipient => ({
        to: recipient.email,
        from: {
          email: this.fromEmail,
          name: this.fromName
        },
        subject,
        html: html.replace(/{{name}}/g, recipient.name || 'there'), // Simple template replacement
        text: this.htmlToText(html)
      }));

      const responses = await sgMail.send(messages);
      const messageIds = responses.map(([response]) => response.headers['x-message-id']);

      log.email('bulk_sent', 'multiple', { 
        type,
        subject,
        count: recipients.length,
        messageIds: messageIds.slice(0, 3) // Log first few IDs
      });

      return {
        messageIds,
        type: 'bulk',
        sent: recipients.length
      };
    } catch (error) {
      log.error('Failed to send bulk email', error, { type, subject, count: recipients.length });
      throw new Error(`Bulk email sending failed: ${error.message}`);
    }
  }
}

export { EmailService };
export default new EmailService();