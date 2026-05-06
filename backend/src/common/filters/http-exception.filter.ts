import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { ERROR_CODES } from '../../shared/constants/error-codes';

/**
 * Global exception filter — bắt mọi exception và format về ApiErrorResponse chuẩn.
 *
 * Xử lý:
 * - HttpException (NestJS built-in): lấy message + statusCode
 * - MongooseError.ValidationError: 400, code VALIDATION_FAILED
 * - MongooseError.CastError: 400, code INVALID_OBJECT_ID
 * - MongoServerError code 11000 (duplicate key): 409
 * - Còn lại: 500, code INTERNAL_SERVER_ERROR
 *
 * Convention exception body để custom error code:
 *   throw new ConflictException({ code: 'PHONE_ALREADY_EXISTS', message: '...' });
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, code, message, details } = this.normalizeException(exception);

    this.logger.error(
      `[${request.method} ${request.url}] ${statusCode} ${code} — ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined && { details }),
      },
    });
  }

  private normalizeException(exception: unknown): {
    statusCode: number;
    code: string;
    message: string;
    details?: unknown;
  } {
    // 1. NestJS HttpException
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Nếu exception body là object có { code, message }
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'code' in exceptionResponse
      ) {
        const body = exceptionResponse as {
          code: string;
          message: string;
          details?: unknown;
        };
        return {
          statusCode,
          code: body.code,
          message: body.message,
          details: body.details,
        };
      }

      // Nếu là validation error từ ValidationPipe (array messages)
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse &&
        Array.isArray((exceptionResponse as { message: unknown }).message)
      ) {
        return {
          statusCode,
          code: ERROR_CODES.VALIDATION_FAILED,
          message: 'Dữ liệu không hợp lệ',
          details: (exceptionResponse as { message: unknown[] }).message,
        };
      }

      // Default — dùng exception name làm code, message là plain string
      return {
        statusCode,
        code: this.mapHttpStatusToErrorCode(statusCode),
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : (exceptionResponse as { message?: string }).message ?? exception.message,
      };
    }

    // 2. Mongoose ValidationError
    if (exception instanceof MongooseError.ValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.VALIDATION_FAILED,
        message: 'Dữ liệu không hợp lệ',
        details: Object.values(exception.errors).map((err) => err.message),
      };
    }

    // 3. Mongoose CastError (invalid ObjectId)
    if (exception instanceof MongooseError.CastError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: ERROR_CODES.INVALID_OBJECT_ID,
        message: `ID '${exception.value}' không hợp lệ`,
      };
    }

    // 4. MongoServerError - duplicate key
    if (exception instanceof MongoServerError && exception.code === 11000) {
      const keyValue = exception.keyValue ?? {};
      const fieldName = Object.keys(keyValue)[0] ?? 'field';
      return {
        statusCode: HttpStatus.CONFLICT,
        code: ERROR_CODES.VALIDATION_FAILED,
        message: `Trường '${fieldName}' đã tồn tại`,
        details: keyValue,
      };
    }

    // 5. Fallback — unknown error
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'Có lỗi xảy ra, vui lòng thử lại sau',
    };
  }

  private mapHttpStatusToErrorCode(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return ERROR_CODES.VALIDATION_FAILED;
      case HttpStatus.UNAUTHORIZED:
        return ERROR_CODES.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ERROR_CODES.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ERROR_CODES.NOT_FOUND;
      default:
        return ERROR_CODES.INTERNAL_SERVER_ERROR;
    }
  }
}