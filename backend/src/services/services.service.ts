import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateServiceDto, UpdateServiceDto, CreateServiceBookingDto } from '../common/dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(branchId: string, createServiceDto: CreateServiceDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('services')
      .insert({
        branch_id: branchId,
        name: createServiceDto.name,
        description: createServiceDto.description,
        category: createServiceDto.category,
        price: createServiceDto.price,
        billing_type: createServiceDto.billingType,
        subscription_period: createServiceDto.subscriptionPeriod,
        duration: createServiceDto.durationMinutes,
        max_bookings_per_slot: createServiceDto.maxCapacity,
        availability_schedule: createServiceDto.availableTimes || [],
        images: createServiceDto.images || [],
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create service: ${error.message}`);
    return data;
  }

  async findAll(branchId?: string, category?: string) {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('services')
      .select('*, branches(name)')
      .eq('is_active', true);

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('name');

    if (error) throw new Error(`Failed to fetch services: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('services')
      .select('*, branches(name, address, contact_info)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Service not found: ${error.message}`);
    return data;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    const updateData: any = {};
    if (updateServiceDto.name) updateData.name = updateServiceDto.name;
    if (updateServiceDto.description) updateData.description = updateServiceDto.description;
    if (updateServiceDto.category) updateData.category = updateServiceDto.category;
    if (updateServiceDto.price !== undefined) updateData.price = updateServiceDto.price;
    if (updateServiceDto.billingType) updateData.billing_type = updateServiceDto.billingType;
    if (updateServiceDto.subscriptionPeriod) updateData.subscription_period = updateServiceDto.subscriptionPeriod;
    if (updateServiceDto.durationMinutes) updateData.duration_minutes = updateServiceDto.durationMinutes;
    if (updateServiceDto.maxCapacity) updateData.max_capacity = updateServiceDto.maxCapacity;
    if (updateServiceDto.availableTimes) updateData.available_times = updateServiceDto.availableTimes;
    if (updateServiceDto.images) updateData.images = updateServiceDto.images;
    if (updateServiceDto.amenities) updateData.amenities = updateServiceDto.amenities;
    if (updateServiceDto.isActive !== undefined) updateData.is_active = updateServiceDto.isActive;

    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update service: ${error.message}`);
    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { error } = await supabase
      .from('services')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw new Error(`Failed to delete service: ${error.message}`);
    return { message: 'Service deleted successfully' };
  }
}
