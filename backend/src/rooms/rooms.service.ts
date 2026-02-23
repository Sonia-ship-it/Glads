import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateRoomDto, UpdateRoomDto, SearchAvailableRoomsDto } from '../common/dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private normalizeRoomStatus(status?: string): string | undefined {
    if (!status) return undefined;

    const normalized = status.toLowerCase();
    if (normalized === 'active') return 'available';
    if (normalized === 'inactive') return 'blocked';
    return normalized;
  }

  async create(branchId: string, createRoomDto: CreateRoomDto, user: any) {
    // Branch managers can only create rooms for their own branch
    const userRole = user.role || user.user_metadata?.role;
    const userBranchId = user.branchId || user.branch_id || user.user_metadata?.branchId;

    if (userRole === 'branch-manager' && branchId !== userBranchId) {
      throw new Error('Forbidden: Branch managers can only create rooms for their assigned branch');
    }

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
        status: 'available',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create room: ${error.message}`);
    return data;
  }

  async findAll(branchId?: string, user?: any) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('rooms')
      .select('*, branches(name, coordinates)')
      .eq('is_active', true);

    const userRole = user?.role || user?.user_metadata?.role;
    const userBranchId = user?.branchId || user?.branch_id || user?.user_metadata?.branchId;

    if (userRole === 'branch-manager' || userRole === 'receptionist') {
      query = query.eq('branch_id', userBranchId);
    } else if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query.order('room_number', { ascending: true });

    if (error) throw new Error(`Failed to fetch rooms: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('rooms')
      .select('*, branches(name, coordinates, address)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Room not found: ${error?.message || id}`);
    return data;
  }

  async searchAvailable(searchDto: SearchAvailableRoomsDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Get all rooms matching criteria
    let query = supabase
      .from('rooms')
      .select('*, branches(name, coordinates)')
      .eq('is_active', true)
      .eq('status', 'available');

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
          .in('status', ['confirmed', 'checked-in', 'checked_in'])
          .or(
            `and(check_in_date.lte.${searchDto.checkOut},check_out_date.gte.${searchDto.checkIn})`,
          );

        if (bookingsError) continue;

        if (bookings.length === 0) {
          availableRooms.push(room);
        }
      }

      return availableRooms;
    }

    return rooms;
  }

  async update(id: string, updateRoomDto: UpdateRoomDto, user: any) {
    const supabase = this.supabaseService.getAdminClient();

    // Check permissions
    const { data: existingRoom } = await supabase
      .from('rooms')
      .select('branch_id')
      .eq('id', id)
      .single();
    if (existingRoom) {
      const userRole = user.role || user.user_metadata?.role;
      const userBranchId = user.branchId || user.branch_id || user.user_metadata?.branchId;
      if (
        (userRole === 'branch-manager' || userRole === 'receptionist') &&
        existingRoom.branch_id !== userBranchId
      ) {
        throw new Error('Forbidden: You can only update rooms in your assigned branch');
      }
    }

    const updateData: any = {};
    if (updateRoomDto.roomNumber) updateData.room_number = updateRoomDto.roomNumber;
    if (updateRoomDto.roomType) updateData.room_type = updateRoomDto.roomType;
    if ((updateRoomDto as any).name) updateData.name = (updateRoomDto as any).name;
    if (updateRoomDto.floor !== undefined) updateData.floor = updateRoomDto.floor;
    if (updateRoomDto.basePrice !== undefined) updateData.base_price = updateRoomDto.basePrice;
    if (updateRoomDto.maxOccupancy !== undefined)
      updateData.max_occupancy = updateRoomDto.maxOccupancy;
    if (updateRoomDto.amenities) updateData.amenities = updateRoomDto.amenities;
    if (updateRoomDto.images) updateData.images = updateRoomDto.images;
    if (updateRoomDto.description) updateData.description = updateRoomDto.description;
    if (updateRoomDto.sizeSqm !== undefined) updateData.size_sqm = updateRoomDto.sizeSqm;
    if (updateRoomDto.bedType) updateData.bed_type = updateRoomDto.bedType;
    if (updateRoomDto.viewType) updateData.view_type = updateRoomDto.viewType;

    const normalizedStatus = this.normalizeRoomStatus(updateRoomDto.status);
    if (normalizedStatus) updateData.status = normalizedStatus;

    const { data, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data)
      throw new NotFoundException(`Failed to update room: ${error?.message || id}`);
    return data;
  }

  async remove(id: string, user: any) {
    const supabase = this.supabaseService.getAdminClient();

    // Check permissions
    const { data: existingRoom } = await supabase
      .from('rooms')
      .select('branch_id')
      .eq('id', id)
      .single();
    if (existingRoom) {
      const userRole = user.role || user.user_metadata?.role;
      const userBranchId = user.branchId || user.branch_id || user.user_metadata?.branchId;
      if (userRole === 'branch-manager' && existingRoom.branch_id !== userBranchId) {
        throw new Error('Forbidden: You can only delete rooms in your assigned branch');
      }
    }

    const { error } = await supabase
      .from('rooms')
      .update({ is_active: false, status: 'blocked' })
      .eq('id', id);

    if (error) throw new Error(`Failed to delete room: ${error.message}`);
    return { message: 'Room deleted successfully' };
  }

  async getRoomStats(branchId: string, user: any) {
    const userRole = user.role || user.user_metadata?.role;
    const userBranchId = user.branchId || user.branch_id || user.user_metadata?.branchId;

    if (
      (userRole === 'branch-manager' || userRole === 'receptionist') &&
      branchId !== userBranchId
    ) {
      throw new Error('Forbidden: You can only view stats for your assigned branch');
    }

    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('rooms')
      .select('status, room_type')
      .eq('branch_id', branchId)
      .eq('is_active', true);

    if (error) throw new Error(`Failed to get room stats: ${error.message}`);

    const stats = {
      total: data.length,
      available: data.filter((r) => r.status === 'available').length,
      occupied: data.filter((r) => r.status === 'occupied').length,
      maintenance: data.filter((r) => r.status === 'maintenance').length,
      blocked: data.filter((r) => r.status === 'blocked').length,
      byType: data.reduce((acc, room) => {
        acc[room.room_type] = (acc[room.room_type] || 0) + 1;
        return acc;
      }, {}),
    };

    return stats;
  }
}
