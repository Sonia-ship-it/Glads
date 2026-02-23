import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Special Offers Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let testBranchId: string;
  let testSpecialOfferId: string;
  let testUserId: string | undefined;

  const timestamp = Date.now();
  const testEmail = `special-offers-test-${timestamp}@glads.test`;

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
      full_name: 'Special Offers Test Admin',
      role: 'super-admin',
      is_active: true,
    });

    const { data: branch, error: branchError } = await supabase
      .getAdminClient()
      .from('branches')
      .insert({
        name: 'Test Branch for Special Offers',
        code: `TEST-SPECIAL-OFFERS-${timestamp}`,
        address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788101003', email: 'offers@test.rw' },
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
    if (testSpecialOfferId) {
      await supabase.getAdminClient().from('special_offers').delete().eq('id', testSpecialOfferId);
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

  describe('POST /special-offers', () => {
    it('should reject unauthenticated request', async () => {
      await request(app.getHttpServer())
        .post('/special-offers')
        .send({
          title: 'No Auth Offer',
          description: 'Offer description',
          validFrom: new Date().toISOString(),
        })
        .expect(401);
    });

    it('should create special offer with valid payload', async () => {
      const now = new Date();
      const validFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const validTo = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const payload = {
        branchId: testBranchId,
        scope: 'branch-specific',
        title: 'Weekend Escape',
        description: 'Save 15% on two-night stays at selected branches.',
        ctaText: 'Book Weekend',
        ctaLink: '/rooms',
        promoCode: 'WEEKEND15',
        discountPercentage: 15,
        currency: 'RWF',
        validFrom,
        validTo,
        termsAndConditions: 'Valid for direct bookings only.',
        isFeatured: true,
        status: 'active',
      };

      const response = await request(app.getHttpServer())
        .post('/special-offers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(payload.title);
      expect(response.body.branch_id).toBe(testBranchId);
      expect(response.body.status).toBe('active');
      testSpecialOfferId = response.body.id;
    });
  });

  describe('GET /special-offers', () => {
    it('should return active offers publicly', async () => {
      const response = await request(app.getHttpServer()).get('/special-offers').expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((offer: any) => offer.id === testSpecialOfferId)).toBe(true);
    });

    it('should filter offers by branchId and featured', async () => {
      const response = await request(app.getHttpServer())
        .get(`/special-offers?branchId=${testBranchId}&featured=true`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((offer: any) => {
        expect(offer.branch_id).toBe(testBranchId);
        expect(offer.is_featured).toBe(true);
      });
    });
  });

  describe('GET /special-offers/:id', () => {
    it('should return special offer details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/special-offers/${testSpecialOfferId}`)
        .expect(200);

      expect(response.body.id).toBe(testSpecialOfferId);
      expect(response.body).toHaveProperty('title');
    });
  });

  describe('PATCH /special-offers/:id', () => {
    it('should update special offer', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/special-offers/${testSpecialOfferId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Weekend Escape Updated', isFeatured: false })
        .expect(200);

      expect(response.body.title).toBe('Weekend Escape Updated');
      expect(response.body.is_featured).toBe(false);
    });
  });

  describe('DELETE /special-offers/:id', () => {
    it('should soft delete special offer', async () => {
      await request(app.getHttpServer())
        .delete(`/special-offers/${testSpecialOfferId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { data } = await supabase
        .getAdminClient()
        .from('special_offers')
        .select('is_active, status')
        .eq('id', testSpecialOfferId)
        .single();

      expect(data.is_active).toBe(false);
      expect(data.status).toBe('inactive');
    });
  });
});
