import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { BranchesModule } from './branches/branches.module';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { ServicesModule } from './services/services.module';
import { ServiceBookingsModule } from './service-bookings/service-bookings.module';
import { MenuModule } from './menu/menu.module';
import { NewsModule } from './news/news.module';
import { TeamModule } from './team/team.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentsModule } from './payments/payments.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';
import { RoomAvailabilityModule } from './room-availability/room-availability.module';
import { GymSubscriptionsModule } from './gym-subscriptions/gym-subscriptions.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { SystemSettingsModule } from './system-settings/system-settings.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    SupabaseModule,
    AuthModule,
    BranchesModule,
    RoomsModule,
    RoomAvailabilityModule,
    BookingsModule,
    ServicesModule,
    ServiceBookingsModule,
    GymSubscriptionsModule,
    MenuModule,
    NewsModule,
    TeamModule,
    NotificationsModule,
    PaymentsModule,
    AnalyticsModule,
    AuditLogsModule,
    SystemSettingsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
