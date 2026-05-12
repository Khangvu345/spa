import { StaffRole } from '../../employee/employee/staff.schema';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: StaffRole;
  mustChangePassword: boolean;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: StaffRole;
}
