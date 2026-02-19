import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Users Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let actorUserId: string | undefined;
  let createdUserId: string | undefined;
  let testBranchId: string;

  const timestamp = Date.now();
  const actorEmail = `users-actor-${timestamp}@glads.test`;
  const createdEmail = `users-created-${timestamp}@glads.test`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    supabase = moduleFixture.get<SupabaseService>(SupabaseService);

    const { data: branch, error: branchError } = await supabase
      .getAdminClient()
      .from('branches')
      .insert({
        name: 'Test Branch for Users',
        code: `TEST-USERS-${timestamp}`,
        address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788004444', email: 'users@test.rw' },
        settings: { currency: 'RWF', timezone: 'Africa/Kigali' },
      })
      .select()
      .single();

    if (branchError || !branch) {
      throw new Error(`Failed to create branch: ${branchError?.message}`);
    }

    testBranchId = branch.id;

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
      full_name: 'Users Admin Actor',
      role: 'super-admin',
      branch_id: testBranchId,
      is_active: true,
    });
  });

  afterAll(async () => {
    if (createdUserId) {
      await supabase.getAdminClient().auth.admin.deleteUser(createdUserId);
    }

    if (actorUserId) {
      await supabase.getAdminClient().auth.admin.deleteUser(actorUserId);
    }

    if (testBranchId) {
      await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
    }

    await app.close();
  });

  it('should create a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        email: createdEmail,
        password: 'TestPass123!',
        fullName: 'Created Staff User',
        phone: '+250788000111',
        role: 'receptionist',
        branchId: testBranchId,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe(createdEmail);
    expect(response.body.role).toBe('receptionist');
    createdUserId = response.body.id;
  });

  it('should list users and support role filter', async () => {
    const response = await request(app.getHttpServer())
      .get('/users?role=receptionist')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((user: any) => user.id === createdUserId)).toBe(true);
  });

  it('should get a user by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.id).toBe(createdUserId);
  });

  it('should update a user', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/${createdUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ phone: '+250788000222' })
      .expect(200);

    expect(response.body.phone).toBe('+250788000222');
  });

  it('should change user role', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/change-role')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        userId: createdUserId,
        newRole: 'branch-manager',
      })
      .expect(201);

    expect(response.body.role).toBe('branch-manager');
  });

  it('should deactivate and activate user', async () => {
    const deactivateRes = await request(app.getHttpServer())
      .delete(`/users/${createdUserId}/deactivate`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(deactivateRes.body.is_active).toBe(false);

    const activateRes = await request(app.getHttpServer())
      .post(`/users/${createdUserId}/activate`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(201);
    expect(activateRes.body.is_active).toBe(true);
  });
});
