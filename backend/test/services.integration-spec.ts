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
  let testUser: any;
  const timestamp = Date.now();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    supabase = moduleFixture.get<SupabaseService>(SupabaseService);

    // Create test user
    const { data: authData } = await supabase.getAdminClient().auth.admin.createUser({
      email: 'services-test@glads.rw',
      password: 'TestPass123!',
      email_confirm: true,
    });

    testUser = authData.user;

    if (authData.user) {
      const { data: { session } } = await supabase.getClient().auth.signInWithPassword({
        email: 'services-test@glads.rw',
        password: 'TestPass123!',
      });
      authToken = session?.access_token || '';

      await supabase.getAdminClient().from('users').insert({
        id: authData.user.id,
        email: 'services-test@glads.rw',
        full_name: 'Services Test Admin',
        role: 'super-admin',
        is_active: true,
      });
    }

    // Create test branch
    const { data: branch } = await supabase.getAdminClient().from('branches').insert({
      name: 'Test Branch for Services',
      code: `TEST-SERV-${timestamp}`,
      address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
      coordinates: { latitude: -1.9441, longitude: 30.1367 },
      contact_info: { phone: '+250788000002', email: 'services@test.rw' },
      settings: { currency: 'RWF', timezone: 'Africa/Kigali' },
    }).select().single();
    testBranchId = branch.id;
  });

  afterAll(async () => {
    if (testServiceId) {
      await supabase.getAdminClient().from('services').delete().eq('id', testServiceId);
    }
    if (testBranchId) {
      await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
    }
    await supabase.getAdminClient().from('users').delete().eq('email', 'services-test@glads.rw');
    if (testUser) {
      await supabase.getAdminClient().auth.admin.deleteUser(testUser.id);
    }
    await app.close();
  });

  describe('POST /services', () => {
    it('should create a spa service', async () => {
      const serviceData = {
        branchId: testBranchId,
        name: 'Relaxation Massage',
        description: '60-minute full body relaxation massage',
        category: 'spa',
        price: 50000,
        billingType: 'one-time',
        duration: 60,
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
        availabilitySchedule: [
          { day: 'Monday', openTime: '06:00', closeTime: '22:00' },
          { day: 'Tuesday', openTime: '06:00', closeTime: '22:00' },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/services/${testBranchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(gymService)
        .expect(201);

      expect(response.body.billing_type).toBe('subscription');
      expect(response.body.subscription_period).toBe('monthly');
    });
  });

  describe('GET /services', () => {
    it('should return list of active services', async () => {
      const response = await request(app.getHttpServer())
        .get('/services')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter services by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/services?category=spa')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((service: any) => {
        expect(service.category).toBe('spa');
      });
    });

    it('should filter services by branch', async () => {
      const response = await request(app.getHttpServer())
        .get(`/services?branch_id=${testBranchId}`)
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
      await request(app.getHttpServer())
        .get(`/services/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /services/:id', () => {
    it('should update service details', async () => {
      const updateData = {
        name: 'Premium Relaxation Massage',
        price: 60000,
        duration: 90,
      };

      const response = await request(app.getHttpServer())
        .put(`/services/${testServiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price);
      expect(response.body.duration).toBe(updateData.duration);
    });
  });

  describe('DELETE /services/:id', () => {
    it('should soft delete service', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/services/${testServiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify service is soft deleted
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
