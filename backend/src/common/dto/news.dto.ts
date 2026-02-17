import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({ example: 'uuid-author-id', description: 'Author user ID' })
  @IsUUID()
  authorId: string;

  @ApiProperty({ example: 'Grand Opening Next Month', description: 'News title' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Full news content here...', description: 'News content (HTML/Markdown)' })
  @IsString()
  content: string;

  @ApiProperty({ example: 'Brief excerpt of the news', description: 'News excerpt', required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({
    example: 'announcement',
    description: 'News category',
    enum: ['announcement', 'event', 'promotion', 'maintenance'],
  })
  @IsEnum(['announcement', 'event', 'promotion', 'maintenance'])
  category: string;

  @ApiProperty({ example: 'https://example.com/news.jpg', description: 'Image URL', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: 'global',
    description: 'News scope',
    enum: ['global', 'branch-specific'],
  })
  @IsEnum(['global', 'branch-specific'])
  scope: string;

  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID (required if scope is branch-specific)', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({
    example: 'all',
    description: 'Target audience',
    enum: ['all', 'guests', 'staff'],
  })
  @IsEnum(['all', 'guests', 'staff'])
  targetAudience: string;

  @ApiProperty({ example: '2026-02-20T00:00:00Z', description: 'Publication date', required: false })
  @IsOptional()
  @IsDateString()
  publishedDate?: string;

  @ApiProperty({ example: '2026-03-20T00:00:00Z', description: 'Expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateNewsDto {
  @ApiProperty({ example: 'Updated Title', description: 'News title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated content', description: 'News content', required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ example: 'Updated excerpt', description: 'News excerpt', required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({
    example: 'promotion',
    description: 'News category',
    enum: ['announcement', 'event', 'promotion', 'maintenance'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['announcement', 'event', 'promotion', 'maintenance'])
  category?: string;

  @ApiProperty({ example: 'https://example.com/updated.jpg', description: 'Image URL', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({
    example: 'global',
    description: 'News scope',
    enum: ['global', 'branch-specific'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['global', 'branch-specific'])
  scope?: string;

  @ApiProperty({
    example: 'all',
    description: 'Target audience',
    enum: ['all', 'guests', 'staff'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['all', 'guests', 'staff'])
  targetAudience?: string;

  @ApiProperty({ example: true, description: 'Is published', required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ example: true, description: 'Is news pinned', required: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}
