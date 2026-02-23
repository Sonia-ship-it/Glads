import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Contact Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let testBranchId: string;
  let testContactMessageId: string;
  let testUserId: string | undefined;

  const timestamp = Date.now();
  const testEmail = `contact-test-${timestamp}@glads.test`;

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
      full_name: 'Contact Test Admin',
      role: 'super-admin',
      is_active: true,
    });

    const { data: branch, error: branchError } = await supabase
      .getAdminClient()
      .from('branches')
      .insert({
        name: 'Test Branch for Contact',
        code: `TEST-CONTACT-${timestamp}`,
        address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788101004', email: 'contact@test.rw' },
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
    if (testContactMessageId) {
      await supabase.getAdminClient().from('contact_messages').delete().eq('id', testContactMessageId);
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

  describe('POST /contact', () => {
    it('should submit contact message publicly', async () => {
      const payload = {
        branchId: testBranchId,
        fullName: 'Jane Prospect',
        email: 'jane.prospect@example.com',
        phone: '+250788551122',
        subject: 'Suite availability',
        message: 'Do you have a suite available this weekend?',
        preferredContactMethod: 'email',
      };

      const response = await request(app.getHttpServer()).post('/contact').send(payload).expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.full_name).toBe(payload.fullName);
      expect(response.body.status).toBe('new');
      testContactMessageId = response.body.id;
    });
  });

  describe('GET /contact', () => {
    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer()).get('/contact').expect(401);
    });

    it('should list contact messages for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .get('/contact')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((item: any) => item.id === testContactMessageId)).toBe(true);
    });

    it('should filter messages by branchId and status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/contact?branchId=${testBranchId}&status=new`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((item: any) => {
        expect(item.branch_id).toBe(testBranchId);
        expect(item.status).toBe('new');
      });
    });
  });

  describe('GET /contact/:id', () => {
    it('should return contact message details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/contact/${testContactMessageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testContactMessageId);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PATCH /contact/:id', () => {
    it('should update contact message', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/contact/${testContactMessageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'resolved',
          internalNote: 'Assigned to concierge desk',
          response: 'We have availability this weekend. Please check your email.',
          assignedTo: testUserId,
        })
        .expect(200);

      expect(response.body.status).toBe('resolved');
      expect(response.body.internal_note).toContain('Assigned to concierge desk');
      expect(response.body.assigned_to).toBe(testUserId);
      expect(response.body).toHaveProperty('resolved_at');
    });
  });

  describe('DELETE /contact/:id', () => {
    it('should soft delete contact message', async () => {
      await request(app.getHttpServer())
        .delete(`/contact/${testContactMessageId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { data } = await supabase
        .getAdminClient()
        .from('contact_messages')
        .select('is_active, status')
        .eq('id', testContactMessageId)
        .single();

      expect(data.is_active).toBe(false);
      expect(data.status).toBe('archived');
    });
  });
});
