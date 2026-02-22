import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Analytics Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let actorUserId: string | undefined;
  let testBranchId: string;
  let testRoomId: string;
  let testBookingId: string;
  let testPaymentId: string;
  let testServiceId: string;
  let testServiceBookingId: string;
  let testAvailabilityId: string;

  const timestamp = Date.now();
  const actorEmail = `analytics-actor-${timestamp}@glads.test`;
  const startDate = '2026-01-01';
  const endDate = '2026-12-31';

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
      full_name: 'Analytics Admin',
      role: 'super-admin',
      is_active: true,
    });

    const { data: branch, error: branchError } = await supabase
      .getAdminClient()
      .from('branches')
      .insert({
        name: 'Test Branch for Analytics',
        code: `TEST-ANL-${timestamp}`,
        address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788008888', email: 'analytics@test.rw' },
        settings: { currency: 'RWF', timezone: 'Africa/Kigali' },
      })
      .select()
      .single();

    if (branchError || !branch) {
      throw new Error(`Failed to create branch: ${branchError?.message}`);
    }
    testBranchId = branch.id;

    const { data: room, error: roomError } = await supabase
      .getAdminClient()
      .from('rooms')
      .insert({
        branch_id: testBranchId,
        room_number: `AN-${timestamp.toString().slice(-3)}`,
        floor: 1,
        room_type: 'deluxe',
        name: 'Analytics Test Room',
        base_price: 150000,
        max_occupancy: 2,
        status: 'available',
        is_active: true,
      })
      .select()
      .single();

    if (roomError || !room) {
      throw new Error(`Failed to create room: ${roomError?.message}`);
    }
    testRoomId = room.id;

    const { data: booking, error: bookingError } = await supabase
      .getAdminClient()
      .from('bookings')
      .insert({
        booking_reference: `AN-BOOK-${timestamp}`,
        branch_id: testBranchId,
        room_id: testRoomId,
        guest_info: { firstName: 'Ana', lastName: 'Lytics', email: 'ana@example.com' },
        check_in_date: '2026-03-10T14:00:00Z',
        check_out_date: '2026-03-12T11:00:00Z',
        number_of_guests: 2,
        number_of_nights: 2,
        room_rate: 150000,
        total_amount: 300000,
        payment_status: 'paid',
        payment_gateway: 'pay-at-property',
        status: 'confirmed',
        source: 'website',
      })
      .select()
      .single();

    if (bookingError || !booking) {
      throw new Error(`Failed to create booking: ${bookingError?.message}`);
    }
    testBookingId = booking.id;

    const { data: payment, error: paymentError } = await supabase
      .getAdminClient()
      .from('payments')
      .insert({
        transaction_id: `AN-TXN-${timestamp}`,
        booking_id: testBookingId,
        amount: 300000,
        currency: 'RWF',
        payment_gateway: 'pay-at-property',
        status: 'completed',
      })
      .select()
      .single();

    if (paymentError || !payment) {
      throw new Error(`Failed to create payment: ${paymentError?.message}`);
    }
    testPaymentId = payment.id;

    const { data: service, error: serviceError } = await supabase
      .getAdminClient()
      .from('services')
      .insert({
        branch_id: testBranchId,
        name: 'Analytics Test Service',
        description: 'Service for analytics',
        category: 'spa',
        price: 50000,
        billing_type: 'one-time',
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
        booking_reference: `AN-SBK-${timestamp}`,
        branch_id: testBranchId,
        service_id: testServiceId,
        guest_info: { email: 'ana@example.com' },
        service_date: '2026-03-11T10:00:00Z',
        service_time: '10:00',
        quantity: 1,
        unit_price: 50000,
        total_amount: 50000,
        status: 'completed',
        payment_status: 'paid',
        payment_gateway: 'pay-at-property',
      })
      .select()
      .single();

    if (serviceBookingError || !serviceBooking) {
      throw new Error(`Failed to create service booking: ${serviceBookingError?.message}`);
    }
    testServiceBookingId = serviceBooking.id;

    const { data: availability, error: availabilityError } = await supabase
      .getAdminClient()
      .from('room_availability')
      .insert({
        room_id: testRoomId,
        branch_id: testBranchId,
        date: '2026-03-11',
        is_available: false,
        booking_id: testBookingId,
      })
      .select()
      .single();

    if (availabilityError || !availability) {
      throw new Error(`Failed to create room availability: ${availabilityError?.message}`);
    }
    testAvailabilityId = availability.id;
  });

  afterAll(async () => {
    if (testAvailabilityId) {
      await supabase
        .getAdminClient()
        .from('room_availability')
        .delete()
        .eq('id', testAvailabilityId);
    }
    if (testPaymentId) {
      await supabase.getAdminClient().from('payments').delete().eq('id', testPaymentId);
    }
    if (testServiceBookingId) {
      await supabase
        .getAdminClient()
        .from('service_bookings')
        .delete()
        .eq('id', testServiceBookingId);
    }
    if (testBookingId) {
      await supabase.getAdminClient().from('bookings').delete().eq('id', testBookingId);
    }
    if (testServiceId) {
      await supabase.getAdminClient().from('services').delete().eq('id', testServiceId);
    }
    if (testRoomId) {
      await supabase.getAdminClient().from('rooms').delete().eq('id', testRoomId);
    }
    if (testBranchId) {
      await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
    }
    if (actorUserId) {
      await supabase.getAdminClient().auth.admin.deleteUser(actorUserId);
    }

    await app.close();
  });

  it('should reject unauthenticated analytics access', async () => {
    await request(app.getHttpServer()).get('/analytics/revenue').expect(401);
  });

  it('should return revenue report', async () => {
    const response = await request(app.getHttpServer())
      .get(`/analytics/revenue?startDate=${startDate}&endDate=${endDate}&branchId=${testBranchId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.summary.totalRevenue).toBeGreaterThan(0);
    expect(response.body.summary.transactionCount).toBeGreaterThan(0);
  });

  it('should return occupancy report', async () => {
    const response = await request(app.getHttpServer())
      .get(
        `/analytics/occupancy?branchId=${testBranchId}&startDate=${startDate}&endDate=${endDate}`,
      )
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('averageOccupancy');
    expect(response.body).toHaveProperty('dailyOccupancy');
  });

  it('should return services report', async () => {
    const response = await request(app.getHttpServer())
      .get(`/analytics/services?branchId=${testBranchId}&startDate=${startDate}&endDate=${endDate}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.totalServiceBookings).toBeGreaterThan(0);
    expect(response.body.totalServiceRevenue).toBeGreaterThan(0);
  });

  it('should export report', async () => {
    const response = await request(app.getHttpServer())
      .post('/analytics/export')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        format: 'excel',
        reportType: 'revenue',
        startDate,
        endDate,
        branchId: testBranchId,
      })
      .expect(201);

    expect(response.headers['content-disposition']).toContain('revenue-report');
  });
});
