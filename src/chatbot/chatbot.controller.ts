// ==========================================
// 4. chatbot/chatbot.controller.ts
// ==========================================
import { Controller, Post, Body, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatMessageDto, ChatResponseDto } from './dtos/chat-message.dto';
import { Public } from 'src/auth/public.decorator';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * POST /chatbot/message
   * Gửi tin nhắn đến chatbot
   */
  @Public()
  @Post('message')
  @HttpCode(HttpStatus.OK)
  async sendMessage(@Body() messageDto: ChatMessageDto): Promise<ChatResponseDto> {
    return this.chatbotService.sendMessageToN8N(messageDto);
  }

  /**
   * GET /chatbot/health
   * Kiểm tra kết nối với N8N webhook
   */
  @Get('health')
  async healthCheck() {
    return this.chatbotService.healthCheck();
  }

  /**
   * POST /chatbot/test
   * Test endpoint để verify webhook hoạt động
   */
  @Post('test')
  async testWebhook() {
    const testMessage: ChatMessageDto = {
      message: 'Hello from NestJS! This is a test message.',
      session_id: 'test_session',
    };

    return this.chatbotService.sendMessageToN8N(testMessage);
  }
}
