import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateContactMessageDto, UpdateContactMessageDto } from '../common/dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDto: CreateContactMessageDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        branch_id: createDto.branchId,
        full_name: createDto.fullName,
        email: createDto.email,
        phone: createDto.phone,
        subject: createDto.subject,
        message: createDto.message,
        preferred_contact_method: createDto.preferredContactMethod ?? 'any',
        status: 'new',
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(`Failed to submit contact message: ${error.message}`);
    return data;
  }

  async findAll(branchId?: string, status?: string) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase
      .from('contact_messages')
      .select('*, branches(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (branchId) query = query.eq('branch_id', branchId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) throw new BadRequestException(`Failed to fetch contact messages: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*, branches(name, code)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Contact message not found: ${error?.message || id}`);
    }

    return data;
  }

  async update(id: string, updateDto: UpdateContactMessageDto) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (updateDto.status) {
      updateData.status = updateDto.status;
      if (updateDto.status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
      }
    }
    if (updateDto.internalNote) updateData.internal_note = updateDto.internalNote;
    if (updateDto.response) {
      updateData.response = updateDto.response;
      updateData.responded_at = new Date().toISOString();
    }
    if (updateDto.assignedTo) updateData.assigned_to = updateDto.assignedTo;
    if (updateDto.isActive !== undefined) updateData.is_active = updateDto.isActive;

    const { data, error } = await supabase
      .from('contact_messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to update contact message: ${error?.message || id}`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase
      .from('contact_messages')
      .update({
        is_active: false,
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new BadRequestException(`Failed to delete contact message: ${error.message}`);
    return { message: 'Contact message deleted successfully' };
  }
}
