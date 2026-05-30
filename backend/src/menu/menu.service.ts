import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMenuDto, UpdateMenuDto } from '../common/dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(private readonly supabaseService: SupabaseService) { }

  async createMenu(createDto: CreateMenuDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('menus')
      .insert({
        branch_id: createDto.branchId,
        name: createDto.name,
        menu_url: createDto.menuUrl,
        effective_date: createDto.effectiveDate,
        description: createDto.description,
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(`Failed to create menu: ${error.message}`);
    return data;
  }

  async getAllMenus(branchId?: string, user?: any) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('menus')
      .select('*, branches(name)')
      .eq('is_active', true)
      .order('effective_date', { ascending: false });

    // Handle role-based filtering
    const userRole = (user?.role || user?.user_metadata?.role || '').toLowerCase();
    const userBranchId = user?.branchId || user?.branch_id || user?.user_metadata?.branchId;

    if (userRole.includes('manager') || userRole.includes('reception') || userRole.includes('staff')) {
      query = query.eq('branch_id', userBranchId);
    } else if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { data, error } = await query;

    if (error) throw new BadRequestException(`Failed to fetch menus: ${error.message}`);
    return data;
  }

  async getMenuById(id: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('menus')
      .select('*, branches(name)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch menu: ${error.message}`);
    return data;
  }

  async updateMenu(id: string, updateDto: UpdateMenuDto) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (updateDto.name) updateData.name = updateDto.name;
    if (updateDto.menuUrl) updateData.menu_url = updateDto.menuUrl;
    if (updateDto.effectiveDate) updateData.effective_date = updateDto.effectiveDate;
    if (updateDto.description) updateData.description = updateDto.description;
    if (updateDto.isActive !== undefined) updateData.is_active = updateDto.isActive;

    const { data, error } = await supabase
      .from('menus')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update menu: ${error.message}`);
    return data;
  }

  async deleteMenu(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase.from('menus').update({ is_active: false }).eq('id', id);

    if (error) throw new Error(`Failed to delete menu: ${error.message}`);
    return { message: 'Menu deleted successfully' };
  }
}
