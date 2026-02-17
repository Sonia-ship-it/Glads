import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID, IsOptional } from 'class-validator';

export class InitiatePaymentDto {
  @ApiProperty({ example: 'uuid-booking-id', description: 'Room booking ID', required: false })
  @IsOptional()
  @IsUUID()
  bookingId?: string;

  @ApiProperty({ example: 'uuid-service-booking-id', description: 'Service booking ID', required: false })
  @IsOptional()
  @IsUUID()
  serviceBookingId?: string;

  @ApiProperty({ example: 300.0, description: 'Payment amount' })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'RWF', description: 'Currency code', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 'customer@example.com', description: 'Customer email address' })
  @IsString()
  customerEmail: string;

  @ApiProperty({ example: '+250788123456', description: 'Customer phone number' })
  @IsString()
  customerPhone: string;

  @ApiProperty({ example: 'John Doe', description: 'Customer full name', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ example: 'Hotel booking payment', description: 'Payment description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'http://localhost:3000/booking/success', description: 'Success callback URL', required: false })
  @IsOptional()
  @IsString()
  callbackUrl?: string;
}

export class PaymentCallbackDto {
  @ApiProperty({ example: 'PSP123456789', description: 'Pesapal transaction ID' })
  @IsString()
  pesapalTransactionId: string;

  @ApiProperty({ example: 'COMPLETED', description: 'Payment status' })
  @IsString()
  status: string;
}

export class VerifyPaymentDto {
  @ApiProperty({ example: 'uuid-payment-id', description: 'Internal payment ID' })
  @IsUUID()
  paymentId: string;

  @ApiProperty({ example: 'PSP123456789', description: 'Pesapal transaction ID' })
  @IsString()
  pesapalTransactionId: string;
}
