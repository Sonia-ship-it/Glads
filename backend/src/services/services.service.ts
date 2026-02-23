import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
} from '../common/dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly supabaseService: SupabaseService) { }

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
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase.from('services').select('*, branches(name)').eq('is_active', true);

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
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('services')
      .select('*, branches(name, address, contact_info)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Service not found: ${error?.message || id}`);
    }
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
    if (updateServiceDto.subscriptionPeriod)
      updateData.subscription_period = updateServiceDto.subscriptionPeriod;
    if (updateServiceDto.durationMinutes !== undefined)
      updateData.duration = updateServiceDto.durationMinutes;
    if (updateServiceDto.maxCapacity !== undefined)
      updateData.max_bookings_per_slot = updateServiceDto.maxCapacity;
    if (updateServiceDto.availableTimes)
      updateData.availability_schedule = updateServiceDto.availableTimes;
    if (updateServiceDto.images) updateData.images = updateServiceDto.images;
    if (updateServiceDto.isActive !== undefined) updateData.is_active = updateServiceDto.isActive;

    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to update service: ${error?.message || id}`);
    }
    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase.from('services').update({ is_active: false }).eq('id', id);

    if (error) throw new Error(`Failed to delete service: ${error.message}`);
    return { message: 'Service deleted successfully' };
  }
}
