import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  UpdateNotificationPreferencesDto,
  MarkNotificationReadDto,
} from '../common/dto/notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user notifications',
    description: 'Retrieve all notifications for a user',
  })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'uuid-user-id' })
  @ApiQuery({ name: 'isRead', required: false, description: 'Filter by read status (true/false)' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAllForUser(@Param('userId') userId: string, @Query('isRead') isRead?: boolean) {
    return this.notificationsService.findAllForUser(userId, isRead);
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({
    summary: 'Get unread notification count',
    description: 'Get the number of unread notifications for a user',
  })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'uuid-user-id' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Post('mark-read')
  @ApiOperation({
    summary: 'Mark notifications as read',
    description: 'Mark specific notifications as read',
  })
  @ApiBody({ type: MarkNotificationReadDto })
  @ApiResponse({ status: 200, description: 'Notifications marked as read successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  markAsRead(@Body() markDto: MarkNotificationReadDto) {
    return this.notificationsService.markAsRead(markDto);
  }

  @Post('user/:userId/mark-all-read')
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications for a user as read',
  })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'uuid-user-id' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  markAllAsRead(@Param('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch('user/:userId/preferences')
  @ApiOperation({
    summary: 'Update notification preferences',
    description: 'Update user notification preferences',
  })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'uuid-user-id' })
  @ApiBody({ type: UpdateNotificationPreferencesDto })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updatePreferences(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateNotificationPreferencesDto,
  ) {
    return this.notificationsService.updatePreferences(userId, updateDto);
  }
}
