import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto, UpdateUserDto, ChangeUserRoleDto } from '../common/dto/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDto: CreateUserDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: createDto.email,
      password: createDto.password,
      email_confirm: true,
      user_metadata: {
        full_name: createDto.fullName,
        role: createDto.role,
      },
    });

    if (authError) throw new Error(`Failed to create user: ${authError.message}`);

    // Create user profile in users table
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: createDto.email,
        full_name: createDto.fullName,
        phone: createDto.phone,
        role: createDto.role,
        branch_id: createDto.branchId,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create user profile: ${error.message}`);
    return data;
  }

  async findAll(role?: string, branchId?: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    let query = supabase
      .from('users')
      .select('*, branches(name)')
      .eq('is_active', true);

    if (role) {
      query = query.eq('role', role);
    }
    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch users: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('users')
      .select('*, branches(name, address)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`User not found: ${error.message}`);
    return data;
  }

  async update(id: string, updateDto: UpdateUserDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    const updateData: any = {};
    if (updateDto.fullName) updateData.full_name = updateDto.fullName;
    if (updateDto.phone) updateData.phone = updateDto.phone;
    if (updateDto.profilePicture) updateData.profile_picture = updateDto.profilePicture;
    if (updateDto.branchId) updateData.branch_id = updateDto.branchId;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    return data;
  }

  async changeRole(changeRoleDto: ChangeUserRoleDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('users')
      .update({ role: changeRoleDto.newRole })
      .eq('id', changeRoleDto.userId)
      .select()
      .single();

    if (error) throw new Error(`Failed to change user role: ${error.message}`);

    // Update user metadata in Supabase Auth
    await supabase.auth.admin.updateUserById(changeRoleDto.userId, {
      user_metadata: { role: changeRoleDto.newRole },
    });

    return data;
  }

  async deactivate(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to deactivate user: ${error.message}`);
    return data;
  }

  async activate(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to activate user: ${error.message}`);
    return data;
  }
}

