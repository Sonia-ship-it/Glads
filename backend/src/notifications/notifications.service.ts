import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  UpdateNotificationPreferencesDto,
  MarkNotificationReadDto,
} from '../common/dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAllForUser(userId: string, isRead?: boolean) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase.from('notifications').select('*').eq('recipient_id', userId);

    if (isRead !== undefined) {
      query = query.eq('is_read', isRead);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new BadRequestException(`Failed to fetch notifications: ${error.message}`);
    return data;
  }

  async markAsRead(markDto: MarkNotificationReadDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in('id', markDto.notificationIds)
      .select();

    if (error)
      throw new BadRequestException(`Failed to mark notifications as read: ${error.message}`);
    return data;
  }

  async markAllAsRead(userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_id', userId)
      .eq('is_read', false)
      .select();

    if (error)
      throw new BadRequestException(`Failed to mark all notifications as read: ${error.message}`);
    return data;
  }

  async getUnreadCount(userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);

    if (error) throw new BadRequestException(`Failed to get unread count: ${error.message}`);
    return { unreadCount: count || 0 };
  }

  async updatePreferences(userId: string, updateDto: UpdateNotificationPreferencesDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('users')
      .update({ notification_preferences: updateDto })
      .eq('id', userId)
      .select('notification_preferences')
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update notification preferences: ${error.message}`);
    }
    return data;
  }
}
