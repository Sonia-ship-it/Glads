import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsNumber, IsUUID, IsEmail } from 'class-validator';

export class CreateTeamMemberDto {
  @ApiProperty({ example: 'John Doe', description: 'Team member full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: 'Branch Manager', description: 'Position/Role' })
  @IsString()
  position: string;

  @ApiProperty({ example: 'Management', description: 'Department' })
  @IsString()
  department: string;

  @ApiProperty({
    example: 'Experienced hotel manager with 10 years...',
    description: 'Bio',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'Photo URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ example: 'john@glads.rw', description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+250788123456', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 1, description: 'Display order', required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class UpdateTeamMemberDto {
  @ApiProperty({ example: 'Updated Name', description: 'Team member full name', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: 'Updated Position', description: 'Position/Role', required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ example: 'Management', description: 'Department', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: 'Updated bio', description: 'Bio', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'Photo URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiProperty({ example: 'john@glads.rw', description: 'Email address', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+250788123456', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: true, description: 'Is team member active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: 2, description: 'Display order', required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
