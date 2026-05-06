import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Wrap response thành ApiResponse envelope: { success: true, data, ...meta? }.
 *
 * Quy ước với service:
 * - Service trả về object có { data, meta } → interceptor giữ nguyên cấu trúc list response
 * - Service trả về object/value khác → wrap thành { success: true, data: <value> }
 * - Service trả về undefined (vd DELETE) → { success: true }
 *
 * Lưu ý: Nếu response đã là { success, ... } (vd từ controller chủ động format)
 * thì interceptor KHÔNG wrap lại.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, unknown> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<unknown> {
    return next.handle().pipe(
      map((payload) => {
        // Đã wrap rồi → giữ nguyên (controller có thể chủ động trả {success, ...})
        if (this.isAlreadyWrapped(payload)) {
          return payload;
        }

        // List response: { data: [...], meta: {...} }
        if (this.isListResponse(payload)) {
          return {
            success: true,
            data: payload.data,
            meta: payload.meta,
          };
        }

        // Empty (vd DELETE 204)
        if (payload === undefined || payload === null) {
          return { success: true };
        }

        // Single item
        return {
          success: true,
          data: payload,
        };
      }),
    );
  }

  private isAlreadyWrapped(payload: unknown): boolean {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'success' in payload
    );
  }

  private isListResponse(
    payload: unknown,
  ): payload is { data: unknown[]; meta: unknown } {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'data' in payload &&
      'meta' in payload &&
      Array.isArray((payload as { data: unknown }).data)
    );
  }
}