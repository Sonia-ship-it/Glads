import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Branches Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let testBranchId: string;
  let testUserId: string | undefined;

  const timestamp = Date.now();
  const testEmail = `branches-test-${timestamp}@glads.test`;

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
      full_name: 'Branches Test Admin',
      role: 'super-admin',
      is_active: true,
    });
  });

  afterAll(async () => {
    if (testBranchId) {
      await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
    }

    await supabase.getAdminClient().from('users').delete().eq('email', testEmail);

    if (testUserId) {
      await supabase.getAdminClient().auth.admin.deleteUser(testUserId);
    }

    await app.close();
  });

  describe('POST /branches', () => {
    it('should create a new branch with valid data', async () => {
      const branchData = {
        name: 'Test Branch Ndera',
        code: `TEST-ND-${timestamp}`,
        address: {
          street: 'KN 5 Rd',
          city: 'Kigali',
          state: 'Kigali Province',
          zipCode: '00000',
          country: 'Rwanda',
        },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: {
          phone: '+250788123456',
          email: 'test@glads.rw',
        },
        amenities: ['WiFi', 'Parking'],
        description: 'Test branch for integration tests',
        settings: {
          currency: 'RWF',
          timezone: 'Africa/Kigali',
          taxRate: 0.18,
          serviceChargeRate: 0.1,
        },
      };

      const response = await request(app.getHttpServer())
        .post('/branches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(branchData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(branchData.name);
      expect(response.body.code).toBe(branchData.code);
      expect(response.body.is_active).toBe(true);

      testBranchId = response.body.id;
    });

    it('should fail with duplicate branch code', async () => {
      const duplicateData = {
        name: 'Duplicate Branch',
        code: `TEST-ND-${timestamp}`,
        address: { street: 'Test', city: 'Test', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788123456', email: 'test2@glads.rw' },
        amenities: [],
        settings: { currency: 'RWF', timezone: 'Africa/Kigali' },
      };

      await request(app.getHttpServer())
        .post('/branches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(500);
    });
  });

  describe('GET /branches', () => {
    it('should return list of branches', async () => {
      const response = await request(app.getHttpServer()).get('/branches').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((branch: any) => branch.id === testBranchId)).toBe(true);
    });
  });

  describe('GET /branches/:id', () => {
    it('should return branch details', async () => {
      const response = await request(app.getHttpServer()).get(`/branches/${testBranchId}`).expect(200);

      expect(response.body.id).toBe(testBranchId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('address');
    });

    it('should return 404 for non-existent branch', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).get(`/branches/${fakeId}`).expect(404);
    });
  });

  describe('PUT /branches/:id', () => {
    it('should update branch details', async () => {
      const updateData = {
        name: 'Updated Test Branch',
        description: 'Updated description',
      };

      const response = await request(app.getHttpServer())
        .put(`/branches/${testBranchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
    });
  });

  describe('GET /branches/:id/stats', () => {
    it('should return branch stats', async () => {
      const response = await request(app.getHttpServer())
        .get(`/branches/${testBranchId}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.branchId).toBe(testBranchId);
      expect(response.body).toHaveProperty('rooms');
      expect(response.body).toHaveProperty('bookings');
      expect(response.body).toHaveProperty('revenue');
    });
  });

  describe('DELETE /branches/:id', () => {
    it('should soft delete branch', async () => {
      await request(app.getHttpServer())
        .delete(`/branches/${testBranchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { data } = await supabase
        .getAdminClient()
        .from('branches')
        .select('is_active')
        .eq('id', testBranchId)
        .single();

      expect(data.is_active).toBe(false);
    });
  });
});
