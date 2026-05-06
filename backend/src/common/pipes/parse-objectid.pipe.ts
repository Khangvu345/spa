import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';
import { ERROR_CODES } from '../../shared/constants/error-codes';

/**
 * Validate param :id là ObjectId hợp lệ trước khi vào controller method.
 *
 * Sử dụng:
 *   @Get(':id')
 *   findOne(@Param('id', ParseObjectIdPipe) id: string) { ... }
 *
 * Throw BadRequestException nếu không phải ObjectId hợp lệ.
 */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException({
        code: ERROR_CODES.INVALID_OBJECT_ID,
        message: `ID '${value}' không hợp lệ`,
      });
    }
    return value;
  }
}