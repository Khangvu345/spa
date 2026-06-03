import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class StripEmployeeCredentialsInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<{ body?: Record<string, unknown> }>();

    if (request.body && typeof request.body === 'object') {
      delete request.body.email;
      delete request.body.password;
    }

    return next.handle();
  }
}
