import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsUUID, IsArray } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiProperty({ example: true, description: 'Enable email notifications', required: false })
  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @ApiProperty({ example: true, description: 'Enable in-app notifications', required: false })
  @IsOptional()
  @IsBoolean()
  inApp?: boolean;

  @ApiProperty({
    example: ['booking', 'payment'],
    description: 'Notification categories',
    required: false,
  })
  @IsOptional()
  @IsArray()
  categories?: string[];
}

export class MarkNotificationReadDto {
  @ApiProperty({
    example: ['uuid-notification-id-1', 'uuid-notification-id-2'],
    description: 'Notification IDs',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  notificationIds: string[];
}
