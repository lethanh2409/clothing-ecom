import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

type ErrorResponse = {
  success: false;
  message: string;
  statusCode: number;
  error_code?: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void { 
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>(); // <- gõ kiểu Response

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Tạo địa chỉ thất bại';
    let error_code: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const resp = exception.getResponse(); // string | object
      let detail: string | string[] | undefined;

      if (typeof resp === 'string') {
        detail = resp;
      } else if (resp && typeof resp === 'object' && 'message' in resp) {
        detail = (resp as { message?: string | string[] }).message;
      }

      if (detail) message = Array.isArray(detail) ? detail.join(', ') : String(detail);
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      error_code = exception.code;
      if (exception.code === 'P2002') status = HttpStatus.CONFLICT;
      else if (exception.code === 'P2003') status = HttpStatus.BAD_REQUEST;
      else if (exception.code === 'P2025') status = HttpStatus.NOT_FOUND;
      else status = HttpStatus.BAD_REQUEST;
    }

    const body: ErrorResponse = {
      success: false,
      message,
      statusCode: status,
      error_code,
    };

    res.status(status).json(body); // <- KHÔNG return để tránh no-unsafe-return
  }
}