import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ example: 'Jane Doe', description: 'Sender full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'jane@example.com', description: 'Sender email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+250788654321', description: 'Sender phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'Suite availability', description: 'Message subject', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'Do you have a suite available this weekend?', description: 'Message content' })
  @IsString()
  message: string;

  @ApiProperty({
    example: 'email',
    description: 'Preferred contact method',
    enum: ['email', 'phone', 'whatsapp', 'any'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['email', 'phone', 'whatsapp', 'any'])
  preferredContactMethod?: string;
}

export class UpdateContactMessageDto {
  @ApiProperty({
    example: 'in-progress',
    description: 'Message status',
    enum: ['new', 'in-progress', 'resolved', 'spam', 'archived'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['new', 'in-progress', 'resolved', 'spam', 'archived'])
  status?: string;

  @ApiProperty({ example: 'Assigned to concierge desk', description: 'Internal note', required: false })
  @IsOptional()
  @IsString()
  internalNote?: string;

  @ApiProperty({ example: 'We have availability, check your email.', description: 'Response message', required: false })
  @IsOptional()
  @IsString()
  response?: string;

  @ApiProperty({ example: 'uuid-user-id', description: 'Assigned staff user ID', required: false })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiProperty({ example: true, description: 'Whether this message remains active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
