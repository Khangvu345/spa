import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ERROR_CODES } from '../../../shared/constants/error-codes';
import { EmployeeService } from '../../employee/employee/employee.service';
import { AccountStatus } from '../../employee/employee/staff.schema';
import {
  AuthenticatedUser,
  JwtPayload,
} from '../interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly employeeService: EmployeeService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const staff = await this.employeeService.findById(payload.sub);

    if (!staff || staff.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException({
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Token không hợp lệ hoặc tài khoản không còn hoạt động',
      });
    }

    return {
      id: payload.sub,
      email: staff.email,
      fullName: staff.fullName,
      role: staff.role,
      mustChangePassword:
        payload.mustChangePassword ?? staff.mustChangePassword,
    };
  }
}
