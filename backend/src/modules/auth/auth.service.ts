import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BCRYPT_SALT_ROUNDS } from '../../shared/constants/business-rules';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { EmployeeService } from '../employee/employee/employee.service';
import { AccountStatus } from '../employee/employee/staff.schema';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/authenticated-user.interface';

const DUMMY_PASSWORD_HASH =
  '$2b$10$KYVbZ5JFVfqu0oV98LnF5eTk4QRY1x1vZ9uQzmaF3EbvjkKUlwUTW';

@Injectable()
export class AuthService {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Đăng nhập bằng email và password, trả JWT access token.
   *
   * @param dto - Thông tin đăng nhập
   * @returns Thông tin staff và access token
   * @throws UnauthorizedException - Email/password sai hoặc account không active
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const staff = await this.employeeService.findByEmail(dto.email);
    const passwordHash = staff?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const isPasswordValid = await bcrypt.compare(dto.password, passwordHash);

    if (
      !staff ||
      !isPasswordValid ||
      staff.accountStatus !== AccountStatus.ACTIVE
    ) {
      throw new UnauthorizedException({
        code: ERROR_CODES.INVALID_CREDENTIALS,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    const user = this.employeeService.mapToResponse(staff);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      user,
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  /**
   * Lấy thông tin staff hiện tại từ database.
   *
   * @param staffId - Mongo ObjectId của staff đang đăng nhập
   * @returns StaffResponseDto mới nhất
   */
  async getMe(staffId: string) {
    const staff = await this.employeeService.findByIdOrThrow(staffId);
    return this.employeeService.mapToResponse(staff);
  }

  /**
   * Đổi mật khẩu của chính staff đang đăng nhập.
   *
   * @param staffId - Mongo ObjectId của staff đang đăng nhập
   * @param dto - Mật khẩu hiện tại và mật khẩu mới
   * @returns void
   * @throws UnauthorizedException - Current password sai
   * @throws BadRequestException - New password trùng current password
   */
  async changePassword(staffId: string, dto: ChangePasswordDto): Promise<void> {
    const staff = await this.employeeService.findByIdOrThrow(staffId);
    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      staff.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException({
        code: ERROR_CODES.PASSWORD_INCORRECT,
        message: 'Mật khẩu hiện tại không đúng',
      });
    }

    const isSamePassword = await bcrypt.compare(
      dto.newPassword,
      staff.passwordHash,
    );
    if (isSamePassword) {
      throw new BadRequestException({
        code: ERROR_CODES.NEW_PASSWORD_SAME_AS_OLD,
        message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
      });
    }

    const saltRounds = Number(
      this.configService.get<string>('BCRYPT_SALT_ROUNDS') ??
        BCRYPT_SALT_ROUNDS,
    );
    const passwordHash = await bcrypt.hash(dto.newPassword, saltRounds);
    await this.employeeService.updatePassword(staffId, passwordHash);
  }
}
