import { Module } from '@nestjs/common';
import { GymSubscriptionsController } from './gym-subscriptions.controller';
import { GymSubscriptionsService } from './gym-subscriptions.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [GymSubscriptionsController],
  providers: [GymSubscriptionsService],
  exports: [GymSubscriptionsService],
})
export class GymSubscriptionsModule {}
