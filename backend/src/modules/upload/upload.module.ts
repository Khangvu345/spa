import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';
import { UploadController } from './upload.controller';
import { UploadErrorInterceptor } from './upload-error.interceptor';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [CloudinaryService, UploadErrorInterceptor],
  exports: [CloudinaryService],
})
export class UploadModule {}
