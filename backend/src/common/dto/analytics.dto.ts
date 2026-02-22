import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class GetRevenueReportDto {
  @ApiProperty({
    example: 'uuid-branch-id',
    description: 'Branch ID (omit for all branches)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ example: '2026-01-01', description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-02-28', description: 'End date (YYYY-MM-DD)' })
  @IsDateString()
  endDate: string;
}

export class ExportReportDto {
  @ApiProperty({
    example: 'pdf',
    description: 'Export format',
    enum: ['pdf', 'excel'],
  })
  @IsString()
  format: string;

  @ApiProperty({ example: 'revenue', description: 'Report type' })
  @IsString()
  reportType: string;

  @ApiProperty({ example: '2026-01-01', description: 'Start date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-02-28', description: 'End date' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
