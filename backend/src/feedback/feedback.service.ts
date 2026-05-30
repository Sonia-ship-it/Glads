import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateFeedbackDto, UpdateFeedbackDto } from '../common/dto/feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async create(createDto: CreateFeedbackDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        branch_id: createDto.branchId,
        full_name: createDto.fullName,
        email: createDto.email,
        phone: createDto.phone,
        category: createDto.category ?? 'other',
        rating: createDto.rating,
        subject: createDto.subject,
        message: createDto.message,
        metadata: createDto.metadata ?? {},
        status: 'new',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(`Failed to submit feedback: ${error.message}`);
    return data;
  }

  async findAll(branchId?: string, category?: string, status?: string, user?: any) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('feedback')
      .select('*, branches(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Handle role-based filtering
    const userRole = (user?.role || user?.user_metadata?.role || '').toLowerCase();
    const userBranchId = user?.branchId || user?.branch_id || user?.user_metadata?.branchId;

    if (userRole.includes('manager') || userRole.includes('reception') || userRole.includes('staff')) {
      // Staff only see feedback from their own branch
      query = query.eq('branch_id', userBranchId);
    } else if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    if (category) query = query.eq('category', category);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) throw new BadRequestException(`Failed to fetch feedback: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('feedback')
      .select('*, branches(name, code)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Feedback not found: ${error?.message || id}`);
    }

    return data;
  }

  async update(id: string, updateDto: UpdateFeedbackDto) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (updateDto.status) {
      updateData.status = updateDto.status;
      if (updateDto.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
    }
    if (updateDto.response) {
      updateData.response = updateDto.response;
      updateData.responded_at = new Date().toISOString();
    }
    if (updateDto.isActive !== undefined) updateData.is_active = updateDto.isActive;

    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to update feedback: ${error?.message || id}`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase
      .from('feedback')
      .update({
        is_active: false,
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new BadRequestException(`Failed to delete feedback: ${error.message}`);
    return { message: 'Feedback deleted successfully' };
  }
}
