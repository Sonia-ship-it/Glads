import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class QueryAuditLogsDto {
  @ApiProperty({ example: 'uuid-user-id', description: 'Filter by user ID', required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ example: 'booking', description: 'Filter by entity type', required: false })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({ example: 'uuid-entity-id', description: 'Filter by entity ID', required: false })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({ example: 'create', description: 'Filter by action', required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({ example: '2026-02-01', description: 'Filter from date', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ example: '2026-02-28', description: 'Filter to date', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({ example: '50', description: 'Limit results', required: false })
  @IsOptional()
  limit?: number;
}
