import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({ example: 'Spa Massage', description: 'Service name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Relaxing full body massage', description: 'Service description' })
  @IsString()
  description: string;

  @ApiProperty({
    example: 'spa',
    description: 'Service category',
    enum: ['spa', 'restaurant', 'transport', 'laundry', 'gym', 'other'],
  })
  @IsEnum(['spa', 'restaurant', 'transport', 'laundry', 'gym', 'other'])
  category: string;

  @ApiProperty({ example: 50.0, description: 'Service price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    example: 'one-time',
    description: 'Billing type',
    enum: ['one-time', 'subscription'],
  })
  @IsEnum(['one-time', 'subscription'])
  billingType: string;

  @ApiProperty({
    example: 'monthly',
    description: 'Subscription period (required if billingType is subscription)',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
  subscriptionPeriod?: string;

  @ApiProperty({ example: 60, description: 'Duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiProperty({ example: 10, description: 'Maximum capacity', required: false })
  @IsOptional()
  @IsNumber()
  maxCapacity?: number;

  @ApiProperty({ example: ['09:00', '14:00', '17:00'], description: 'Available time slots', required: false })
  @IsOptional()
  @IsArray()
  availableTimes?: string[];

  @ApiProperty({ example: ['https://example.com/image.jpg'], description: 'Service images', required: false })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ example: ['WiFi', 'AC'], description: 'Amenities', required: false })
  @IsOptional()
  @IsArray()
  amenities?: string[];
}

export class UpdateServiceDto {
  @ApiProperty({ example: 'Updated Service Name', description: 'Service name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Updated description', description: 'Service description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'spa', description: 'Service category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 55.0, description: 'Service price', required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: 'one-time', description: 'Billing type', required: false })
  @IsOptional()
  @IsString()
  billingType?: string;

  @ApiProperty({ example: 'monthly', description: 'Subscription period', required: false })
  @IsOptional()
  @IsString()
  subscriptionPeriod?: string;

  @ApiProperty({ example: 60, description: 'Duration in minutes', required: false })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @ApiProperty({ example: 10, description: 'Maximum capacity', required: false })
  @IsOptional()
  @IsNumber()
  maxCapacity?: number;

  @ApiProperty({ example: ['09:00', '14:00'], description: 'Available times', required: false })
  @IsOptional()
  @IsArray()
  availableTimes?: string[];

  @ApiProperty({ example: ['image.jpg'], description: 'Images', required: false })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty({ example: ['WiFi'], description: 'Amenities', required: false })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  @ApiProperty({ example: true, description: 'Is service active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateServiceBookingDto {
  @ApiProperty({ example: 'uuid-service-id', description: 'Service ID' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ example: 'uuid-user-id', description: 'User ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    example: { name: 'John Doe', email: 'john@example.com', phone: '+250788123456' },
    description: 'Guest information',
  })
  @IsOptional()
  guestInfo?: any;

  @ApiProperty({ example: '2026-02-20', description: 'Booking date' })
  @IsString()
  bookingDate: string;

  @ApiProperty({ example: '14:00', description: 'Booking time', required: false })
  @IsOptional()
  @IsString()
  bookingTime?: string;

  @ApiProperty({ example: 2, description: 'Number of people', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfPeople?: number;

  @ApiProperty({ example: 'Special requests here', description: 'Special requests', required: false })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @ApiProperty({ example: 50.0, description: 'Total amount' })
  @IsNumber()
  totalAmount: number;

  @ApiProperty({ example: true, description: 'Auto renewal (for gym subscriptions)', required: false })
  @IsOptional()
  @IsBoolean()
  autoRenewal?: boolean;
}
