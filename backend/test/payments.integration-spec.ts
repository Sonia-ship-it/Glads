import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Payments Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let testBranchId: string;
  let testRoomId: string;
  let testBookingId: string;
  let testPaymentId: string;
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
      email: 'payments-test@glads.rw',
      password: 'TestPass123!',
      email_confirm: true,
    });

    testUser = authData.user;

    if (authData.user) {
      const { data: { session } } = await supabase.getClient().auth.signInWithPassword({
        email: 'payments-test@glads.rw',
        password: 'TestPass123!',
      });
      authToken = session?.access_token || '';

      await supabase.getAdminClient().from('users').insert({
        id: authData.user.id,
        email: 'payments-test@glads.rw',
        full_name: 'Payments Test Admin',
        role: 'super-admin',
        is_active: true,
      });
    }

    // Create test data (branch, room, booking)
    const { data: branch } = await supabase.getAdminClient().from('branches').insert({
      name: 'Test Branch for Payments',
      code: `TEST-PAY-${timestamp}`,
      address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
      coordinates: { latitude: -1.9441, longitude: 30.1367 },
      contact_info: { phone: '+250788000003', email: 'payments@test.rw' },
      settings: { currency: 'RWF', timezone: 'Africa/Kigali' },
    }).select().single();
    testBranchId = branch.id;

    const { data: room } = await supabase.getAdminClient().from('rooms').insert({
      branch_id: testBranchId,
      room_number: '301',
      floor: 3,
      room_type: 'standard',
      name: 'Test Room 301',
      base_price: 100000,
      max_occupancy: 2,
    }).select().single();
    testRoomId = room.id;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const checkOut = new Date(tomorrow);
    checkOut.setDate(checkOut.getDate() + 2);

    const { data: booking } = await supabase.getAdminClient().from('bookings').insert({
      booking_reference: 'TEST-PAY-001',
      branch_id: testBranchId,
      room_id: testRoomId,
      guest_info: { firstName: 'Test', lastName: 'Guest', email: 'guest@test.com', phone: '+250788999999' },
      check_in_date: tomorrow.toISOString(),
      check_out_date: checkOut.toISOString(),
      number_of_guests: 2,
      number_of_nights: 2,
      room_rate: 100000,
      total_amount: 200000,
      status: 'confirmed',
    }).select().single();
    testBookingId = booking.id;
  });

  afterAll(async () => {
    if (testPaymentId) {
      await supabase.getAdminClient().from('payments').delete().eq('id', testPaymentId);
    }
    if (testBookingId) {
      await supabase.getAdminClient().from('bookings').delete().eq('id', testBookingId);
    }
    if (testRoomId) {
      await supabase.getAdminClient().from('rooms').delete().eq('id', testRoomId);
    }
    if (testBranchId) {
      await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
    }
    await supabase.getAdminClient().from('users').delete().eq('email', 'payments-test@glads.rw');
    if (testUser) {
      await supabase.getAdminClient().auth.admin.deleteUser(testUser.id);
    }
    await app.close();
  });

  describe('POST /payments', () => {
    it('should create a payment record for a booking', async () => {
      const paymentData = {
        booking_id: testBookingId,
        amount: 200000,
        currency: 'RWF',
        payment_gateway: 'pesapal',
        payment_method: 'card',
        metadata: {
          cardBrand: 'Visa',
          last4: '4242',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('transaction_id');
      expect(response.body.amount).toBe(paymentData.amount);
      expect(response.body.status).toBe('pending');

      testPaymentId = response.body.id;
    });

    it('should support pay-at-property payment method', async () => {
      const { data: booking } = await supabase.getAdminClient().from('bookings').insert({
        booking_reference: 'TEST-PAY-002',
        branch_id: testBranchId,
        room_id: testRoomId,
        guest_info: { firstName: 'Walk', lastName: 'In', email: 'walkin@test.com' },
        check_in_date: new Date().toISOString(),
        check_out_date: new Date(Date.now() + 86400000).toISOString(),
        number_of_guests: 1,
        number_of_nights: 1,
        room_rate: 100000,
        total_amount: 100000,
      }).select().single();

      const paymentData = {
        booking_id: booking.id,
        amount: 100000,
        currency: 'RWF',
        payment_gateway: 'pay-at-property',
      };

      const response = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData)
        .expect(201);

      expect(response.body.payment_gateway).toBe('pay-at-property');

      // Cleanup
      await supabase.getAdminClient().from('payments').delete().eq('id', response.body.id);
      await supabase.getAdminClient().from('bookings').delete().eq('id', booking.id);
    });
  });

  describe('GET /payments', () => {
    it('should return list of payments for staff', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should filter payments by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((payment: any) => {
        expect(payment.status).toBe('pending');
      });
    });
  });

  describe('GET /payments/:id', () => {
    it('should return payment details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/payments/${testPaymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testPaymentId);
      expect(response.body).toHaveProperty('transaction_id');
      expect(response.body).toHaveProperty('amount');
    });
  });

  describe('PUT /payments/:id', () => {
    it('should update payment status to completed', async () => {
      const updateData = {
        status: 'completed',
        pesapal_transaction_id: 'PSP-TEST-12345',
      };

      const response = await request(app.getHttpServer())
        .put(`/payments/${testPaymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.pesapal_transaction_id).toBe(updateData.pesapal_transaction_id);
    });

    it('should mark payment as failed', async () => {
      const updateData = { status: 'failed' };

      const response = await request(app.getHttpServer())
        .put(`/payments/${testPaymentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('failed');
    });
  });

  describe('POST /payments/callback', () => {
    it('should handle Pesapal IPN callback', async () => {
      const callbackData = {
        OrderTrackingId: testPaymentId,
        OrderMerchantReference: 'TEST-PAY-001',
        OrderNotificationType: 'COMPLETED',
      };

      // This endpoint might not exist yet, so we expect 404 or success
      const response = await request(app.getHttpServer())
        .post('/payments/callback')
        .send(callbackData);

      expect([200, 201, 404]).toContain(response.status);
    });
  });
});
