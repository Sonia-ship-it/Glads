import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateNewsDto, UpdateNewsDto } from '../common/dto/news.dto';

@Injectable()
export class NewsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDto: CreateNewsDto) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { data, error } = await supabase
      .from('news')
      .insert({
        title: createDto.title,
        content: createDto.content,
        excerpt: createDto.excerpt,
        author_id: createDto.authorId,
        category: createDto.category,
        image_url: createDto.imageUrl,
        scope: createDto.scope,
        target_audience: createDto.targetAudience,
        published_date: createDto.publishedDate || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create news: ${error.message}`);
    return data;
  }

  async findAll(scope?: string, category?: string) {
    const supabase = this.supabaseService.getClient();
    
    let query = supabase
      .from('news')
      .select('*, users(full_name, email)')
      .eq('is_published', true);

    if (scope) {
      query = query.eq('scope', scope);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('published_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch news: ${error.message}`);
    return data;
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase
      .from('news')
      .select('*, users(full_name, email)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`News not found: ${error.message}`);

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
    if (updateDto.imageUrl) updateData.image_url = updateDto.imageUrl;
    if (updateDto.scope) updateData.scope = updateDto.scope;
    if (updateDto.targetAudience) updateData.target_audience = updateDto.targetAudience;
    if (updateDto.isPublished !== undefined) updateData.is_published = updateDto.isPublished;

    const { data, error } = await supabase
      .from('news')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update news: ${error.message}`);
    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();
    
    const { error } = await supabase
      .from('news')
      .update({ is_published: false })
      .eq('id', id);

    if (error) throw new Error(`Failed to delete news: ${error.message}`);
    return { message: 'News deleted successfully' };
  }
}
