import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { SKIP_PASSWORD_CHANGE_KEY } from '../decorators/skip-password-change.decorator';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

@Injectable()
export class MustChangePasswordGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const shouldSkip = this.reflector.getAllAndOverride<boolean>(
      SKIP_PASSWORD_CHANGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (shouldSkip) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user?.mustChangePassword) {
      return true;
    }

    throw new ForbiddenException({
      code: ERROR_CODES.MUST_CHANGE_PASSWORD,
      message: 'Vui lòng đổi mật khẩu trước khi tiếp tục',
    });
  }
}
