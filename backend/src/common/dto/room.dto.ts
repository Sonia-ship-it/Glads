import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  IsEnum,
  Min,
  IsUUID,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: '101', description: 'Room number' })
  @IsString()
  roomNumber: string;

  @ApiProperty({
    example: 'deluxe',
    description: 'Room type',
    enum: ['standard', 'deluxe', 'suite', 'penthouse'],
  })
  @IsEnum(['standard', 'deluxe', 'suite', 'penthouse'])
  roomType: string;

  @ApiProperty({ example: 2, description: 'Floor number' })
  @IsNumber()
  floor: number;

  @ApiProperty({ example: 'Deluxe King Suite', description: 'Room name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Spacious suite with king bed and city view', description: 'Room description' })
  @IsString()
  description: string;

  @ApiProperty({ example: 150.0, description: 'Base price per night' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ example: 2, description: 'Maximum occupancy' })
  @IsNumber()
  @Min(1)
  maxOccupancy: number;

  @ApiProperty({ example: 35, description: 'Room size in square meters' })
  @IsNumber()
  sizeSqm: number;

  @ApiProperty({ example: 'King', description: 'Bed type' })
  @IsString()
  bedType: string;

  @ApiProperty({ example: 'City View', description: 'View type' })
  @IsString()
  viewType: string;

  @ApiProperty({
    example: ['https://example.com/room1.jpg', 'https://example.com/room2.jpg'],
    description: 'Room images',
    type: [String],
  })
  @IsArray()
  images: string[];

  @ApiProperty({
    example: ['AC', 'TV', 'Minibar', 'Balcony', 'Safe'],
    description: 'List of amenities',
    type: [String],
  })
  @IsArray()
  amenities: string[];
}

export class UpdateRoomDto {
  @ApiProperty({ example: 'Deluxe Room 101', description: 'Room name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '102', description: 'Room number', required: false })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiProperty({ example: 'deluxe', description: 'Room type', required: false })
  @IsOptional()
  @IsString()
  roomType?: string;

  @ApiProperty({ example: 2, description: 'Floor number', required: false })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiProperty({ example: 160.0, description: 'Base price per night', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiProperty({ example: 3, description: 'Maximum occupancy', required: false })
  @IsOptional()
  @IsNumber()
  maxOccupancy?: number;

  @ApiProperty({ example: 'Updated description', description: 'Room description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 40, description: 'Size in square meters', required: false })
  @IsOptional()
  @IsNumber()
  sizeSqm?: number;

  @ApiProperty({ example: 'Queen', description: 'Bed type', required: false })
  @IsOptional()
  @IsString()
  bedType?: string;

  @ApiProperty({ example: 'Ocean View', description: 'View type', required: false })
  @IsOptional()
  @IsString()
  viewType?: string;

  @ApiProperty({
    example: 'available',
    description: 'Room status',
    enum: ['available', 'occupied', 'maintenance', 'blocked', 'active', 'inactive'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['available', 'occupied', 'maintenance', 'blocked', 'active', 'inactive'])
  status?: string;

  @ApiProperty({ example: ['AC', 'TV'], description: 'Amenities', required: false })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  @ApiProperty({ example: ['image.jpg'], description: 'Room images', required: false })
  @IsOptional()
  @IsArray()
  images?: string[];
}

export class SearchAvailableRoomsDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  @IsUUID()
  branchId: string;

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

  @ApiProperty({
    example: 'deluxe',
    description: 'Room type filter',
    required: false,
    enum: ['standard', 'deluxe', 'suite', 'penthouse'],
  })
  @IsOptional()
  @IsEnum(['standard', 'deluxe', 'suite', 'penthouse'])
  roomType?: string;

  @ApiProperty({ example: 50.0, description: 'Minimum price filter', required: false })
  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @ApiProperty({ example: 200.0, description: 'Maximum price filter', required: false })
  @IsOptional()
  @IsNumber()
  maxPrice?: number;

  @ApiProperty({ example: 2, description: 'Minimum occupancy filter', required: false })
  @IsOptional()
  @IsNumber()
  minOccupancy?: number;

  // Aliases for compatibility with services
  get checkIn() { return this.checkInDate; }
  get checkOut() { return this.checkOutDate; }
}
