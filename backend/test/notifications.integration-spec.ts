import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Notifications Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let actorUserId: string | undefined;
  const notificationIds: string[] = [];

  const timestamp = Date.now();
  const actorEmail = `notifications-actor-${timestamp}@glads.test`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    supabase = moduleFixture.get<SupabaseService>(SupabaseService);

    const { data: actorAuth, error: actorAuthError } = await supabase
      .getAdminClient()
      .auth.admin.createUser({
        email: actorEmail,
        password: 'TestPass123!',
        email_confirm: true,
      });

    if (actorAuthError || !actorAuth.user) {
      throw new Error(`Failed to create actor auth user: ${actorAuthError?.message}`);
    }

    actorUserId = actorAuth.user.id;

    const {
      data: { session },
      error: signInError,
    } = await supabase.getClient().auth.signInWithPassword({
      email: actorEmail,
      password: 'TestPass123!',
    });

    if (signInError || !session?.access_token) {
      throw new Error(`Failed to sign in actor: ${signInError?.message}`);
    }

    authToken = session.access_token;

    await supabase
      .getAdminClient()
      .from('users')
      .insert({
        id: actorUserId,
        email: actorEmail,
        full_name: 'Notifications User',
        role: 'super-admin',
        is_active: true,
        notification_preferences: { email: true, inApp: true },
      });

    const { data: seeded, error: seedError } = await supabase
      .getAdminClient()
      .from('notifications')
      .insert([
        {
          recipient_id: actorUserId,
          type: 'system',
          title: 'System Alert',
          message: 'Test system alert',
          priority: 'medium',
          is_read: false,
        },
        {
          recipient_id: actorUserId,
          type: 'booking',
          title: 'Booking Update',
          message: 'Test booking update',
          priority: 'high',
          is_read: false,
        },
      ])
      .select();

    if (seedError || !seeded) {
      throw new Error(`Failed to seed notifications: ${seedError?.message}`);
    }

    seeded.forEach((n: any) => notificationIds.push(n.id));
  });

  afterAll(async () => {
    if (notificationIds.length) {
      await supabase.getAdminClient().from('notifications').delete().in('id', notificationIds);
    }

    if (actorUserId) {
      await supabase.getAdminClient().auth.admin.deleteUser(actorUserId);
    }

    await app.close();
  });

  it('should reject unauthenticated access', async () => {
    await request(app.getHttpServer()).get(`/notifications/user/${actorUserId}`).expect(401);
  });

  it('should get user notifications', async () => {
    const response = await request(app.getHttpServer())
      .get(`/notifications/user/${actorUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should get unread count', async () => {
    const response = await request(app.getHttpServer())
      .get(`/notifications/user/${actorUserId}/unread-count`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.unreadCount).toBeGreaterThanOrEqual(1);
  });

  it('should mark notifications as read', async () => {
    const response = await request(app.getHttpServer())
      .post('/notifications/mark-read')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ notificationIds: [notificationIds[0]] })
      .expect(201);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].is_read).toBe(true);
  });

  it('should mark all notifications as read', async () => {
    const response = await request(app.getHttpServer())
      .post(`/notifications/user/${actorUserId}/mark-all-read`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should update notification preferences', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/notifications/user/${actorUserId}/preferences`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ email: false, inApp: true, categories: ['booking', 'system'] })
      .expect(200);

    expect(response.body.notification_preferences.email).toBe(false);
    expect(response.body.notification_preferences.inApp).toBe(true);
  });
});
