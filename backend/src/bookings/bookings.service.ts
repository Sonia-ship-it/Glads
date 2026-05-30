import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateBookingDto,
  UpdateBookingDto,
  CheckAvailabilityDto,
  OtaManualBookingDto,
} from '../common/dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly supabaseService: SupabaseService) { }

  private generateBookingReference(prefix = 'BKG'): string {
    const stamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `${prefix}-${stamp}-${random}`;
  }

  private calculateNights(checkInDate: string, checkOutDate: string): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    return Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  }

  async create(createBookingDto: CreateBookingDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Validate dates
    const checkIn = new Date(createBookingDto.checkInDate);
    const checkOut = new Date(createBookingDto.checkOutDate);

    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      throw new BadRequestException('Invalid check-in/check-out date format');
    }

    if (checkOut <= checkIn) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    if (checkIn < new Date()) {
      throw new BadRequestException('Check-in date cannot be in the past');
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
      throw new BadRequestException('Room is not available for the selected dates');
    }

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, branch_id, base_price')
      .eq('id', createBookingDto.roomId)
      .single();

    if (roomError || !room) {
      throw new NotFoundException(
        `Room not found: ${roomError?.message || createBookingDto.roomId}`,
      );
    }

    const numberOfNights = this.calculateNights(
      createBookingDto.checkInDate,
      createBookingDto.checkOutDate,
    );
    const roomRate = Number(room.base_price);
    const computedTotalAmount = roomRate * numberOfNights;

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        booking_reference: this.generateBookingReference(),
        branch_id: createBookingDto.branchId,
        room_id: createBookingDto.roomId,
        guest_info: createBookingDto.guestInfo,
        check_in_date: createBookingDto.checkInDate,
        check_out_date: createBookingDto.checkOutDate,
        number_of_guests: createBookingDto.numberOfGuests,
        number_of_nights: numberOfNights,
        room_rate: roomRate,
        special_requests: createBookingDto.specialRequests,
        total_amount: createBookingDto.totalAmount || computedTotalAmount,
        payment_status: 'pending',
        payment_gateway: createBookingDto.paymentGateway || 'pesapal',
        status: 'pending',
        source: 'website',
      })
      .select()
      .single();

    if (error) throw new BadRequestException(`Failed to create booking: ${error.message}`);
    return data;
  }

  async createOtaManualBooking(otaBookingDto: OtaManualBookingDto, user: any) {
    const userRole = (user.role || user.user_metadata?.role || '').toLowerCase();
    const userBranchId = user.branchId || user.branch_id || user.user_metadata?.branchId;

    if (
      (userRole.includes('manager') || userRole.includes('reception') || userRole.includes('staff')) &&
      otaBookingDto.branchId !== userBranchId
    ) {
      throw new ForbiddenException(
        'Forbidden: You can only create OTA bookings for your assigned branch',
      );
    }

    const supabase = this.supabaseService.getAdminClient();

    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, base_price')
      .eq('id', otaBookingDto.roomId)
      .single();

    if (roomError || !room) {
      throw new NotFoundException(`Room not found: ${roomError?.message || otaBookingDto.roomId}`);
    }

    const numberOfNights = this.calculateNights(
      otaBookingDto.checkInDate,
      otaBookingDto.checkOutDate,
    );
    const roomRate = Number(room.base_price);

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        booking_reference: this.generateBookingReference('OTA'),
        branch_id: otaBookingDto.branchId,
        room_id: otaBookingDto.roomId,
        guest_info: otaBookingDto.guestInfo,
        check_in_date: otaBookingDto.checkInDate,
        check_out_date: otaBookingDto.checkOutDate,
        number_of_guests: otaBookingDto.numberOfGuests,
        number_of_nights: numberOfNights,
        room_rate: roomRate,
        total_amount: otaBookingDto.totalAmount,
        payment_status: 'paid',
        payment_gateway: 'pay-at-property',
        source: 'ota-manual',
        ota_platform: otaBookingDto.otaPlatform,
        ota_reference: otaBookingDto.otaReference,
        status: 'confirmed',
      })
      .select()
      .single();

    if (error) throw new BadRequestException(`Failed to create OTA booking: ${error.message}`);
    return data;
  }

  async findAll(branchId?: string, status?: string, user?: any) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('bookings')
      .select('*, rooms(room_number, room_type), branches(name)');

    const userRole = (user?.role || user?.user_metadata?.role || '').toLowerCase();
    const userBranchId = user?.branchId || user?.branch_id || user?.user_metadata?.branchId;

    if (userRole.includes('manager') || userRole.includes('reception') || userRole.includes('staff')) {
      query = query.eq('branch_id', userBranchId);
    } else if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new BadRequestException(`Failed to fetch bookings: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('bookings')
      .select('*, rooms(room_number, room_type, base_price), branches(name, address, contact_info)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Booking not found: ${error?.message || id}`);
    }
    return data;
  }

  async checkAvailability(checkDto: CheckAvailabilityDto): Promise<boolean> {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('bookings')
      .select('id')
      .in('status', ['confirmed', 'checked-in', 'checked_in'])
      .or(
        `and(check_in_date.lte.${checkDto.checkOutDate || checkDto.checkOut},check_out_date.gte.${checkDto.checkInDate || checkDto.checkIn})`,
      );

    if (checkDto.roomId) {
      query = query.eq('room_id', checkDto.roomId);
    }

    if (checkDto.branchId) {
      query = query.eq('branch_id', checkDto.branchId);
    }

    const { data, error } = await query;

    if (error) throw new BadRequestException(`Failed to check availability: ${error.message}`);
    return data.length === 0;
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, user: any) {
    const supabase = this.supabaseService.getAdminClient();

    // Check permissions
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('branch_id')
      .eq('id', id)
      .single();
    if (existingBooking) {
      const userRole = (user.role || user.user_metadata?.role || '').toLowerCase();
      const userBranchId = user.branchId || user.branch_id || user.user_metadata?.branchId;
      if (
        (userRole.includes('manager') || userRole.includes('reception') || userRole.includes('staff')) &&
        existingBooking.branch_id !== userBranchId
      ) {
        throw new ForbiddenException(
          'Forbidden: You can only update bookings in your assigned branch',
        );
      }
    }

    const updateData: any = {};
    if (updateBookingDto.checkInDate) updateData.check_in_date = updateBookingDto.checkInDate;
    if (updateBookingDto.checkOutDate) updateData.check_out_date = updateBookingDto.checkOutDate;
    if (updateBookingDto.numberOfGuests)
      updateData.number_of_guests = updateBookingDto.numberOfGuests;
    if (updateBookingDto.specialRequests)
      updateData.special_requests = updateBookingDto.specialRequests;
    if (updateBookingDto.status) updateData.status = updateBookingDto.status.replace('_', '-');
    if (updateBookingDto.paymentStatus) updateData.payment_status = updateBookingDto.paymentStatus;
    if (updateBookingDto.totalAmount !== undefined)
      updateData.total_amount = updateBookingDto.totalAmount;

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to update booking: ${error?.message || id}`);
    }
    return data;
  }

  async checkIn(id: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();

    // Check permissions
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('branch_id, room_id')
      .eq('id', id)
      .single();
    if (existingBooking) {
      const userRole = (user.role || user.user_metadata?.role || '').toLowerCase();
      const userBranchId = user.branchId || user.branch_id || user.user_metadata?.branchId;
      if (
        (userRole.includes('manager') || userRole.includes('reception') || userRole.includes('staff')) &&
        existingBooking.branch_id !== userBranchId
      ) {
        throw new ForbiddenException(
          'Forbidden: You can only check in bookings in your assigned branch',
        );
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'checked-in',
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to check in: ${error?.message || id}`);
    }

    // Update room status to occupied
    await supabase.from('rooms').update({ status: 'occupied' }).eq('id', data.room_id);

    return data;
  }

  async checkOut(id: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();

    // Check permissions
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('branch_id, room_id')
      .eq('id', id)
      .single();
    if (existingBooking) {
      const userRole = (user.role || user.user_metadata?.role || '').toLowerCase();
      const userBranchId = user.branchId || user.branch_id || user.user_metadata?.branchId;
      if (
        (userRole.includes('manager') || userRole.includes('reception') || userRole.includes('staff')) &&
        existingBooking.branch_id !== userBranchId
      ) {
        throw new ForbiddenException(
          'Forbidden: You can only check out bookings in your assigned branch',
        );
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({
        status: 'checked-out',
        checked_out_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to check out: ${error?.message || id}`);
    }

    // Update room status back to available
    await supabase.from('rooms').update({ status: 'available' }).eq('id', data.room_id);

    return data;
  }

  async cancel(id: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();

    // Check permissions
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('branch_id')
      .eq('id', id)
      .single();
    if (existingBooking) {
      const userRole = (user.role || user.user_metadata?.role || '').toLowerCase();
      const userBranchId = user.branchId || user.branch_id || user.user_metadata?.branchId;
      if (
        (userRole.includes('manager') || userRole.includes('reception') || userRole.includes('staff')) &&
        existingBooking.branch_id !== userBranchId
      ) {
        throw new ForbiddenException(
          'Forbidden: You can only cancel bookings in your assigned branch',
        );
      }
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to cancel booking: ${error?.message || id}`);
    }
    return data;
  }

  async getBookingStats(branchId: string, startDate?: string, endDate?: string, user?: any) {
    const userRole = (user?.role || user?.user_metadata?.role || '').toLowerCase();
    const userBranchId = user?.branchId || user?.branch_id || user?.user_metadata?.branchId;

    if (
      (userRole.includes('manager') || userRole.includes('reception') || userRole.includes('staff')) &&
      branchId !== userBranchId
    ) {
      throw new ForbiddenException('Forbidden: You can only view stats for your assigned branch');
    }

    const supabase = this.supabaseService.getAdminClient();

    let query = supabase.from('bookings').select('status, total_amount').eq('branch_id', branchId);

    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw new BadRequestException(`Failed to get booking stats: ${error.message}`);

    const stats = {
      total: data.length,
      confirmed: data.filter((b) => b.status === 'confirmed').length,
      checkedIn: data.filter((b) => b.status === 'checked-in').length,
      checkedOut: data.filter((b) => b.status === 'checked-out').length,
      cancelled: data.filter((b) => b.status === 'cancelled').length,
      totalRevenue: data
        .filter((b) => b.status !== 'cancelled')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0),
    };

    return stats;
  }
}
