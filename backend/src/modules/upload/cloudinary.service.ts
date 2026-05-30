import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import { UploadedImageFile } from './types/uploaded-image-file.interface';
import { SERVICE_IMAGE_FOLDER } from './upload.constants';

@Injectable()
export class CloudinaryService {
  private readonly cloudName?: string;
  private readonly apiKey?: string;
  private readonly apiSecret?: string;

  constructor(private readonly configService: ConfigService) {
    this.cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    this.apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    this.apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
      secure: true,
    });
  }

  async uploadImage(file: UploadedImageFile): Promise<UploadImageResponseDto> {
    this.assertConfigured();

    return new Promise<UploadImageResponseDto>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: SERVICE_IMAGE_FOLDER,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        },
        (error?: UploadApiErrorResponse, result?: UploadApiResponse): void => {
          if (error || !result?.secure_url || !result.public_id) {
            reject(this.createUploadFailedException(error));
            return;
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.on('error', (error: Error) => {
        reject(this.createUploadFailedException(error));
      });

      uploadStream.end(file.buffer);
    });
  }

  private assertConfigured(): void {
    const missing = [
      ['CLOUDINARY_CLOUD_NAME', this.cloudName],
      ['CLOUDINARY_API_KEY', this.apiKey],
      ['CLOUDINARY_API_SECRET', this.apiSecret],
    ]
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new InternalServerErrorException({
        code: ERROR_CODES.UPLOAD_FAILED,
        message: 'Cloudinary chưa được cấu hình đầy đủ',
        details: { missing },
      });
    }
  }

  private createUploadFailedException(
    error?: unknown,
  ): InternalServerErrorException {
    const details = this.getErrorDetails(error);

    return new InternalServerErrorException({
      code: ERROR_CODES.UPLOAD_FAILED,
      message: 'Upload ảnh lên Cloudinary thất bại',
      ...(details && { details }),
    });
  }

  private getErrorDetails(error?: unknown): { message: string } | undefined {
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return { message: (error as { message: string }).message };
    }

    return undefined;
  }
}
