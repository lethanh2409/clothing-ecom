// ==========================================
// 3. chatbot/chatbot.service.ts
// ==========================================
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ChatMessageDto } from './dtos/chat-message.dto';

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly n8nWebhookUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.n8nWebhookUrl = this.configService.get<string>('N8N_WEBHOOK_URL')!;

    if (!this.n8nWebhookUrl) {
      this.logger.error('❌ N8N_WEBHOOK_URL is not configured in .env');
      throw new Error('N8N_WEBHOOK_URL is required');
    }

    this.logger.log(`✅ Chatbot Service initialized with webhook: ${this.n8nWebhookUrl}`);
  }

  /**
   * Gửi message đến N8N webhook và nhận response
   */
  async sendMessageToN8N(messageDto: ChatMessageDto) {
    const { message, session_id, user_id } = messageDto;

    this.logger.log(`📤 Sending message to N8N: "${message.substring(0, 50)}..."`);

    const payload = {
      message,
      session_id: session_id || this.generateSessionId(),
      user_id,
      timestamp: new Date().toISOString(),
      source: 'clothing-ecom-api',
    };

    this.logger.debug('📦 Payload:', JSON.stringify(payload, null, 2));

    try {
      const observable = this.httpService.post(this.n8nWebhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`🔗 Webhook URL: ${this.n8nWebhookUrl}`);
      const response = await firstValueFrom(observable);

      this.logger.log('✅ Received response from N8N');
      this.logger.debug('Response data:', JSON.stringify(response.data, null, 2));

      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      const error = err as AxiosError;

      this.logger.error('❌ Error calling N8N webhook:', error.message);

      if (error.response) {
        this.logger.error('Response status:', error.response.status);
        this.logger.error('Response data:', error.response.data);
      }

      throw new HttpException(
        {
          success: false,
          error: 'Failed to process message. Please try again later.',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Health check - ping N8N webhook
   */
  async healthCheck(): Promise<{ status: string; webhook_url: string }> {
    try {
      const observable = this.httpService.get(this.n8nWebhookUrl, {
        timeout: 5000,
      });

      await firstValueFrom(observable);

      return {
        status: 'ok',
        webhook_url: this.n8nWebhookUrl,
      };
    } catch (err) {
      this.logger.warn('⚠️ N8N webhook health check failed');
      return {
        status: 'error',
        webhook_url: this.n8nWebhookUrl,
      };
    }
  }
}
