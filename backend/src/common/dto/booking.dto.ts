import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsObject,
  IsEnum,
  IsUUID,
  Min,
  IsEmail,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: 'uuid-room-id', description: 'Room ID' })
  @IsUUID()
  roomId: string;

  @ApiProperty({
    example: {
      firstName: 'Jean',
      lastName: 'Uwizera',
      email: 'jean@example.com',
      phone: '+250788987654',
      idType: 'National ID',
      idNumber: '1234567890123456',
      nationality: 'Rwandan',
    },
    description: 'Guest information',
  })
  @IsObject()
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idType: string;
    idNumber: string;
    nationality: string;
  };

  @ApiProperty({ example: '2026-02-20T14:00:00Z', description: 'Check-in date' })
  @IsString()
  checkInDate: string;

  @ApiProperty({ example: '2026-02-22T11:00:00Z', description: 'Check-out date' })
  @IsString()
  checkOutDate: string;

  @ApiProperty({ example: 2, description: 'Number of guests' })
  @IsNumber()
  @Min(1)
  numberOfGuests: number;

  @ApiProperty({ example: 300.0, description: 'Total booking amount' })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({
    example: 'Late check-in expected',
    description: 'Special requests',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiProperty({
    example: 'pesapal',
    description: 'Payment gateway',
    enum: ['pesapal', 'pay-at-property'],
  })
  @IsEnum(['pesapal', 'pay-at-property'])
  paymentGateway: string;
}

export class UpdateBookingDto {
  @ApiProperty({
    example: '2026-02-21T14:00:00Z',
    description: 'New check-in date',
    required: false,
  })
  @IsOptional()
  @IsString()
  checkInDate?: string;

  @ApiProperty({
    example: '2026-02-23T11:00:00Z',
    description: 'New check-out date',
    required: false,
  })
  @IsOptional()
  @IsString()
  checkOutDate?: string;

  @ApiProperty({ example: 3, description: 'Number of guests', required: false })
  @IsOptional()
  @IsNumber()
  numberOfGuests?: number;

  @ApiProperty({ example: 'Updated requests', description: 'Special requests', required: false })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiProperty({
    example: 'confirmed',
    description: 'Booking status',
    enum: ['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled'])
  status?: string;

  @ApiProperty({
    example: 'paid',
    description: 'Payment status',
    enum: ['pending', 'paid', 'failed', 'refunded'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['pending', 'paid', 'failed', 'refunded'])
  paymentStatus?: string;

  @ApiProperty({ example: 150.0, description: 'Total amount', required: false })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;
}

export class CheckAvailabilityDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: 'uuid-room-id', description: 'Room ID', required: false })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiProperty({ example: '2026-02-20T14:00:00Z', description: 'Check-in date' })
  @IsString()
  checkInDate: string;

  @ApiProperty({ example: '2026-02-22T11:00:00Z', description: 'Check-out date' })
  @IsString()
  checkOutDate: string;

  // Aliases for compatibility
  @ApiProperty({
    example: '2026-02-20T14:00:00Z',
    description: 'Check-in date (alias)',
    required: false,
  })
  @IsOptional()
  @IsString()
  checkIn?: string;

  @ApiProperty({
    example: '2026-02-22T11:00:00Z',
    description: 'Check-out date (alias)',
    required: false,
  })
  @IsOptional()
  @IsString()
  checkOut?: string;
}

export class OtaManualBookingDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: 'uuid-room-id', description: 'Room ID' })
  @IsUUID()
  roomId: string;

  @ApiProperty({ example: 'Booking.com', description: 'OTA platform name' })
  @IsString()
  otaPlatform: string;

  @ApiProperty({ example: 'BK123456789', description: 'External booking reference' })
  @IsString()
  otaReference: string;

  @ApiProperty({ example: '2026-02-20T14:00:00Z', description: 'Check-in date' })
  @IsString()
  checkInDate: string;

  @ApiProperty({ example: '2026-02-22T11:00:00Z', description: 'Check-out date' })
  @IsString()
  checkOutDate: string;

  @ApiProperty({ example: 2, description: 'Number of guests' })
  @IsNumber()
  @Min(1)
  numberOfGuests: number;

  @ApiProperty({ example: 300.0, description: 'Total amount' })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({
    example: { name: 'Guest Name', email: 'guest@example.com' },
    description: 'Guest basic info',
  })
  @IsObject()
  guestInfo: any;
}
