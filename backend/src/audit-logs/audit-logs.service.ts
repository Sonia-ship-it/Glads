import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { QueryAuditLogsDto } from '../common/dto/audit-log.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(queryDto: QueryAuditLogsDto) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (queryDto.userId) {
      query = query.eq('user_id', queryDto.userId);
    }

    if (queryDto.entityType) {
      query = query.eq('entity_type', queryDto.entityType);
    }

    if (queryDto.entityId) {
      query = query.eq('entity_id', queryDto.entityId);
    }

    if (queryDto.action) {
      query = query.eq('action', queryDto.action);
    }

    if (queryDto.fromDate) {
      query = query.gte('created_at', queryDto.fromDate);
    }

    if (queryDto.toDate) {
      query = query.lte('created_at', queryDto.toDate);
    }

    if (queryDto.limit) {
      query = query.limit(queryDto.limit);
    } else {
      query = query.limit(100);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Audit log not found: ${error.message}`);
    return data;
  }

  async findByEntity(entityType: string, entityId: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch entity audit logs: ${error.message}`);
    return data;
  }

  async create(logData: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const supabase = this.supabaseService.getAdminClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: logData.userId,
        action: logData.action,
        entity_type: logData.entityType,
        entity_id: logData.entityId,
        changes: logData.changes,
        ip_address: logData.ipAddress,
        user_agent: logData.userAgent,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create audit log: ${error.message}`);
    return data;
  }
}
