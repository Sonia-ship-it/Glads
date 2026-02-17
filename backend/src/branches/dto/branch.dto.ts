import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsObject, IsArray, IsNumber } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'GLADS Ndera', description: 'Branch name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'NDERA', description: 'Unique branch code' })
  @IsString()
  code: string;

  @ApiProperty({
    example: {
      street: 'KN 5 Rd',
      city: 'Kigali',
      state: 'Kigali Province',
      zipCode: '00000',
      country: 'Rwanda',
    },
    description: 'Branch address',
  })
  @IsObject()
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @ApiProperty({
    example: { latitude: -1.9441, longitude: 30.1367 },
    description: 'GPS coordinates',
  })
  @IsObject()
  coordinates: {
    latitude: number;
    longitude: number;
  };

  @ApiProperty({
    example: {
      phone: '+250788123456',
      email: 'ndera@glads.rw',
      whatsapp: '+250788123456',
    },
    description: 'Contact information',
  })
  @IsObject()
  contactInfo: {
    phone: string;
    email: string;
    whatsapp?: string;
  };

  @ApiProperty({
    example: ['WiFi', 'Parking', 'Restaurant', 'Spa', 'Gym'],
    description: 'List of amenities',
    type: [String],
  })
  @IsArray()
  amenities: string[];

  @ApiProperty({ example: 'Modern apartment hotel in the heart of Kigali', description: 'Branch description' })
  @IsString()
  description: string;

  @ApiProperty({
    example: {
      currency: 'RWF',
      timezone: 'Africa/Kigali',
      taxRate: 0.18,
      serviceChargeRate: 0.10,
    },
    description: 'Branch settings',
  })
  @IsObject()
  settings: {
    currency: string;
    timezone: string;
    taxRate: number;
    serviceChargeRate: number;
  };
}

export class UpdateBranchDto {
  @ApiProperty({ example: 'GLADS Ndera', description: 'Branch name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: {
      street: 'KN 5 Rd',
      city: 'Kigali',
      state: 'Kigali Province',
      zipCode: '00000',
      country: 'Rwanda',
    },
    description: 'Branch address',
    required: false,
  })
  @IsOptional()
  @IsObject()
  address?: any;

  @ApiProperty({
    example: { phone: '+250788123456', email: 'ndera@glads.rw' },
    description: 'Contact information',
    required: false,
  })
  @IsOptional()
  @IsObject()
  contactInfo?: any;

  @ApiProperty({ example: ['WiFi', 'Parking'], description: 'Amenities', required: false })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  @ApiProperty({ example: 'Updated description', description: 'Branch description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, description: 'Is branch active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
