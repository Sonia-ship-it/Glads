import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTeamMemberDto, UpdateTeamMemberDto } from '../common/dto/team.dto';

@Injectable()
export class TeamService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(branchId: string, createDto: CreateTeamMemberDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('team_members')
      .insert({
        branch_id: branchId,
        full_name: createDto.fullName,
        position: createDto.position,
        department: createDto.department,
        bio: createDto.bio,
        photo_url: createDto.photoUrl,
        email: createDto.email,
        phone: createDto.phone,
        display_order: createDto.displayOrder,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create team member: ${error.message}`);
    return data;
  }

  async findAll(branchId?: string, department?: string) {
    const supabase = this.supabaseService.getAdminClient();

    let query = supabase.from('team_members').select('*, branches(name)').eq('is_active', true);

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    if (department) {
      query = query.eq('department', department);
    }

    const { data, error } = await query.order('display_order');

    if (error) throw new BadRequestException(`Failed to fetch team members: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('team_members')
      .select('*, branches(name, address)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Team member not found: ${error?.message || id}`);
    }
    return data;
  }

  async update(id: string, updateDto: UpdateTeamMemberDto) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = {};
    if (updateDto.fullName) updateData.full_name = updateDto.fullName;
    if (updateDto.position) updateData.position = updateDto.position;
    if (updateDto.department) updateData.department = updateDto.department;
    if (updateDto.bio) updateData.bio = updateDto.bio;
    if (updateDto.photoUrl) updateData.photo_url = updateDto.photoUrl;
    if (updateDto.email) updateData.email = updateDto.email;
    if (updateDto.phone) updateData.phone = updateDto.phone;
    if (updateDto.displayOrder !== undefined) updateData.display_order = updateDto.displayOrder;
    if (updateDto.isActive !== undefined) updateData.is_active = updateDto.isActive;

    const { data, error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to update team member: ${error?.message || id}`);
    }
    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase.from('team_members').update({ is_active: false }).eq('id', id);

    if (error) throw new Error(`Failed to delete team member: ${error.message}`);
    return { message: 'Team member deleted successfully' };
  }
}
