import { BadRequestException } from '@nestjs/common';
import { ERROR_CODES } from '../../shared/constants/error-codes';

export const SERVICE_IMAGE_FOLDER = 'spa/services';
export const MAX_SERVICE_IMAGE_SIZE_MB = 5;
export const MAX_SERVICE_IMAGE_SIZE_BYTES =
  MAX_SERVICE_IMAGE_SIZE_MB * 1024 * 1024;

export const ALLOWED_SERVICE_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const SERVICE_IMAGE_MULTER_OPTIONS = {
  limits: {
    fileSize: MAX_SERVICE_IMAGE_SIZE_BYTES,
    files: 1,
  },
  fileFilter: (
    _request: unknown,
    file: { mimetype: string },
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!ALLOWED_SERVICE_IMAGE_MIME_TYPES.has(file.mimetype)) {
      callback(
        new BadRequestException({
          code: ERROR_CODES.UPLOAD_INVALID_TYPE,
          message: 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP',
        }),
        false,
      );
      return;
    }

    callback(null, true);
  },
};
