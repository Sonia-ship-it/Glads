import { Module } from '@nestjs/common';
import { RoomAvailabilityController } from './room-availability.controller';
import { RoomAvailabilityService } from './room-availability.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [RoomAvailabilityController],
  providers: [RoomAvailabilityService],
  exports: [RoomAvailabilityService],
})
export class RoomAvailabilityModule {}
