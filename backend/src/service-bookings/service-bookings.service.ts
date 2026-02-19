import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateServiceBookingDto } from '../common/dto/service.dto';

@Injectable()
export class ServiceBookingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private generateBookingReference(prefix = 'SBK'): string {
    const stamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${prefix}-${stamp}-${random}`;
  }

  private buildServiceDate(date: string, time?: string): string {
    if (time) {
      return new Date(`${date}T${time}:00`).toISOString();
    }
    return new Date(date).toISOString();
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
      default:
        date.setMonth(date.getMonth() + 1);
    }
    return date.toISOString();
  }

  private generateMembershipNumber(): string {
    return `GYM${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;
  }

  private generateAccessCode(): string {
    return Math.random().toString(36).slice(2, 10).toUpperCase();
  }

  async create(createDto: CreateServiceBookingDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, branch_id, price, category, billing_type, subscription_period')
      .eq('id', createDto.serviceId)
      .single();

    if (serviceError || !service) {
      throw new NotFoundException(`Service not found: ${serviceError?.message || createDto.serviceId}`);
    }

    const serviceDate = this.buildServiceDate(createDto.bookingDate, createDto.bookingTime);
    const quantity = createDto.numberOfPeople && createDto.numberOfPeople > 0 ? createDto.numberOfPeople : 1;
    const unitPrice = Number(service.price || 0);
    const totalAmount = createDto.totalAmount || unitPrice * quantity;
    const subscriptionStartDate = service.billing_type === 'subscription' ? serviceDate : null;
    const subscriptionEndDate =
      service.billing_type === 'subscription'
        ? this.calculateEndDate(serviceDate, service.subscription_period || 'monthly')
        : null;

    const guestInfo = {
      ...(createDto.guestInfo || {}),
      ...(createDto.userId ? { userId: createDto.userId } : {}),
      ...(createDto.specialRequests ? { specialRequests: createDto.specialRequests } : {}),
    };

    const { data, error } = await supabase
      .from('service_bookings')
      .insert({
        booking_reference: this.generateBookingReference(),
        branch_id: service.branch_id,
        service_id: createDto.serviceId,
        guest_info: guestInfo,
        service_date: serviceDate,
        service_time: createDto.bookingTime,
        quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        payment_gateway: 'pay-at-property',
        subscription_start_date: subscriptionStartDate,
        subscription_end_date: subscriptionEndDate,
        auto_renewal: createDto.autoRenewal || false,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create service booking: ${error.message}`);
    }

    if (createDto.autoRenewal && service.category === 'gym' && createDto.userId) {
      const subscriptionPeriod = service.subscription_period || 'monthly';

      const { error: gymError } = await supabase.from('gym_subscriptions').insert({
        service_booking_id: data.id,
        member_id: createDto.userId,
        branch_id: service.branch_id,
        membership_number: this.generateMembershipNumber(),
        subscription_period: subscriptionPeriod,
        start_date: subscriptionStartDate || serviceDate,
        end_date: subscriptionEndDate || this.calculateEndDate(serviceDate, subscriptionPeriod),
        is_active: true,
        auto_renewal: true,
        access_code: this.generateAccessCode(),
      });

      if (gymError) {
        throw new BadRequestException(`Failed to create linked gym subscription: ${gymError.message}`);
      }
    }

    return data;
  }

  async findAll(userId?: string, serviceId?: string, status?: string) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('service_bookings')
      .select('*, services(name, category, price), branches(name)');

    if (userId) {
      query = query.contains('guest_info', { userId });
    }
    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('service_date', { ascending: false });

    if (error) throw new BadRequestException(`Failed to fetch service bookings: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('service_bookings')
      .select('*, services(name, category, price, description), branches(name, address, contact_info)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Service booking not found: ${error?.message || id}`);
    }
    return data;
  }

  async cancel(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('service_bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to cancel service booking: ${error?.message || id}`);
    }
    return data;
  }

  async complete(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('service_bookings')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to complete service booking: ${error?.message || id}`);
    }
    return data;
  }
}
