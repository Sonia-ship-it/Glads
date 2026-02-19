import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Service Bookings Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let actorUserId: string | undefined;
  let testBranchId: string;
  let testServiceId: string;
  let testServiceBookingId: string;

  const timestamp = Date.now();
  const actorEmail = `service-booking-actor-${timestamp}@glads.test`;

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
      full_name: 'Service Booking Admin',
      role: 'super-admin',
      is_active: true,
    });

    const { data: branch, error: branchError } = await supabase
      .getAdminClient()
      .from('branches')
      .insert({
        name: 'Test Branch for Service Bookings',
        code: `TEST-SBK-${timestamp}`,
        address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788006666', email: 'service-bookings@test.rw' },
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
        name: 'Service Booking Test Service',
        description: 'Test service',
        category: 'spa',
        price: 25000,
        billing_type: 'one-time',
        duration: 60,
        is_active: true,
      })
      .select()
      .single();

    if (serviceError || !service) {
      throw new Error(`Failed to create service: ${serviceError?.message}`);
    }

    testServiceId = service.id;
  });

  afterAll(async () => {
    if (testServiceBookingId) {
      await supabase.getAdminClient().from('service_bookings').delete().eq('id', testServiceBookingId);
    }

    if (testServiceId) {
      await supabase.getAdminClient().from('services').delete().eq('id', testServiceId);
    }

    if (testBranchId) {
      await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
    }

    if (actorUserId) {
      await supabase.getAdminClient().auth.admin.deleteUser(actorUserId);
    }

    await app.close();
  });

  it('should create service booking', async () => {
    const response = await request(app.getHttpServer())
      .post('/service-bookings')
      .send({
        serviceId: testServiceId,
        guestInfo: {
          firstName: 'Guest',
          lastName: 'One',
          email: 'guest.one@example.com',
          phone: '+250788100000',
        },
        bookingDate: '2026-03-10',
        bookingTime: '10:00',
        numberOfPeople: 2,
        specialRequests: 'Quiet room',
        totalAmount: 50000,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.service_id).toBe(testServiceId);
    expect(response.body.status).toBe('pending');
    testServiceBookingId = response.body.id;
  });

  it('should list service bookings', async () => {
    const response = await request(app.getHttpServer())
      .get('/service-bookings')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((sb: any) => sb.id === testServiceBookingId)).toBe(true);
  });

  it('should filter service bookings by serviceId', async () => {
    const response = await request(app.getHttpServer())
      .get(`/service-bookings?serviceId=${testServiceId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    response.body.forEach((sb: any) => {
      expect(sb.service_id).toBe(testServiceId);
    });
  });

  it('should get service booking by id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/service-bookings/${testServiceBookingId}`)
      .expect(200);

    expect(response.body.id).toBe(testServiceBookingId);
  });

  it('should complete service booking', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/service-bookings/${testServiceBookingId}/complete`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.status).toBe('completed');
  });

  it('should cancel service booking', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/service-bookings/${testServiceBookingId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.status).toBe('cancelled');
  });
});
