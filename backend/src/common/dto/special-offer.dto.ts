import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateSpecialOfferDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID (optional for global offers)', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({
    example: 'branch-specific',
    description: 'Offer scope',
    enum: ['global', 'branch-specific'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['global', 'branch-specific'])
  scope?: string;

  @ApiProperty({ example: 'Weekend Escape', description: 'Offer title' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Save 15% on two-night stays at selected branches.',
    description: 'Offer description',
  })
  @IsString()
  description: string;

  @ApiProperty({ example: 'Book Weekend', description: 'Call-to-action label', required: false })
  @IsOptional()
  @IsString()
  ctaText?: string;

  @ApiProperty({ example: '/rooms', description: 'Call-to-action URL', required: false })
  @IsOptional()
  @IsString()
  ctaLink?: string;

  @ApiProperty({ example: 'WEEKEND15', description: 'Promo code', required: false })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiProperty({ example: 15, description: 'Discount percentage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiProperty({ example: 10000, description: 'Discount amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({ example: 'RWF', description: 'Currency code', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: '2026-03-01T00:00:00Z', description: 'Offer start date' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ example: '2026-03-31T23:59:59Z', description: 'Offer end date', required: false })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiProperty({ example: 'Valid for direct bookings only.', description: 'Offer terms', required: false })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiProperty({ example: 'https://example.com/offer.jpg', description: 'Offer image URL', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: true, description: 'Feature this offer', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({
    example: 'active',
    description: 'Offer lifecycle status',
    enum: ['draft', 'active', 'inactive', 'expired'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['draft', 'active', 'inactive', 'expired'])
  status?: string;
}

export class UpdateSpecialOfferDto {
  @ApiProperty({ example: 'Family Stay Package', description: 'Offer title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated package details', description: 'Offer description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'View Package', description: 'Call-to-action label', required: false })
  @IsOptional()
  @IsString()
  ctaText?: string;

  @ApiProperty({ example: '/contact', description: 'Call-to-action URL', required: false })
  @IsOptional()
  @IsString()
  ctaLink?: string;

  @ApiProperty({ example: 'FAMILY10', description: 'Promo code', required: false })
  @IsOptional()
  @IsString()
  promoCode?: string;

  @ApiProperty({ example: 10, description: 'Discount percentage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @ApiProperty({ example: 5000, description: 'Discount amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiProperty({ example: 'RWF', description: 'Currency code', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: '2026-03-10T00:00:00Z', description: 'Offer start date', required: false })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiProperty({ example: '2026-04-10T23:59:59Z', description: 'Offer end date', required: false })
  @IsOptional()
  @IsDateString()
  validTo?: string;

  @ApiProperty({ example: 'Updated terms.', description: 'Offer terms', required: false })
  @IsOptional()
  @IsString()
  termsAndConditions?: string;

  @ApiProperty({ example: 'https://example.com/updated-offer.jpg', description: 'Offer image URL', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: false, description: 'Feature this offer', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({
    example: 'inactive',
    description: 'Offer lifecycle status',
    enum: ['draft', 'active', 'inactive', 'expired'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['draft', 'active', 'inactive', 'expired'])
  status?: string;

  @ApiProperty({ example: true, description: 'Is offer active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
