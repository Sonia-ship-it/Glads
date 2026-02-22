import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  @IsUUID()
  branchId: string;

  @ApiProperty({ example: 'February 2026 Menu', description: 'Menu name' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'https://example.com/menu-feb-2026.pdf',
    description: 'Menu file URL (PDF or image)',
  })
  @IsString()
  menuUrl: string;

  @ApiProperty({ example: '2026-02-01', description: 'Menu effective date' })
  @IsDateString()
  effectiveDate: string;

  @ApiProperty({
    example: 'Winter seasonal menu',
    description: 'Menu description',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateMenuDto {
  @ApiProperty({ example: 'Updated Menu Name', description: 'Menu name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    example: 'https://example.com/updated-menu.pdf',
    description: 'Menu file URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  menuUrl?: string;

  @ApiProperty({ example: '2026-03-01', description: 'Menu effective date', required: false })
  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @ApiProperty({ example: 'Updated description', description: 'Menu description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: true, description: 'Is menu active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
