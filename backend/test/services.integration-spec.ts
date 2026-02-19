import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Services Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let testBranchId: string;
  let testServiceId: string;
  let testUserId: string | undefined;

  const timestamp = Date.now();
  const testEmail = `services-test-${timestamp}@glads.test`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    supabase = moduleFixture.get<SupabaseService>(SupabaseService);

    const { data: authData, error: createUserError } = await supabase
      .getAdminClient()
      .auth.admin.createUser({
        email: testEmail,
        password: 'TestPass123!',
        email_confirm: true,
      });

    if (createUserError || !authData.user) {
      throw new Error(`Failed to create test user: ${createUserError?.message}`);
    }

    testUserId = authData.user.id;

    const {
      data: { session },
      error: signInError,
    } = await supabase.getClient().auth.signInWithPassword({
      email: testEmail,
      password: 'TestPass123!',
    });

    if (signInError || !session?.access_token) {
      throw new Error(`Failed to sign in test user: ${signInError?.message}`);
    }

    authToken = session.access_token;

    await supabase.getAdminClient().from('users').insert({
      id: testUserId,
      email: testEmail,
      full_name: 'Services Test Admin',
      role: 'super-admin',
      is_active: true,
    });

    const { data: branch, error: branchError } = await supabase
      .getAdminClient()
      .from('branches')
      .insert({
        name: 'Test Branch for Services',
        code: `TEST-SERV-${timestamp}`,
        address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788000002', email: 'services@test.rw' },
        settings: { currency: 'RWF', timezone: 'Africa/Kigali' },
      })
      .select()
      .single();

    if (branchError || !branch) {
      throw new Error(`Failed to create test branch: ${branchError?.message}`);
    }

    testBranchId = branch.id;
  });

  afterAll(async () => {
    if (testServiceId) {
      await supabase.getAdminClient().from('services').delete().eq('id', testServiceId);
    }

    if (testBranchId) {
      await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
    }

    await supabase.getAdminClient().from('users').delete().eq('email', testEmail);

    if (testUserId) {
      await supabase.getAdminClient().auth.admin.deleteUser(testUserId);
    }

    await app.close();
  });

  describe('POST /services/:branchId', () => {
    it('should create a spa service', async () => {
      const serviceData = {
        branchId: testBranchId,
        name: 'Relaxation Massage',
        description: '60-minute full body relaxation massage',
        category: 'spa',
        price: 50000,
        billingType: 'one-time',
        durationMinutes: 60,
        images: ['https://example.com/massage.jpg'],
      };

      const response = await request(app.getHttpServer())
        .post(`/services/${testBranchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(serviceData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(serviceData.name);
      expect(response.body.category).toBe('spa');
      expect(response.body.is_active).toBe(true);

      testServiceId = response.body.id;
    });

    it('should create a gym subscription service', async () => {
      const gymService = {
        branchId: testBranchId,
        name: 'Monthly Gym Membership',
        description: 'Full access to gym facilities',
        category: 'gym',
        price: 30000,
        billingType: 'subscription',
        subscriptionPeriod: 'monthly',
        availableTimes: ['06:00-22:00'],
      };

      const response = await request(app.getHttpServer())
        .post(`/services/${testBranchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(gymService)
        .expect(201);

      expect(response.body.billing_type).toBe('subscription');
      expect(response.body.subscription_period).toBe('monthly');

      await supabase.getAdminClient().from('services').delete().eq('id', response.body.id);
    });
  });

  describe('GET /services', () => {
    it('should return list of active services', async () => {
      const response = await request(app.getHttpServer()).get('/services').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((service: any) => service.id === testServiceId)).toBe(true);
    });

    it('should filter services by category', async () => {
      const response = await request(app.getHttpServer()).get('/services?category=spa').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((service: any) => {
        expect(service.category).toBe('spa');
      });
    });

    it('should filter services by branchId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/services?branchId=${testBranchId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((service: any) => {
        expect(service.branch_id).toBe(testBranchId);
      });
    });
  });

  describe('GET /services/:id', () => {
    it('should return service details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/services/${testServiceId}`)
        .expect(200);

      expect(response.body.id).toBe(testServiceId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('price');
    });

    it('should return 404 for non-existent service', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).get(`/services/${fakeId}`).expect(404);
    });
  });

  describe('PATCH /services/:id', () => {
    it('should update service details', async () => {
      const updateData = {
        name: 'Premium Relaxation Massage',
        price: 60000,
        durationMinutes: 90,
      };

      const response = await request(app.getHttpServer())
        .patch(`/services/${testServiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price);
      expect(response.body.duration).toBe(updateData.durationMinutes);
    });
  });

  describe('DELETE /services/:id', () => {
    it('should soft delete service', async () => {
      await request(app.getHttpServer())
        .delete(`/services/${testServiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { data } = await supabase
        .getAdminClient()
        .from('services')
        .select('is_active')
        .eq('id', testServiceId)
        .single();

      expect(data.is_active).toBe(false);
    });
  });
});
