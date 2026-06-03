import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { MAX_SERVICE_IMAGE_SIZE_MB } from './upload.constants';

@Injectable()
export class UploadErrorInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (this.isFileTooLargeError(error)) {
          return throwError(
            () =>
              new BadRequestException({
                code: ERROR_CODES.UPLOAD_FILE_TOO_LARGE,
                message: `Ảnh dịch vụ tối đa ${MAX_SERVICE_IMAGE_SIZE_MB}MB`,
              }),
          );
        }

        return throwError(() => error);
      }),
    );
  }

  private isFileTooLargeError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: unknown }).code === 'LIMIT_FILE_SIZE'
    );
  }
}
