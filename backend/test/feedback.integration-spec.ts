import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Feedback Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let testBranchId: string;
  let testFeedbackId: string;
  let testUserId: string | undefined;

  const timestamp = Date.now();
  const testEmail = `feedback-test-${timestamp}@glads.test`;

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
      full_name: 'Feedback Test Admin',
      role: 'super-admin',
      is_active: true,
    });

    const { data: branch, error: branchError } = await supabase
      .getAdminClient()
      .from('branches')
      .insert({
        name: 'Test Branch for Feedback',
        code: `TEST-FEEDBACK-${timestamp}`,
        address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788101002', email: 'feedback@test.rw' },
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
    if (testFeedbackId) {
      await supabase.getAdminClient().from('feedback').delete().eq('id', testFeedbackId);
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

  describe('POST /feedback', () => {
    it('should submit feedback publicly', async () => {
      const payload = {
        branchId: testBranchId,
        fullName: 'John Guest',
        email: 'john.guest@example.com',
        phone: '+250788221100',
        category: 'service',
        rating: 5,
        subject: 'Excellent experience',
        message: 'The staff support was excellent.',
        metadata: { source: 'integration-test' },
      };

      const response = await request(app.getHttpServer()).post('/feedback').send(payload).expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.full_name).toBe(payload.fullName);
      expect(response.body.email).toBe(payload.email);
      expect(response.body.status).toBe('new');
      testFeedbackId = response.body.id;
    });
  });

  describe('GET /feedback', () => {
    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer()).get('/feedback').expect(401);
    });

    it('should list feedback for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/feedback')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((item: any) => item.id === testFeedbackId)).toBe(true);
    });

    it('should filter feedback by branchId and status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/feedback?branchId=${testBranchId}&status=new`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((item: any) => {
        expect(item.branch_id).toBe(testBranchId);
        expect(item.status).toBe('new');
      });
    });
  });

  describe('GET /feedback/:id', () => {
    it('should return feedback details for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/feedback/${testFeedbackId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testFeedbackId);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PATCH /feedback/:id', () => {
    it('should update feedback status and response', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/feedback/${testFeedbackId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'resolved',
          response: 'Thanks for your feedback. We have recorded your input.',
        })
        .expect(200);

      expect(response.body.status).toBe('resolved');
      expect(response.body.response).toContain('Thanks for your feedback');
      expect(response.body).toHaveProperty('resolved_at');
    });
  });

  describe('DELETE /feedback/:id', () => {
    it('should soft delete feedback', async () => {
      await request(app.getHttpServer())
        .delete(`/feedback/${testFeedbackId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { data } = await supabase
        .getAdminClient()
        .from('feedback')
        .select('is_active, status')
        .eq('id', testFeedbackId)
        .single();

      expect(data.is_active).toBe(false);
      expect(data.status).toBe('archived');
    });
  });
});
