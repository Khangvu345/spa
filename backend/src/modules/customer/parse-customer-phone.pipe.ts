import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ERROR_CODES } from '../../shared/constants/error-codes';

@Injectable()
export class ParseCustomerPhonePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!/^[0-9]{10}$/.test(value)) {
      throw new BadRequestException({
        code: ERROR_CODES.INVALID_PHONE_FORMAT,
        message: 'Số điện thoại phải đủ 10 chữ số',
      });
    }

    return value;
  }
}
