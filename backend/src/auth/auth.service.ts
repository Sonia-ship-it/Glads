import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto, RegisterStaffDto, UpdateProfileDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}

  async login(loginDto: LoginDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error || !data?.session?.access_token || !data?.user?.id) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const profile = await this.validateUser(data.user.id);
    if (!profile) {
      throw new UnauthorizedException('User profile not found');
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      token_type: data.session.token_type || 'bearer',
      expires_in: data.session.expires_in,
      user: profile,
    };
  }

  async getCurrentUser(userId: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('*, branches(name, code)')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async validateUser(userId: string) {
    try {
      const user = await this.getCurrentUser(userId);
      return user;
    } catch (error) {
      return null;
    }
  }

  async registerStaff(registerDto: RegisterStaffDto, currentUserId: string) {
    // Check if current user has permission to create staff
    const currentUser = await this.getCurrentUser(currentUserId);
    if (!['super-admin', 'super-manager', 'branch-manager'].includes(currentUser.role)) {
      throw new ForbiddenException('Insufficient permissions to create staff accounts');
    }

    // Branch managers can only create staff in their own branch
    if (
      currentUser.role === 'branch-manager' &&
      registerDto.branchId &&
      registerDto.branchId !== currentUser.branch_id
    ) {
      throw new ForbiddenException('Branch managers can only create staff in their own branch');
    }

    const supabase = this.supabaseService.getAdminClient();

    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: registerDto.email,
      password: registerDto.password,
      email_confirm: true,
    });

    if (authError) {
      throw new BadRequestException(`Failed to create auth user: ${authError.message}`);
    }

    // Create user profile in users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        email: registerDto.email,
        full_name: `${registerDto.firstName} ${registerDto.lastName}`,
        phone: registerDto.phone,
        role: registerDto.role,
        branch_id: registerDto.branchId,
        is_active: true,
        email_verified: true,
      })
      .select()
      .single();

    if (profileError) {
      // Cleanup: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      throw new BadRequestException(`Failed to create user profile: ${profileError.message}`);
    }

    return {
      id: userProfile.id,
      email: userProfile.email,
      full_name: userProfile.full_name,
      role: userProfile.role,
      branch_id: userProfile.branch_id,
      created_at: userProfile.created_at,
    };
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = {};

    if (updateDto.firstName || updateDto.lastName) {
      // Get current user to merge names
      const currentUser = await this.getCurrentUser(userId);
      const currentNames = currentUser.full_name.split(' ');
      const firstName = updateDto.firstName || currentNames[0] || '';
      const lastName = updateDto.lastName || currentNames[1] || '';
      updateData.full_name = `${firstName} ${lastName}`.trim();
    }

    if (updateDto.phone !== undefined) {
      updateData.phone = updateDto.phone;
    }

    if (updateDto.profilePicture !== undefined) {
      updateData.profile_picture = updateDto.profilePicture;
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Failed to update profile: ${error.message}`);
    }

    return data;
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const supabase = this.supabaseService.getAdminClient();

    // Verify current password by attempting to sign in
    const { data: user } = await this.getCurrentUser(userId);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: changePasswordDto.currentPassword,
    });

    if (signInError) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
      password: changePasswordDto.newPassword,
    });

    if (updateError) {
      throw new BadRequestException(`Failed to change password: ${updateError.message}`);
    }

    return {
      message: 'Password changed successfully',
      updated_at: new Date().toISOString(),
    };
  }
}
