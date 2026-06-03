import { ApiProperty } from '@nestjs/swagger';

export class UploadImageResponseDto {
  @ApiProperty({
    example:
      'https://res.cloudinary.com/demo/image/upload/v1/spa/services/service.jpg',
  })
  url: string;

  @ApiProperty({ example: 'spa/services/service' })
  publicId: string;
}
