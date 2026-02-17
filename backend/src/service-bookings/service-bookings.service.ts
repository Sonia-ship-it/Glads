import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateServiceBookingDto } from '../common/dto/service.dto';

@Injectable()
export class ServiceBookingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDto: CreateServiceBookingDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('service_bookings')
      .insert({
        service_id: createDto.serviceId,
        user_id: createDto.userId,
        guest_info: createDto.guestInfo,
        booking_date: createDto.bookingDate,
        booking_time: createDto.bookingTime,
        number_of_people: createDto.numberOfPeople,
        special_requests: createDto.specialRequests,
        total_amount: createDto.totalAmount,
        payment_status: 'pending',
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create service booking: ${error.message}`);

    // If it's a gym subscription with auto-renewal, create gym_subscription record
    if (createDto.autoRenewal) {
      await supabase.from('gym_subscriptions').insert({
        user_id: createDto.userId,
        service_booking_id: data.id,
        subscription_plan: 'monthly', // Default, should come from service
        start_date: createDto.bookingDate,
        end_date: this.calculateEndDate(createDto.bookingDate, 'monthly'),
        auto_renewal: true,
        status: 'active',
      });
    }

    return data;
  }

  async findAll(userId?: string, serviceId?: string, status?: string) {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('service_bookings')
      .select('*, services(name, category, price), users(full_name, email)');

    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('booking_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch service bookings: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('service_bookings')
      .select('*, services(name, category, price, description), users(full_name, email, phone)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Service booking not found: ${error.message}`);
    return data;
  }

  async cancel(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('service_bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to cancel service booking: ${error.message}`);
    return data;
  }

  async complete(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('service_bookings')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to complete service booking: ${error.message}`);
    return data;
  }

  private calculateEndDate(startDate: string, period: string): string {
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
    return date.toISOString();
  }
}
