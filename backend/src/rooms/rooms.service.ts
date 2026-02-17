import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateRoomDto, UpdateRoomDto, SearchAvailableRoomsDto } from '../common/dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(branchId: string, createRoomDto: CreateRoomDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        branch_id: branchId,
        room_number: createRoomDto.roomNumber,
        room_type: createRoomDto.roomType,
        floor: createRoomDto.floor,
        name: createRoomDto.name,
        base_price: createRoomDto.basePrice,
        max_occupancy: createRoomDto.maxOccupancy,
        amenities: createRoomDto.amenities,
        images: createRoomDto.images || [],
        description: createRoomDto.description,
        size_sqm: createRoomDto.sizeSqm,
        bed_type: createRoomDto.bedType,
        view_type: createRoomDto.viewType,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create room: ${error.message}`);
    return data;
  }

  async findAll(branchId?: string) {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('rooms')
      .select('*, branches(name, coordinates)')
      .eq('status', 'active');

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query.order('room_number', { ascending: true });

    if (error) throw new Error(`Failed to fetch rooms: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*, branches(name, coordinates, address)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Room not found: ${error.message}`);
    return data;
  }

  async searchAvailable(searchDto: SearchAvailableRoomsDto) {
    const supabase = this.supabaseService.getClient();
    
    // Get all rooms matching criteria
    let query = supabase
      .from('rooms')
      .select('*, branches(name, coordinates)')
      .eq('status', 'active');

    if (searchDto.branchId) {
      query = query.eq('branch_id', searchDto.branchId);
    }
    if (searchDto.roomType) {
      query = query.eq('room_type', searchDto.roomType);
    }
    if (searchDto.minPrice) {
      query = query.gte('base_price', searchDto.minPrice);
    }
    if (searchDto.maxPrice) {
      query = query.lte('base_price', searchDto.maxPrice);
    }
    if (searchDto.minOccupancy) {
      query = query.gte('max_occupancy', searchDto.minOccupancy);
    }

    const { data: rooms, error: roomsError } = await query;
    if (roomsError) throw new Error(`Failed to search rooms: ${roomsError.message}`);

    // Check availability for date range if provided
    if (searchDto.checkIn && searchDto.checkOut) {
      const availableRooms = [];
      
      for (const room of rooms) {
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id')
          .eq('room_id', room.id)
          .in('status', ['confirmed', 'checked_in'])
          .or(`and(check_in_date.lte.${searchDto.checkOut},check_out_date.gte.${searchDto.checkIn})`);

        if (bookingsError) continue;
        
        if (bookings.length === 0) {
          availableRooms.push(room);
        }
      }
      
      return availableRooms;
    }

    return rooms;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    const updateData: any = {};
    if (updateRoomDto.roomNumber) updateData.room_number = updateRoomDto.roomNumber;
    if (updateRoomDto.roomType) updateData.room_type = updateRoomDto.roomType;
    if (updateRoomDto.floor !== undefined) updateData.floor = updateRoomDto.floor;
    if (updateRoomDto.basePrice) updateData.base_price = updateRoomDto.basePrice;
    if (updateRoomDto.maxOccupancy) updateData.max_occupancy = updateRoomDto.maxOccupancy;
    if (updateRoomDto.amenities) updateData.amenities = updateRoomDto.amenities;
    if (updateRoomDto.images) updateData.images = updateRoomDto.images;
    if (updateRoomDto.description) updateData.description = updateRoomDto.description;
    if (updateRoomDto.sizeSqm) updateData.size_sqm = updateRoomDto.sizeSqm;
    if (updateRoomDto.bedType) updateData.bed_type = updateRoomDto.bedType;
    if (updateRoomDto.viewType) updateData.view_type = updateRoomDto.viewType;
    if (updateRoomDto.status) updateData.status = updateRoomDto.status;

    const { data, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update room: ${error.message}`);
    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { error } = await supabase
      .from('rooms')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(`Failed to delete room: ${error.message}`);
    return { message: 'Room deleted successfully' };
  }

  async getRoomStats(branchId: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('rooms')
      .select('status, room_type')
      .eq('branch_id', branchId);

    if (error) throw new Error(`Failed to get room stats: ${error.message}`);

    const stats = {
      total: data.length,
      active: data.filter(r => r.status === 'active').length,
      occupied: data.filter(r => r.status === 'occupied').length,
      maintenance: data.filter(r => r.status === 'maintenance').length,
      byType: data.reduce((acc, room) => {
        acc[room.room_type] = (acc[room.room_type] || 0) + 1;
        return acc;
      }, {}),
    };

    return stats;
  }
}
