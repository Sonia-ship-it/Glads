import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSpecialOfferDto, UpdateSpecialOfferDto } from '../common/dto/special-offer.dto';

@Injectable()
export class SpecialOffersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createDto: CreateSpecialOfferDto) {
    const supabase = this.supabaseService.getAdminClient();

    this.validateOfferWindow(createDto.validFrom, createDto.validTo);

    const scope = createDto.scope ?? (createDto.branchId ? 'branch-specific' : 'global');
    if (scope === 'branch-specific' && !createDto.branchId) {
      throw new BadRequestException('branchId is required for branch-specific offers');
    }

    const { data, error } = await supabase
      .from('special_offers')
      .insert({
        branch_id: scope === 'global' ? null : createDto.branchId,
        scope,
        title: createDto.title,
        description: createDto.description,
        cta_text: createDto.ctaText,
        cta_link: createDto.ctaLink,
        promo_code: createDto.promoCode,
        discount_percentage: createDto.discountPercentage,
        discount_amount: createDto.discountAmount,
        currency: createDto.currency ?? 'RWF',
        valid_from: createDto.validFrom,
        valid_to: createDto.validTo,
        terms_and_conditions: createDto.termsAndConditions,
        image_url: createDto.imageUrl,
        is_featured: createDto.isFeatured ?? false,
        status: createDto.status ?? this.resolveStatus(createDto.validFrom, createDto.validTo, true),
        is_active: true,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(`Failed to create special offer: ${error.message}`);
    return data;
  }

  async findAll(branchId?: string, featured?: boolean, activeOnly = true) {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('special_offers')
      .select('*, branches(name)')
      .order('valid_from', { ascending: false });

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }
    if (featured !== undefined) {
      query = query.eq('is_featured', featured);
    }
    if (activeOnly) {
      query = query.eq('is_active', true).eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) throw new BadRequestException(`Failed to fetch special offers: ${error.message}`);

    if (!activeOnly) return data;

    const now = new Date();
    return (data || []).filter((offer: any) => {
      const from = new Date(offer.valid_from);
      const to = offer.valid_to ? new Date(offer.valid_to) : null;
      return from <= now && (!to || to >= now);
    });
  }

  async findOne(id: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('special_offers')
      .select('*, branches(name, code)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Special offer not found: ${error?.message || id}`);
    }

    return data;
  }

  async update(id: string, updateDto: UpdateSpecialOfferDto) {
    const supabase = this.supabaseService.getAdminClient();

    if (updateDto.validFrom || updateDto.validTo) {
      this.validateOfferWindow(updateDto.validFrom, updateDto.validTo);
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (updateDto.title) updateData.title = updateDto.title;
    if (updateDto.description) updateData.description = updateDto.description;
    if (updateDto.ctaText) updateData.cta_text = updateDto.ctaText;
    if (updateDto.ctaLink) updateData.cta_link = updateDto.ctaLink;
    if (updateDto.promoCode) updateData.promo_code = updateDto.promoCode;
    if (updateDto.discountPercentage !== undefined)
      updateData.discount_percentage = updateDto.discountPercentage;
    if (updateDto.discountAmount !== undefined) updateData.discount_amount = updateDto.discountAmount;
    if (updateDto.currency) updateData.currency = updateDto.currency;
    if (updateDto.validFrom) updateData.valid_from = updateDto.validFrom;
    if (updateDto.validTo !== undefined) updateData.valid_to = updateDto.validTo;
    if (updateDto.termsAndConditions) updateData.terms_and_conditions = updateDto.termsAndConditions;
    if (updateDto.imageUrl) updateData.image_url = updateDto.imageUrl;
    if (updateDto.isFeatured !== undefined) updateData.is_featured = updateDto.isFeatured;
    if (updateDto.status) updateData.status = updateDto.status;
    if (updateDto.isActive !== undefined) updateData.is_active = updateDto.isActive;

    const { data, error } = await supabase
      .from('special_offers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to update special offer: ${error?.message || id}`);
    }

    return data;
  }

  async remove(id: string) {
    const supabase = this.supabaseService.getAdminClient();

    const { error } = await supabase
      .from('special_offers')
      .update({
        is_active: false,
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new BadRequestException(`Failed to delete special offer: ${error.message}`);
    return { message: 'Special offer deleted successfully' };
  }

  private validateOfferWindow(validFrom?: string, validTo?: string) {
    if (!validFrom || !validTo) return;

    const start = new Date(validFrom);
    const end = new Date(validTo);
    if (start > end) {
      throw new BadRequestException('validFrom must be before validTo');
    }
  }

  private resolveStatus(validFrom: string, validTo?: string, isActive = true) {
    if (!isActive) return 'inactive';

    const now = new Date();
    const from = new Date(validFrom);
    const to = validTo ? new Date(validTo) : null;

    if (to && to < now) return 'expired';
    if (from <= now) return 'active';
    return 'draft';
  }
}
