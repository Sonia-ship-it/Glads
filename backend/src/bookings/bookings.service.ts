import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  CheckAvailabilityDto,
  OtaManualBookingDto,
} from '../common/dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createBookingDto: CreateBookingDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Validate dates
    const checkIn = new Date(createBookingDto.checkInDate);
    const checkOut = new Date(createBookingDto.checkOutDate);
    
    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }
    
    if (checkIn < new Date()) {
      throw new Error('Check-in date cannot be in the past');
    }

    // Check availability first
    const availabilityDto: CheckAvailabilityDto = {
      branchId: createBookingDto.branchId,
      roomId: createBookingDto.roomId,
      checkInDate: createBookingDto.checkInDate,
      checkOutDate: createBookingDto.checkOutDate,
    };
    const isAvailable = await this.checkAvailability(availabilityDto);

    if (!isAvailable) {
      throw new Error('Room is not available for the selected dates');
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        branch_id: createBookingDto.branchId,
        room_id: createBookingDto.roomId,
        guest_info: createBookingDto.guestInfo,
        check_in_date: createBookingDto.checkInDate,
        check_out_date: createBookingDto.checkOutDate,
        number_of_guests: createBookingDto.numberOfGuests,
        special_requests: createBookingDto.specialRequests,
        total_amount: createBookingDto.totalAmount,
        payment_status: 'pending',
        payment_method: createBookingDto.paymentGateway || 'pesapal',
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create booking: ${error.message}`);
    return data;
  }

  async createOtaManualBooking(otaBookingDto: OtaManualBookingDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        branch_id: otaBookingDto.branchId,
        room_id: otaBookingDto.roomId,
        guest_info: otaBookingDto.guestInfo,
        check_in_date: otaBookingDto.checkInDate,
        check_out_date: otaBookingDto.checkOutDate,
        number_of_guests: otaBookingDto.numberOfGuests,
        total_amount: otaBookingDto.totalAmount,
        payment_status: 'paid',
        booking_source: otaBookingDto.otaPlatform,
        ota_reference: otaBookingDto.otaReference,
        status: 'confirmed',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create OTA booking: ${error.message}`);
    return data;
  }

  async findAll(branchId?: string, status?: string) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('bookings')
      .select('*, rooms(room_number, room_type), branches(name)');

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch bookings: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('bookings')
      .select('*, rooms(room_number, room_type, base_price), branches(name, address, contact_info)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Booking not found: ${error.message}`);
    return data;
  }

  async checkAvailability(checkDto: CheckAvailabilityDto): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', checkDto.roomId)
      .in('status', ['confirmed', 'checked_in'])
      .or(
        `and(check_in_date.lte.${checkDto.checkOutDate || checkDto.checkOut},check_out_date.gte.${checkDto.checkInDate || checkDto.checkIn})`,
      );

    if (error) throw new Error(`Failed to check availability: ${error.message}`);
    return data.length === 0;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = {};
    if (updateBookingDto.checkInDate) updateData.check_in_date = updateBookingDto.checkInDate;
    if (updateBookingDto.checkOutDate) updateData.check_out_date = updateBookingDto.checkOutDate;
    if (updateBookingDto.numberOfGuests)
      updateData.number_of_guests = updateBookingDto.numberOfGuests;
    if (updateBookingDto.specialRequests)
      updateData.special_requests = updateBookingDto.specialRequests;
    if (updateBookingDto.status) updateData.status = updateBookingDto.status;
    if (updateBookingDto.paymentStatus) updateData.payment_status = updateBookingDto.paymentStatus;
    if (updateBookingDto.totalAmount) updateData.total_amount = updateBookingDto.totalAmount;

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update booking: ${error.message}`);
    return data;
  }

  async checkIn(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'checked_in',
        actual_check_in: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to check in: ${error.message}`);

    // Update room status to occupied
    await supabase.from('rooms').update({ status: 'occupied' }).eq('id', data.room_id);

    return data;
  }

  async checkOut(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'checked_out',
        actual_check_out: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to check out: ${error.message}`);

    // Update room status back to available
    await supabase.from('rooms').update({ status: 'active' }).eq('id', data.room_id);

    return data;
  }

  async cancel(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to cancel booking: ${error.message}`);
    return data;
  }

  async getBookingStats(branchId: string, startDate?: string, endDate?: string) {
    const supabase = this.supabaseService.getClient();

    let query = supabase.from('bookings').select('status, total_amount').eq('branch_id', branchId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to get booking stats: ${error.message}`);

    const stats = {
      total: data.length,
      confirmed: data.filter((b) => b.status === 'confirmed').length,
      checkedIn: data.filter((b) => b.status === 'checked_in').length,
      checkedOut: data.filter((b) => b.status === 'checked_out').length,
      cancelled: data.filter((b) => b.status === 'cancelled').length,
      totalRevenue: data
        .filter((b) => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0),
    };

    return stats;
  }
}
