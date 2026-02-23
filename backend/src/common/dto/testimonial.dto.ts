import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateTestimonialDto {
  @ApiProperty({ example: 'Alice N.', description: 'Guest full name' })
  @IsString()
  guestName: string;

  @ApiProperty({ example: 'Business Guest', description: 'Guest role/title', required: false })
  @IsOptional()
  @IsString()
  guestRole?: string;

  @ApiProperty({
    example: 'Excellent stay, friendly team, and clean suites.',
    description: 'Guest testimonial quote',
  })
  @IsString()
  quote: string;

  @ApiProperty({ example: 5, description: 'Rating out of 5', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({
    example: 'website',
    description: 'Source of testimonial',
    enum: ['website', 'google', 'booking', 'direct', 'other'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['website', 'google', 'booking', 'direct', 'other'])
  source?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'Avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: true, description: 'Feature on homepage', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: 1, description: 'Display order', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateTestimonialDto {
  @ApiProperty({ example: 'Alice N.', description: 'Guest full name', required: false })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiProperty({ example: 'Business Guest', description: 'Guest role/title', required: false })
  @IsOptional()
  @IsString()
  guestRole?: string;

  @ApiProperty({ example: 'Updated testimonial text.', description: 'Guest testimonial quote', required: false })
  @IsOptional()
  @IsString()
  quote?: string;

  @ApiProperty({ example: 4, description: 'Rating out of 5', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({
    example: 'google',
    description: 'Source of testimonial',
    enum: ['website', 'google', 'booking', 'direct', 'other'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['website', 'google', 'booking', 'direct', 'other'])
  source?: string;

  @ApiProperty({ example: 'https://example.com/avatar-updated.jpg', description: 'Avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ example: false, description: 'Feature on homepage', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: 2, description: 'Display order', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiProperty({ example: true, description: 'Is testimonial active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
