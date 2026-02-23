import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTestimonialDto, UpdateTestimonialDto } from '../common/dto/testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(branchId: string, createDto: CreateTestimonialDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('testimonials')
      .insert({
        branch_id: branchId,
        guest_name: createDto.guestName,
        guest_role: createDto.guestRole,
        quote: createDto.quote,
        rating: createDto.rating ?? 5,
        source: createDto.source ?? 'website',
        avatar_url: createDto.avatarUrl,
        is_featured: createDto.isFeatured ?? false,
        display_order: createDto.displayOrder ?? 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(`Failed to create testimonial: ${error.message}`);
    return data;
  }

  async findAll(branchId?: string, featured?: boolean) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('testimonials')
      .select('*, branches(name)')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (branchId) query = query.eq('branch_id', branchId);
    if (featured !== undefined) query = query.eq('is_featured', featured);

    const { data, error } = await query;

    if (error) throw new BadRequestException(`Failed to fetch testimonials: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('testimonials')
      .select('*, branches(name, code)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Testimonial not found: ${error?.message || id}`);
    }

    return data;
  }

  async update(id: string, updateDto: UpdateTestimonialDto) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (updateDto.guestName) updateData.guest_name = updateDto.guestName;
    if (updateDto.guestRole) updateData.guest_role = updateDto.guestRole;
    if (updateDto.quote) updateData.quote = updateDto.quote;
    if (updateDto.rating !== undefined) updateData.rating = updateDto.rating;
    if (updateDto.source) updateData.source = updateDto.source;
    if (updateDto.avatarUrl) updateData.avatar_url = updateDto.avatarUrl;
    if (updateDto.isFeatured !== undefined) updateData.is_featured = updateDto.isFeatured;
    if (updateDto.displayOrder !== undefined) updateData.display_order = updateDto.displayOrder;
    if (updateDto.isActive !== undefined) updateData.is_active = updateDto.isActive;

    const { data, error } = await supabase
      .from('testimonials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to update testimonial: ${error?.message || id}`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase
      .from('testimonials')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new BadRequestException(`Failed to delete testimonial: ${error.message}`);
    return { message: 'Testimonial deleted successfully' };
  }
}
