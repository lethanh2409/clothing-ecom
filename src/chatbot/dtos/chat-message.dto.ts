import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class ChatMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Message không được để trống' })
  @MaxLength(2000, { message: 'Message không được quá 2000 ký tự' })
  message: string;

  @IsOptional()
  @IsString()
  session_id?: string; // Để track conversation context

  @IsOptional()
  user_id?: number; // Nếu user đã login
}

export class ChatResponseDto {
  success: boolean;
  data?: {
    reply: string;
    session_id?: string;
    metadata?: any;
  };
  error?: string;
}
