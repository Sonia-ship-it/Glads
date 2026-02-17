import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateSystemSettingDto {
  @ApiProperty({ example: 'hotel_tax_rate', description: 'Setting key (unique)' })
  @IsString()
  key: string;

  @ApiProperty({ 
    example: { rate: 0.18, currency: 'RWF' }, 
    description: 'Setting value (JSON)' 
  })
  @IsObject()
  value: any;

  @ApiProperty({ 
    example: 'Tax rate applied to all bookings', 
    description: 'Setting description',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateSystemSettingDto {
  @ApiProperty({ 
    example: { rate: 0.20, currency: 'RWF' }, 
    description: 'Setting value (JSON)',
    required: false 
  })
  @IsOptional()
  @IsObject()
  value?: any;

  @ApiProperty({ 
    example: 'Updated tax rate', 
    description: 'Setting description',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;
}
