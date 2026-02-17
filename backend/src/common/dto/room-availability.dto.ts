import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateRoomAvailabilityDto {
  @ApiProperty({ example: 'uuid-room-id', description: 'Room ID' })
  @IsUUID()
  roomId: string;

  @ApiProperty({ example: '2026-02-20', description: 'Date for availability' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: true, description: 'Is room available' })
  @IsBoolean()
  isAvailable: boolean;

  @ApiProperty({ example: 'uuid-booking-id', description: 'Booking ID if occupied', required: false })
  @IsOptional()
  @IsUUID()
  bookingId?: string;
}

export class UpdateRoomAvailabilityDto {
  @ApiProperty({ example: true, description: 'Is room available', required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: 'uuid-booking-id', description: 'Booking ID if occupied', required: false })
  @IsOptional()
  @IsUUID()
  bookingId?: string;
}

export class BulkUpdateRoomAvailabilityDto {
  @ApiProperty({ example: 'uuid-room-id', description: 'Room ID' })
  @IsUUID()
  roomId: string;

  @ApiProperty({ example: '2026-02-20', description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-02-25', description: 'End date' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: false, description: 'Is room available' })
  @IsBoolean()
  isAvailable: boolean;
}

export class QueryRoomAvailabilityDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ example: '2026-02-20', description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-02-25', description: 'End date' })
  @IsDateString()
  endDate: string;
}
