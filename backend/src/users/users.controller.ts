import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangeUserRoleDto } from '../common/dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create user', description: 'Create a new user account. Admin only.' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Email already exists or invalid data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  create(@Body() createDto: CreateUserDto) {
    return this.usersService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users', description: 'Retrieve all active users. Admin/Manager only.' })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by role (super_admin, admin, manager, staff, guest)' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch ID' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query('role') role?: string, @Query('branchId') branchId?: string) {
    return this.usersService.findAll(role, branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', description: 'Retrieve detailed user information. Admin/Manager only.' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'uuid-user-id' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user', description: 'Update user profile. Admin/Manager only.' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'uuid-user-id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    return this.usersService.update(id, updateDto);
  }

  @Post('change-role')
  @ApiOperation({ summary: 'Change user role', description: 'Change user role. Super Admin only.' })
  @ApiBody({ type: ChangeUserRoleDto })
  @ApiResponse({ status: 200, description: 'User role changed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Super Admin only' })
  @ApiResponse({ status: 404, description: 'User not found' })
  changeRole(@Body() changeRoleDto: ChangeUserRoleDto) {
    return this.usersService.changeRole(changeRoleDto);
  }

  @Delete(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user', description: 'Deactivate user account. Admin only.' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'uuid-user-id' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate user', description: 'Activate user account. Admin only.' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'uuid-user-id' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }
}
