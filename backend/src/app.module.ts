import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getDatabaseConfig } from './config/database.config';
import { HealthModule } from './modules/health/health.module';

/**
 * Root module của backend.
 * Tải biến môi trường global và cấu hình kết nối MongoDB.
 */
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,   // không cần import ConfigModule ở từng module con
      envFilePath: '.env',
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    HealthModule,
  ],
})
export class AppModule {}
