import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Gym Subscriptions Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let actorUserId: string | undefined;
  let memberUserId: string | undefined;
  let testBranchId: string;
  let testServiceId: string;
  let testServiceBookingId: string;
  let testGymSubscriptionId: string;
  let membershipNumber: string;

  const timestamp = Date.now();
  const actorEmail = `gym-actor-${timestamp}@glads.test`;
  const memberEmail = `gym-member-${timestamp}@glads.test`;

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
      full_name: 'Gym Admin',
      role: 'super-admin',
      is_active: true,
    });

    const { data: memberAuth, error: memberAuthError } = await supabase
      .getAdminClient()
      .auth.admin.createUser({
        email: memberEmail,
        password: 'TestPass123!',
        email_confirm: true,
      });

    if (memberAuthError || !memberAuth.user) {
      throw new Error(`Failed to create member auth user: ${memberAuthError?.message}`);
    }

    memberUserId = memberAuth.user.id;

    await supabase.getAdminClient().from('users').insert({
      id: memberUserId,
      email: memberEmail,
      full_name: 'Gym Member',
      role: 'receptionist',
      is_active: true,
    });

    const { data: branch, error: branchError } = await supabase
      .getAdminClient()
      .from('branches')
      .insert({
        name: 'Test Branch for Gym',
        code: `TEST-GYM-${timestamp}`,
        address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788007777', email: 'gym@test.rw' },
        settings: { currency: 'RWF', timezone: 'Africa/Kigali' },
      })
      .select()
      .single();

    if (branchError || !branch) {
      throw new Error(`Failed to create branch: ${branchError?.message}`);
    }

    testBranchId = branch.id;

    const { data: service, error: serviceError } = await supabase
      .getAdminClient()
      .from('services')
      .insert({
        branch_id: testBranchId,
        name: 'Monthly Gym Membership',
        description: 'Gym plan',
        category: 'gym',
        price: 30000,
        billing_type: 'subscription',
        subscription_period: 'monthly',
        is_active: true,
      })
      .select()
      .single();

    if (serviceError || !service) {
      throw new Error(`Failed to create service: ${serviceError?.message}`);
    }

    testServiceId = service.id;

    const { data: serviceBooking, error: serviceBookingError } = await supabase
      .getAdminClient()
      .from('service_bookings')
      .insert({
        booking_reference: `SBK-GYM-${timestamp}`,
        branch_id: testBranchId,
        service_id: testServiceId,
        guest_info: { userId: memberUserId, email: memberEmail },
        service_date: new Date('2026-03-15T09:00:00Z').toISOString(),
        service_time: '09:00',
        quantity: 1,
        unit_price: 30000,
        total_amount: 30000,
        status: 'confirmed',
        payment_status: 'paid',
        payment_gateway: 'pay-at-property',
      })
      .select()
      .single();

    if (serviceBookingError || !serviceBooking) {
      throw new Error(`Failed to create service booking: ${serviceBookingError?.message}`);
    }

    testServiceBookingId = serviceBooking.id;
  });

  afterAll(async () => {
    if (testGymSubscriptionId) {
      await supabase
        .getAdminClient()
        .from('gym_subscriptions')
        .delete()
        .eq('id', testGymSubscriptionId);
    }

    if (testServiceBookingId) {
      await supabase
        .getAdminClient()
        .from('service_bookings')
        .delete()
        .eq('id', testServiceBookingId);
    }

    if (testServiceId) {
      await supabase.getAdminClient().from('services').delete().eq('id', testServiceId);
    }

    if (testBranchId) {
      await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
    }

    if (memberUserId) {
      await supabase.getAdminClient().auth.admin.deleteUser(memberUserId);
    }

    if (actorUserId) {
      await supabase.getAdminClient().auth.admin.deleteUser(actorUserId);
    }

    await app.close();
  });

  it('should create gym subscription', async () => {
    const response = await request(app.getHttpServer())
      .post('/gym-subscriptions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        serviceBookingId: testServiceBookingId,
        memberId: memberUserId,
        branchId: testBranchId,
        subscriptionPeriod: 'monthly',
        startDate: '2026-03-15T00:00:00Z',
        endDate: '2026-04-15T00:00:00Z',
        autoRenewal: true,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.member_id).toBe(memberUserId);
    expect(response.body.subscription_period).toBe('monthly');
    testGymSubscriptionId = response.body.id;
    membershipNumber = response.body.membership_number;
  });

  it('should list gym subscriptions', async () => {
    const response = await request(app.getHttpServer())
      .get(`/gym-subscriptions?branchId=${testBranchId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((s: any) => s.id === testGymSubscriptionId)).toBe(true);
  });

  it('should get subscriptions by member', async () => {
    const response = await request(app.getHttpServer())
      .get(`/gym-subscriptions/member/${memberUserId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((s: any) => s.id === testGymSubscriptionId)).toBe(true);
  });

  it('should get subscription by membership number', async () => {
    const response = await request(app.getHttpServer())
      .get(`/gym-subscriptions/membership/${membershipNumber}`)
      .expect(200);

    expect(response.body.id).toBe(testGymSubscriptionId);
  });

  it('should get subscription by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/gym-subscriptions/${testGymSubscriptionId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.id).toBe(testGymSubscriptionId);
  });

  it('should update subscription', async () => {
    const response = await request(app.getHttpServer())
      .put(`/gym-subscriptions/${testGymSubscriptionId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ autoRenewal: false, isActive: true })
      .expect(200);

    expect(response.body.auto_renewal).toBe(false);
  });

  it('should renew subscription', async () => {
    const response = await request(app.getHttpServer())
      .put(`/gym-subscriptions/${testGymSubscriptionId}/renew`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ subscriptionPeriod: 'monthly', autoRenewal: true })
      .expect(200);

    expect(response.body.subscription_period).toBe('monthly');
    expect(response.body.auto_renewal).toBe(true);
  });

  it('should cancel subscription', async () => {
    const response = await request(app.getHttpServer())
      .put(`/gym-subscriptions/${testGymSubscriptionId}/cancel`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.is_active).toBe(false);
    expect(response.body.auto_renewal).toBe(false);
  });
});
