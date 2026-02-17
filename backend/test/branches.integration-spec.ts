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
  let testUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    supabase = moduleFixture.get<SupabaseService>(SupabaseService);

    // Create test user and get auth token
    const { data: authData } = await supabase.getAdminClient().auth.admin.createUser({
      email: 'test@glads.rw',
      password: 'TestPass123!',
      email_confirm: true,
    });

    testUser = authData.user;

    if (authData.user) {
      const { data: { session } } = await supabase.getClient().auth.signInWithPassword({
        email: 'test@glads.rw',
        password: 'TestPass123!',
      });
      authToken = session?.access_token || '';

      // Insert user profile
      await supabase.getAdminClient().from('users').insert({
        id: authData.user.id,
        email: 'test@glads.rw',
        full_name: 'Test Admin',
        role: 'super-admin',
        is_active: true,
      });
    }
  });

  afterAll(async () => {
    // Cleanup: delete test branch and user
    if (testBranchId) {
      await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
    }
    await supabase.getAdminClient().from('users').delete().eq('email', 'test@glads.rw');
    if (testUser) {
      await supabase.getAdminClient().auth.admin.deleteUser(testUser.id);
    }
    await app.close();
  });

  describe('POST /branches', () => {
    it('should create a new branch with valid data', async () => {
      const branchData = {
        name: 'Test Branch Ndera',
        code: 'TEST-ND',
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
          serviceChargeRate: 0.10,
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
        code: 'TEST-ND', // Same code as above
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
      const response = await request(app.getHttpServer())
        .get('/branches')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /branches/:id', () => {
    it('should return branch details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/branches/${testBranchId}`)
        .expect(200);

      expect(response.body.id).toBe(testBranchId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('address');
    });

    it('should return 404 for non-existent branch', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/branches/${fakeId}`)
        .expect(404);
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

  describe('DELETE /branches/:id', () => {
    it('should soft delete branch', async () => {
      await request(app.getHttpServer())
        .delete(`/branches/${testBranchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify branch is soft deleted (is_active = false)
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
