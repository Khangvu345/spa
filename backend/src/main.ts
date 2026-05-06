import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

/**
 * Entry point của ứng dụng NestJS.
 * Bootstrap app + setup Swagger + global pipes/filters/interceptors + listen MongoDB events.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ──────────────────────────────────────
  // Global prefix — mọi route bắt đầu với /api/v1
  // ──────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ──────────────────────────────────────
  // Global Validation — class-validator decorators trên DTO
  // ──────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Strip fields không có trong DTO
      forbidNonWhitelisted: true,// Throw error nếu có field thừa
      transform: true,           // Auto-transform payload sang DTO class
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ──────────────────────────────────────
  // Global Filter — chuẩn hóa error response
  // ──────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ──────────────────────────────────────
  // Global Interceptor — wrap thành ApiResponse envelope
  // ──────────────────────────────────────
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ──────────────────────────────────────
  // CORS — cho FE Umi (port 3000) gọi BE (port 8000)
  // ──────────────────────────────────────
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });

  // ──────────────────────────────────────
  // Swagger setup tại /api-docs
  // ──────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Spa Management API')
    .setDescription('REST API cho hệ thống quản lý spa')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  // ──────────────────────────────────────
  // MongoDB connection lifecycle
  // ──────────────────────────────────────
  const mongoConnection = app.get<Connection>(getConnectionToken());

  mongoConnection.on('connected', () => {
    logger.log('Đã kết nối đến MongoDB thành công');
  });

  mongoConnection.on('error', (error: Error) => {
    logger.error(`Kết nối tới MongoDB thất bại: ${error.message}`);
  });

  mongoConnection.on('disconnected', () => {
    logger.warn('Kết nối tới MongoDB đã bị ngắt');
  });

  // ──────────────────────────────────────
  // Start HTTP server
  // ──────────────────────────────────────
  const port = process.env.PORT ?? 8000;
  await app.listen(port);

  logger.log(`Server đang chạy trên http://localhost:${port}/api/v1`);
  logger.log(`Swagger UI:      http://localhost:${port}/api-docs`);
  logger.log(`Swagger JSON:    http://localhost:${port}/api-docs-json`);
}

bootstrap();