import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateNewsDto, UpdateNewsDto } from '../common/dto/news.dto';

@Injectable()
export class NewsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDto: CreateNewsDto) {
    const supabase = this.supabaseService.getAdminClient();

    if (createDto.scope === 'branch-specific' && !createDto.branchId) {
      throw new BadRequestException('branchId is required for branch-specific news');
    }
    
    const { data, error } = await supabase
      .from('news')
      .insert({
        title: createDto.title,
        content: createDto.content,
        excerpt: createDto.excerpt,
        author_id: createDto.authorId,
        category: createDto.category,
        featured_image: createDto.imageUrl ? { url: createDto.imageUrl } : null,
        scope: createDto.scope,
        branch_id: createDto.branchId,
        target_audience: createDto.targetAudience,
        status: 'published',
        published_at: createDto.publishedDate || new Date().toISOString(),
        expires_at: createDto.expiresAt,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(`Failed to create news: ${error.message}`);
    return data;
  }

  async findAll(scope?: string, category?: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    let query = supabase
      .from('news')
      .select('*')
      .eq('status', 'published');

    if (scope) {
      query = query.eq('scope', scope);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('published_at', { ascending: false });

    if (error) throw new BadRequestException(`Failed to fetch news: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`News not found: ${error?.message || id}`);

    // Increment view count
    await supabase.rpc('increment_news_views', { news_id: id });

    return data;
  }

  async update(id: string, updateDto: UpdateNewsDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    const updateData: any = {};
    if (updateDto.title) updateData.title = updateDto.title;
    if (updateDto.content) updateData.content = updateDto.content;
    if (updateDto.excerpt) updateData.excerpt = updateDto.excerpt;
    if (updateDto.category) updateData.category = updateDto.category;
    if (updateDto.imageUrl) updateData.featured_image = { url: updateDto.imageUrl };
    if (updateDto.scope) updateData.scope = updateDto.scope;
    if (updateDto.targetAudience) updateData.target_audience = updateDto.targetAudience;
    if (updateDto.isPublished !== undefined) {
      updateData.status = updateDto.isPublished ? 'published' : 'unpublished';
      if (updateDto.isPublished) {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (updateDto.isPinned !== undefined) updateData.is_pinned = updateDto.isPinned;

    const { data, error } = await supabase
      .from('news')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to update news: ${error?.message || id}`);
    }
    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { error } = await supabase
      .from('news')
      .update({ status: 'unpublished' })
      .eq('id', id);

    if (error) throw new BadRequestException(`Failed to delete news: ${error.message}`);
    return { message: 'News deleted successfully' };
  }
}
