import { Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';
import { SpecialOffersController } from './special-offers.controller';
import { SpecialOffersService } from './special-offers.service';

@Module({
  imports: [SupabaseModule],
  controllers: [SpecialOffersController],
  providers: [SpecialOffersService],
  exports: [SpecialOffersService],
})
export class SpecialOffersModule {}
