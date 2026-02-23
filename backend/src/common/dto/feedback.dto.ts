import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ example: 'John Doe', description: 'Guest full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'john@example.com', description: 'Guest email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+250788123456', description: 'Guest phone', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'service',
    description: 'Feedback category',
    enum: ['stay', 'service', 'facility', 'staff', 'other'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['stay', 'service', 'facility', 'staff', 'other'])
  category?: string;

  @ApiProperty({ example: 5, description: 'Rating out of 5', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: 'Amazing Service', description: 'Feedback subject', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: 'The stay and support were excellent.', description: 'Feedback message' })
  @IsString()
  message: string;

  @ApiProperty({ example: { source: 'website' }, description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateFeedbackDto {
  @ApiProperty({
    example: 'in-review',
    description: 'Feedback status',
    enum: ['new', 'in-review', 'resolved', 'archived'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['new', 'in-review', 'resolved', 'archived'])
  status?: string;

  @ApiProperty({ example: 'Thanks, we have actioned this issue.', description: 'Staff response', required: false })
  @IsOptional()
  @IsString()
  response?: string;

  @ApiProperty({ example: true, description: 'Whether to keep this feedback record active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
