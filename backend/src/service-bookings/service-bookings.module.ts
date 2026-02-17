import { Module } from '@nestjs/common';
import { ServiceBookingsService } from './service-bookings.service';
import { ServiceBookingsController } from './service-bookings.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ServiceBookingsController],
  providers: [ServiceBookingsService],
  exports: [ServiceBookingsService],
})
export class ServiceBookingsModule {}
