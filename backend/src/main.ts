import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from './app.module';


/**
 * Entry point của ứng dụng NestJS.
 * Khởi tạo app, lắng nghe trạng thái kết nối MongoDB và start HTTP server.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  
  const mongoConnection = app.get<Connection>(getConnectionToken());

  // Log khi MongoDB kết nối thành công
  mongoConnection.on('connected', () => {
    logger.log('Đã kết nối đến MongoDB thành công');
  });

  // Log khi có lỗi kết nối MongoDB
  mongoConnection.on('error', (error: Error) => {
    logger.error(`Kết nối tới MongoDB thất bại: ${error.message}`);
  });

  mongoConnection.on('disconnected', () => {
    logger.warn('Kết nối tới MongoDB đã bị ngắt');
  });

  // PORT ưu tiên lấy từ file .env, fallback về 8000
  const port = process.env.PORT ?? 8000;
  await app.listen(port);
  logger.log(`Server đang chạy trên http://localhost:${port}`);
  
}
bootstrap();
