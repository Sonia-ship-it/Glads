import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('System Settings Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let actorUserId: string | undefined;

  const timestamp = Date.now();
  const actorEmail = `settings-actor-${timestamp}@glads.test`;
  const settingKey = `setting_test_${timestamp}`;

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

    await supabase.getAdminClient().from('users').insert({
      id: actorUserId,
      email: actorEmail,
      full_name: 'System Settings Admin',
      role: 'super-admin',
      is_active: true,
    });
  });

  afterAll(async () => {
    await supabase.getAdminClient().from('system_settings').delete().eq('key', settingKey);

    if (actorUserId) {
      await supabase.getAdminClient().auth.admin.deleteUser(actorUserId);
    }

    await app.close();
  });

  it('should create a system setting', async () => {
    const response = await request(app.getHttpServer())
      .post('/system-settings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        key: settingKey,
        value: { enabled: true, threshold: 5 },
        description: 'Test setting',
      })
      .expect(201);

    expect(response.body.key).toBe(settingKey);
    expect(response.body.value.enabled).toBe(true);
  });

  it('should list settings', async () => {
    const response = await request(app.getHttpServer())
      .get('/system-settings')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((s: any) => s.key === settingKey)).toBe(true);
  });

  it('should return settings as object', async () => {
    const response = await request(app.getHttpServer())
      .get('/system-settings/as-object')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty(settingKey);
  });

  it('should get setting by key', async () => {
    const response = await request(app.getHttpServer())
      .get(`/system-settings/${settingKey}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.key).toBe(settingKey);
  });

  it('should update setting', async () => {
    const response = await request(app.getHttpServer())
      .put(`/system-settings/${settingKey}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ value: { enabled: false, threshold: 10 }, description: 'Updated' })
      .expect(200);

    expect(response.body.value.enabled).toBe(false);
    expect(response.body.value.threshold).toBe(10);
  });

  it('should delete setting', async () => {
    await request(app.getHttpServer())
      .delete(`/system-settings/${settingKey}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const { data } = await supabase
      .getAdminClient()
      .from('system_settings')
      .select('key')
      .eq('key', settingKey);

    expect(data?.length || 0).toBe(0);
  });
});
