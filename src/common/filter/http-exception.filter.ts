import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status = exception.getStatus();
    const response = exception.getResponse() as any;

    res.status(status).json({
      success: false,
      statusCode: status,
      message: response.message || response || 'Error',
      errors: response.errors ?? null,
    });
  }
}
