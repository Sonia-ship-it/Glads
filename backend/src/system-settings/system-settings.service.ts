import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import {
  CreateSystemSettingDto,
  UpdateSystemSettingDto,
} from '../common/dto/system-setting.dto';

@Injectable()
export class SystemSettingsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDto: CreateSystemSettingDto) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('system_settings')
      .insert({
        key: createDto.key,
        value: createDto.value,
        description: createDto.description,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create system setting: ${error.message}`);
    return data;
  }

  async findAll() {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .order('key', { ascending: true });

    if (error) throw new Error(`Failed to fetch system settings: ${error.message}`);
    return data;
  }

  async findByKey(key: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('key', key)
      .single();

    if (error) throw new Error(`System setting not found: ${error.message}`);
    return data;
  }

  async update(key: string, updateDto: UpdateSystemSettingDto) {
    const supabase = this.supabaseService.getAdminClient();

    const updateData: any = {};
    if (updateDto.value !== undefined) updateData.value = updateDto.value;
    if (updateDto.description !== undefined) updateData.description = updateDto.description;

    const { data, error } = await supabase
      .from('system_settings')
      .update(updateData)
      .eq('key', key)
      .select()
      .single();

    if (error) throw new Error(`Failed to update system setting: ${error.message}`);
    return data;
  }

  async remove(key: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('key', key);

    if (error) throw new Error(`Failed to delete system setting: ${error.message}`);
    return { message: 'System setting deleted successfully' };
  }

  async getSettingsAsObject(): Promise<Record<string, any>> {
    const settings = await this.findAll();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  }
}
