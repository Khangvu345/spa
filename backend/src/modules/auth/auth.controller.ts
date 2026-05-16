import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { SkipPasswordChange } from './decorators/skip-password-change.decorator';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập staff bằng email và mật khẩu' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get('me')
  @SkipPasswordChange()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Lấy thông tin staff hiện tại' })
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getMe(user.id);
  }

  @Post('change-password')
  @SkipPasswordChange()
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    type: AuthResponseDto,
    description: 'Đổi mật khẩu thành công',
  })
  @ApiOperation({ summary: 'Đổi mật khẩu của chính staff đang đăng nhập' })
  changePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ): Promise<AuthResponseDto> {
    return this.authService.changePassword(user.id, dto);
  }
}
