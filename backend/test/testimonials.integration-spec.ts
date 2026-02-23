import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Testimonials Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let testBranchId: string;
  let testTestimonialId: string;
  let testUserId: string | undefined;

  const timestamp = Date.now();
  const testEmail = `testimonials-test-${timestamp}@glads.test`;

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
      full_name: 'Testimonials Test Admin',
      role: 'super-admin',
      is_active: true,
    });

    const { data: branch, error: branchError } = await supabase
      .getAdminClient()
      .from('branches')
      .insert({
        name: 'Test Branch for Testimonials',
        code: `TEST-TESTIMONIALS-${timestamp}`,
        address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788101001', email: 'testimonials@test.rw' },
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
    if (testTestimonialId) {
      await supabase.getAdminClient().from('testimonials').delete().eq('id', testTestimonialId);
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

  describe('POST /testimonials/:branchId', () => {
    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer())
        .post(`/testimonials/${testBranchId}`)
        .send({
          guestName: 'No Auth Guest',
          quote: 'Great place.',
        })
        .expect(401);
    });

    it('should create testimonial with valid payload', async () => {
      const payload = {
        guestName: 'Alice Guest',
        guestRole: 'Business Traveler',
        quote: 'Excellent stay, very clean and professional team.',
        rating: 5,
        source: 'website',
        isFeatured: true,
        displayOrder: 1,
      };

      const response = await request(app.getHttpServer())
        .post(`/testimonials/${testBranchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.guest_name).toBe(payload.guestName);
      expect(response.body.quote).toBe(payload.quote);
      expect(response.body.branch_id).toBe(testBranchId);
      testTestimonialId = response.body.id;
    });
  });

  describe('GET /testimonials', () => {
    it('should return testimonials publicly', async () => {
      const response = await request(app.getHttpServer()).get('/testimonials').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((testimonial: any) => testimonial.id === testTestimonialId)).toBe(true);
    });

    it('should filter testimonials by branchId and featured', async () => {
      const response = await request(app.getHttpServer())
        .get(`/testimonials?branchId=${testBranchId}&featured=true`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((testimonial: any) => {
        expect(testimonial.branch_id).toBe(testBranchId);
        expect(testimonial.is_featured).toBe(true);
      });
    });
  });

  describe('GET /testimonials/:id', () => {
    it('should return testimonial details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/testimonials/${testTestimonialId}`)
        .expect(200);

      expect(response.body.id).toBe(testTestimonialId);
      expect(response.body).toHaveProperty('guest_name');
      expect(response.body).toHaveProperty('quote');
    });
  });

  describe('PATCH /testimonials/:id', () => {
    it('should update testimonial', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/testimonials/${testTestimonialId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quote: 'Updated quote content', isFeatured: false })
        .expect(200);

      expect(response.body.quote).toBe('Updated quote content');
      expect(response.body.is_featured).toBe(false);
    });
  });

  describe('DELETE /testimonials/:id', () => {
    it('should soft delete testimonial', async () => {
      await request(app.getHttpServer())
        .delete(`/testimonials/${testTestimonialId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { data } = await supabase
        .getAdminClient()
        .from('testimonials')
        .select('is_active')
        .eq('id', testTestimonialId)
        .single();

      expect(data.is_active).toBe(false);
    });
  });
});
