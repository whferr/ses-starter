import { SESClient, SendEmailCommand, SendEmailCommandInput } from '@aws-sdk/client-ses';
import { AWSSettings } from './types';

export class AWSSESService {
  private client: SESClient | null = null;
  private settings: AWSSettings | null = null;

  constructor() {
    this.initializeFromEnv();
  }

  private initializeFromEnv() {
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const fromEmail = process.env.DEFAULT_FROM_EMAIL;

    if (region && accessKeyId && secretAccessKey && fromEmail) {
      this.configure({
        region,
        accessKeyId,
        secretAccessKey,
        fromEmail,
        replyToEmail: process.env.REACT_APP_DEFAULT_REPLY_TO_EMAIL,
      });
    }
  }

  configure(settings: AWSSettings) {
    this.settings = settings;
    this.client = new SESClient({
      region: settings.region,
      credentials: {
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
      },
    });
  }

  isConfigured(): boolean {
    return this.client !== null && this.settings !== null;
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'AWS SES not configured' };
    }

    try {
      // Test by getting send quota (this doesn't send an email)
      const { GetSendQuotaCommand } = await import('@aws-sdk/client-ses');
      const command = new GetSendQuotaCommand({});
      await this.client!.send(command);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    from?: string;
    replyTo?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured() || !this.settings) {
      return { success: false, error: 'AWS SES not configured' };
    }

    try {
      const input: SendEmailCommandInput = {
        Source: params.from || this.settings.fromEmail,
        Destination: {
          ToAddresses: [params.to],
        },
        Message: {
          Subject: {
            Data: params.subject,
            Charset: 'UTF-8',
          },
          Body: {
            Html: {
              Data: params.htmlContent,
              Charset: 'UTF-8',
            },
            Text: {
              Data: params.textContent,
              Charset: 'UTF-8',
            },
          },
        },
      };

      if (params.replyTo || this.settings.replyToEmail) {
        input.ReplyToAddresses = [params.replyTo || this.settings.replyToEmail!];
      }

      const command = new SendEmailCommand(input);
      const result = await this.client!.send(command);

      return { 
        success: true, 
        messageId: result.MessageId 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async sendBulkEmail(params: {
    recipients: string[];
    subject: string;
    htmlContent: string;
    textContent: string;
    from?: string;
    replyTo?: string;
    onProgress?: (sent: number, total: number) => void;
    onError?: (email: string, error: string) => void;
  }): Promise<{ 
    success: boolean; 
    sent: number; 
    failed: number; 
    errors: Array<{ email: string; error: string }> 
  }> {
    if (!this.isConfigured()) {
      return { success: false, sent: 0, failed: 0, errors: [{ email: '', error: 'AWS SES not configured' }] };
    }

    const results = {
      success: true,
      sent: 0,
      failed: 0,
      errors: [] as Array<{ email: string; error: string }>
    };

    for (let i = 0; i < params.recipients.length; i++) {
      const email = params.recipients[i];
      
      try {
        const result = await this.sendEmail({
          to: email,
          subject: params.subject,
          htmlContent: params.htmlContent,
          textContent: params.textContent,
          from: params.from,
          replyTo: params.replyTo,
        });

        if (result.success) {
          results.sent++;
        } else {
          results.failed++;
          results.errors.push({ email, error: result.error || 'Unknown error' });
          params.onError?.(email, result.error || 'Unknown error');
        }
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push({ email, error: errorMessage });
        params.onError?.(email, errorMessage);
      }

      params.onProgress?.(results.sent + results.failed, params.recipients.length);

      // Rate limiting: wait 2-3 seconds between emails
      if (i < params.recipients.length - 1) {
        const delay = 2000 + Math.random() * 1000; // 2-3 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return results;
  }

  async getSendQuota(): Promise<{ 
    success: boolean; 
    quota?: { max24Hour: number; maxSendRate: number; sentLast24Hours: number };
    error?: string;
  }> {
    if (!this.isConfigured()) {
      return { success: false, error: 'AWS SES not configured' };
    }

    try {
      const { GetSendQuotaCommand } = await import('@aws-sdk/client-ses');
      const command = new GetSendQuotaCommand({});
      const result = await this.client!.send(command);

      return {
        success: true,
        quota: {
          max24Hour: result.Max24HourSend || 0,
          maxSendRate: result.MaxSendRate || 0,
          sentLast24Hours: result.SentLast24Hours || 0,
        },
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  getSettings(): AWSSettings | null {
    return this.settings;
  }
}

export const awsSESService = new AWSSESService(); 