import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class BranchesService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return data;
  }

  async create(createBranchDto: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('branches')
      .insert([createBranchDto])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, updateBranchDto: any) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('branches')
      .update(updateBranchDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    // Soft delete: set is_active to false instead of hard delete
    const { data, error } = await supabase
      .from('branches')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getBranchStats(branchId: string) {
    const supabase = this.supabaseService.getClient();
    
    // Verify branch exists
    await this.findOne(branchId);

    // Get room count and types
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('room_type, status')
      .eq('branch_id', branchId)
      .eq('is_active', true);

    if (roomsError) {
      throw new Error(`Failed to fetch room statistics: ${roomsError.message}`);
    }

    // Get booking statistics for current month
    const currentMonth = new Date();
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, status, payment_status, total_amount, number_of_nights, created_at')
      .eq('branch_id', branchId)
      .gte('created_at', firstDay.toISOString())
      .lte('created_at', lastDay.toISOString());

    if (bookingsError) {
      throw new Error(`Failed to fetch booking statistics: ${bookingsError.message}`);
    }

    // Get revenue data
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, status, created_at, bookings!inner(branch_id)')
      .eq('bookings.branch_id', branchId)
      .eq('status', 'completed')
      .gte('created_at', firstDay.toISOString())
      .lte('created_at', lastDay.toISOString());

    if (paymentsError) {
      throw new Error(`Failed to fetch revenue statistics: ${paymentsError.message}`);
    }

    // Get service bookings
    const { data: serviceBookings, error: serviceBookingsError } = await supabase
      .from('service_bookings')
      .select('total_amount, status, created_at')
      .eq('branch_id', branchId)
      .gte('created_at', firstDay.toISOString())
      .lte('created_at', lastDay.toISOString());

    if (serviceBookingsError) {
      throw new Error(`Failed to fetch service booking statistics: ${serviceBookingsError.message}`);
    }

    // Calculate statistics
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;

    const roomTypeBreakdown = rooms.reduce((acc, room) => {
      acc[room.room_type] = (acc[room.room_type] || 0) + 1;
      return acc;
    }, {});

    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    const paidBookings = bookings.filter(b => b.payment_status === 'paid').length;

    const totalNights = bookings.reduce((sum, booking) => sum + booking.number_of_nights, 0);
    const occupancyRate = totalRooms > 0 ? (totalNights / (totalRooms * new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate())) * 100 : 0;

    const roomRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const serviceRevenue = serviceBookings
      .filter(sb => sb.status === 'completed')
      .reduce((sum, sb) => sum + sb.total_amount, 0);
    const totalRevenue = roomRevenue + serviceRevenue;

    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return {
      branchId,
      period: {
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear(),
        firstDay: firstDay.toISOString().split('T')[0],
        lastDay: lastDay.toISOString().split('T')[0],
      },
      rooms: {
        total: totalRooms,
        available: availableRooms,
        occupied: occupiedRooms,
        maintenance: maintenanceRooms,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
        typeBreakdown: roomTypeBreakdown,
      },
      bookings: {
        total: totalBookings,
        confirmed: confirmedBookings,
        cancelled: cancelledBookings,
        paid: paidBookings,
        conversionRate: totalBookings > 0 ? Math.round((confirmedBookings / totalBookings) * 100 * 100) / 100 : 0,
      },
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        rooms: Math.round(roomRevenue * 100) / 100,
        services: Math.round(serviceRevenue * 100) / 100,
        averageBookingValue: Math.round(averageBookingValue * 100) / 100,
        currency: 'RWF',
      },
      performance: {
        totalNights,
        averageStayDuration: totalBookings > 0 ? Math.round((totalNights / totalBookings) * 100) / 100 : 0,
      },
    };
  }
}
