import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID, IsEnum } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'user@glads.rw', description: 'User email' })
  @IsString()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', description: 'User password' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  fullName: string;

  @ApiProperty({ example: '+250788123456', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'receptionist',
    description: 'User role',
    enum: ['super-admin', 'super-manager', 'branch-manager', 'receptionist'],
  })
  @IsEnum(['super-admin', 'super-manager', 'branch-manager', 'receptionist'])
  role: string;

  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '+250788123456', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'Profile picture URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID', required: false })
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty({ example: true, description: 'Is user active', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ChangeUserRoleDto {
  @ApiProperty({ example: 'uuid-user-id', description: 'User ID' })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'branch-manager',
    description: 'New role',
    enum: ['super-admin', 'super-manager', 'branch-manager', 'receptionist'],
  })
  @IsEnum(['super-admin', 'super-manager', 'branch-manager', 'receptionist'])
  newRole: string;

  @ApiProperty({
    example: 'uuid-branch-id',
    description: 'Branch ID (required for branch-specific roles)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
