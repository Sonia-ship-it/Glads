import { Controller, Get, Post, Put, Body, UseGuards, Request } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, RegisterStaffDto, UpdateProfileDto, ChangePasswordDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(RolesGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login',
    description: 'Authenticate staff/admin user and return access token.',
  })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register-staff')
  @UseGuards(JwtAuthGuard)
  @Roles('super-admin', 'super-manager')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Register staff user (Admin only)',
    description: 'Create a new staff account with specified role and branch assignment.',
  })
  @ApiResponse({ status: 201, description: 'Staff user created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiBody({ type: RegisterStaffDto })
  async registerStaff(@Request() req, @Body() registerStaffDto: RegisterStaffDto) {
    return this.authService.registerStaff(registerStaffDto, req.user.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve extended profile information for authenticated user.',
  })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Request() req) {
    return this.authService.getCurrentUser(req.user.sub);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update extended profile fields (name, phone, profile picture).',
  })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.authService.updateProfile(req.user.sub, updateProfileDto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Change password',
    description: 'Change authenticated user password via Supabase Auth.',
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.sub, changePasswordDto);
  }

  @Get('test')
  @ApiOperation({
    summary: 'Test auth module',
    description: 'Health check for authentication module.',
  })
  @ApiResponse({ status: 200, description: 'Auth module is working' })
  test() {
    return {
      message: 'Auth module is working!',
      timestamp: new Date().toISOString(),
    };
  }
}
