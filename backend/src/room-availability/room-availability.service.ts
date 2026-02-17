import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateRoomAvailabilityDto,
  UpdateRoomAvailabilityDto,
  BulkUpdateRoomAvailabilityDto,
  QueryRoomAvailabilityDto,
} from '../common/dto/room-availability.dto';

@Injectable()
export class RoomAvailabilityService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(branchId: string, createDto: CreateRoomAvailabilityDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('room_availability')
      .insert({
        room_id: createDto.roomId,
        branch_id: branchId,
        date: createDto.date,
        is_available: createDto.isAvailable,
        booking_id: createDto.bookingId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create room availability: ${error.message}`);
    return data;
  }

  async findByDateRange(queryDto: QueryRoomAvailabilityDto) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('room_availability')
      .select('*, rooms(room_number, name, room_type)')
      .gte('date', queryDto.startDate)
      .lte('date', queryDto.endDate);

    if (queryDto.branchId) {
      query = query.eq('branch_id', queryDto.branchId);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) throw new Error(`Failed to fetch availability: ${error.message}`);
    return data;
  }

  async findByRoom(roomId: string, startDate: string, endDate: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('room_availability')
      .select('*')
      .eq('room_id', roomId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) throw new Error(`Failed to fetch room availability: ${error.message}`);
    return data;
  }

  async update(id: string, updateDto: UpdateRoomAvailabilityDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('room_availability')
      .update({
        is_available: updateDto.isAvailable,
        booking_id: updateDto.bookingId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update availability: ${error.message}`);
    return data;
  }

  async bulkUpdate(bulkDto: BulkUpdateRoomAvailabilityDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('room_availability')
      .update({ is_available: bulkDto.isAvailable })
      .eq('room_id', bulkDto.roomId)
      .gte('date', bulkDto.startDate)
      .lte('date', bulkDto.endDate)
      .select();

    if (error) throw new Error(`Failed to bulk update availability: ${error.message}`);
    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase
      .from('room_availability')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete availability: ${error.message}`);
    return { message: 'Room availability deleted successfully' };
  }
}
