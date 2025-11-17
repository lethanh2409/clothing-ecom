import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import morgan from 'morgan';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { Decimal } from '@prisma/client/runtime/library';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filter/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalInterceptors(new ResponseInterceptor());
  // app.useGlobalFilters(new HttpExceptionFilter());
  // Bật CORS cho toàn bộ origin
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // FE Next.js
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(cookieParser.default());
  // log request kiểu dev (GET /users 404 - 3 ms)
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.use(morgan(':method :url :status :response-time ms - :req[content-type]'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // ← Cho phép convert tự động
      },
    }),
  );
  const port = Number(process.env.PORT) || 3618;
  await app.listen(port);
  console.log(`🚀 Server: http://localhost:${port}`);
  (Decimal.prototype as any).toJSON = function () {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.toNumber();
  };
}
void bootstrap();
