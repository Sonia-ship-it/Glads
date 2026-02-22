import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsBoolean, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateGymSubscriptionDto {
  @ApiProperty({ example: 'uuid-service-booking-id', description: 'Service booking ID' })
  @IsUUID()
  serviceBookingId: string;

  @ApiProperty({ example: 'uuid-member-id', description: 'Member user ID' })
  @IsUUID()
  memberId: string;

  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  @IsUUID()
  branchId: string;

  @ApiProperty({
    example: 'monthly',
    description: 'Subscription period',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
  })
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
  subscriptionPeriod: string;

  @ApiProperty({ example: '2026-02-15T00:00:00Z', description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-03-15T00:00:00Z', description: 'End date' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: false, description: 'Auto renewal', required: false })
  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;
}

export class UpdateGymSubscriptionDto {
  @ApiProperty({ example: true, description: 'Is subscription active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: true, description: 'Auto renewal', required: false })
  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;

  @ApiProperty({ example: '2026-04-15T00:00:00Z', description: 'New end date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class RenewGymSubscriptionDto {
  @ApiProperty({
    example: 'monthly',
    description: 'Subscription period',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
  })
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
  subscriptionPeriod: string;

  @ApiProperty({ example: true, description: 'Auto renewal', required: false })
  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;
}
