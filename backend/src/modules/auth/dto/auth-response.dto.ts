import { ApiProperty } from '@nestjs/swagger';
import { StaffResponseDto } from '../../employee/employee/dto/staff-response.dto';

export class AuthResponseDto {
  @ApiProperty({ type: StaffResponseDto })
  user: StaffResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;
}
