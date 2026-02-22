import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateGymSubscriptionDto,
  UpdateGymSubscriptionDto,
  RenewGymSubscriptionDto,
} from '../common/dto/gym-subscription.dto';

@Injectable()
export class GymSubscriptionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private generateMembershipNumber(): string {
    const prefix = 'GYM';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private generateAccessCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  async create(createDto: CreateGymSubscriptionDto) {
    const supabase = this.supabaseService.getAdminClient();

    const membershipNumber = this.generateMembershipNumber();
    const accessCode = this.generateAccessCode();

    const { data, error } = await supabase
      .from('gym_subscriptions')
      .insert({
        service_booking_id: createDto.serviceBookingId,
        member_id: createDto.memberId,
        branch_id: createDto.branchId,
        membership_number: membershipNumber,
        subscription_period: createDto.subscriptionPeriod,
        start_date: createDto.startDate,
        end_date: createDto.endDate,
        is_active: true,
        auto_renewal: createDto.autoRenewal || false,
        access_code: accessCode,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create gym subscription: ${error.message}`);
    return data;
  }

  async findAll(branchId?: string) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('gym_subscriptions')
      .select('*, service_bookings(service_id), branches(name)');

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch gym subscriptions: ${error.message}`);
    return data;
  }

  async findByMember(memberId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('gym_subscriptions')
      .select('*, branches(name, address)')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch member subscriptions: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('gym_subscriptions')
      .select('*, branches(name, address, contact_info), service_bookings(service_id)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Gym subscription not found: ${error.message}`);
    return data;
  }

  async findByMembershipNumber(membershipNumber: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('gym_subscriptions')
      .select('*, branches(name)')
      .eq('membership_number', membershipNumber)
      .single();

    if (error) throw new Error(`Membership not found: ${error.message}`);
    return data;
  }

  async update(id: string, updateDto: UpdateGymSubscriptionDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('gym_subscriptions')
      .update({
        is_active: updateDto.isActive,
        auto_renewal: updateDto.autoRenewal,
        end_date: updateDto.endDate,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update gym subscription: ${error.message}`);
    return data;
  }

  async renew(id: string, renewDto: RenewGymSubscriptionDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: current } = await supabase
      .from('gym_subscriptions')
      .select('end_date')
      .eq('id', id)
      .single();

    if (!current) throw new Error('Subscription not found');

    const startDate = new Date(current.end_date);
    const endDate = this.calculateEndDate(startDate, renewDto.subscriptionPeriod);

    const { data, error } = await supabase
      .from('gym_subscriptions')
      .update({
        subscription_period: renewDto.subscriptionPeriod,
        end_date: endDate.toISOString(),
        auto_renewal: renewDto.autoRenewal,
        is_active: true,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to renew subscription: ${error.message}`);
    return data;
  }

  async cancel(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('gym_subscriptions')
      .update({ is_active: false, auto_renewal: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to cancel subscription: ${error.message}`);
    return data;
  }

  private calculateEndDate(startDate: Date, period: string): Date {
    const date = new Date(startDate);
    switch (period) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  }
}
