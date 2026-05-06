import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Lấy user từ JWT payload (đã được JwtStrategy validate và gắn vào request.user).
 *
 * Sử dụng:
 *   @Get('me')
 *   getMe(@CurrentUser() user: { sub: string; email: string; role: string }) { ... }
 *
 * Hoặc lấy 1 field:
 *   @Get('me')
 *   getMe(@CurrentUser('sub') userId: string) { ... }
 *
 * Lưu ý: Phải có @UseGuards(JwtAuthGuard) trước decorator này.
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user: Record<string, unknown> }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);