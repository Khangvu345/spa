import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { Roles } from '../auth/decorators/roles.decorator';
import { StaffRole } from '../employee/employee/staff.schema';
import { CloudinaryService } from './cloudinary.service';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import type { UploadedImageFile } from './types/uploaded-image-file.interface';
import { UploadErrorInterceptor } from './upload-error.interceptor';
import {
  ALLOWED_SERVICE_IMAGE_MIME_TYPES,
  MAX_SERVICE_IMAGE_SIZE_BYTES,
  MAX_SERVICE_IMAGE_SIZE_MB,
  SERVICE_IMAGE_MULTER_OPTIONS,
} from './upload.constants';

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('service-image')
  @Roles(StaffRole.ADMIN)
  @UseInterceptors(
    UploadErrorInterceptor,
    FileInterceptor('file', SERVICE_IMAGE_MULTER_OPTIONS),
  )
  @ApiOperation({ summary: 'Upload ảnh dịch vụ lên Cloudinary (ADMIN)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Ảnh JPG, PNG hoặc WEBP, tối đa 5MB',
        },
      },
    },
  })
  @ApiOkResponse({ type: UploadImageResponseDto })
  uploadServiceImage(
    @UploadedFile() file?: UploadedImageFile,
  ): Promise<UploadImageResponseDto> {
    this.validateFile(file);
    return this.cloudinaryService.uploadImage(file);
  }

  private validateFile(
    file?: UploadedImageFile,
  ): asserts file is UploadedImageFile {
    if (!file) {
      throw new BadRequestException({
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Vui lòng gửi file ảnh ở field "file"',
      });
    }

    if (!ALLOWED_SERVICE_IMAGE_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException({
        code: ERROR_CODES.UPLOAD_INVALID_TYPE,
        message: 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP',
      });
    }

    if (file.size > MAX_SERVICE_IMAGE_SIZE_BYTES) {
      throw new BadRequestException({
        code: ERROR_CODES.UPLOAD_FILE_TOO_LARGE,
        message: `Ảnh dịch vụ tối đa ${MAX_SERVICE_IMAGE_SIZE_MB}MB`,
      });
    }
  }
}
