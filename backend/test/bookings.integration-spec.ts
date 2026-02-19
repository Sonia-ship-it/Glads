import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Bookings Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let testBranchId: string;
  let testRoomId: string;
  let testBookingId: string;
  let testUserId: string | undefined;
  const otaBookingIds: string[] = [];

  const timestamp = Date.now();
  const testEmail = `bookings-test-${timestamp}@glads.test`;

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
      full_name: 'Bookings Test Admin',
      role: 'super-admin',
      is_active: true,
    });

    const { data: branch, error: branchError } = await supabase
      .getAdminClient()
      .from('branches')
      .insert({
        name: 'Test Branch for Bookings',
        code: `TEST-BOOK-${timestamp}`,
        address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788000001', email: 'bookings@test.rw' },
        settings: { currency: 'RWF', timezone: 'Africa/Kigali' },
      })
      .select()
      .single();

    if (branchError || !branch) {
      throw new Error(`Failed to create test branch: ${branchError?.message}`);
    }

    testBranchId = branch.id;

    const { data: room, error: roomError } = await supabase
      .getAdminClient()
      .from('rooms')
      .insert({
        branch_id: testBranchId,
        room_number: `2${timestamp.toString().slice(-3)}`,
        floor: 2,
        room_type: 'deluxe',
        name: 'Test Room 201',
        base_price: 150000,
        max_occupancy: 2,
        status: 'available',
        is_active: true,
      })
      .select()
      .single();

    if (roomError || !room) {
      throw new Error(`Failed to create test room: ${roomError?.message}`);
    }

    testRoomId = room.id;
  });

  afterAll(async () => {
    if (testBookingId) {
      await supabase.getAdminClient().from('bookings').delete().eq('id', testBookingId);
    }

    if (otaBookingIds.length) {
      await supabase.getAdminClient().from('bookings').delete().in('id', otaBookingIds);
    }

    if (testRoomId) {
      await supabase.getAdminClient().from('rooms').delete().eq('id', testRoomId);
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

  describe('POST /bookings', () => {
    it('should create a new booking with valid data', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const checkOut = new Date(tomorrow);
      checkOut.setDate(checkOut.getDate() + 3);

      const bookingData = {
        branchId: testBranchId,
        roomId: testRoomId,
        guestInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+250788123456',
          country: 'Rwanda',
        },
        checkInDate: tomorrow.toISOString(),
        checkOutDate: checkOut.toISOString(),
        numberOfGuests: 2,
        totalAmount: 450000,
        paymentGateway: 'pesapal',
      };

      const response = await request(app.getHttpServer()).post('/bookings').send(bookingData).expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('booking_reference');
      expect(response.body.status).toBe('pending');
      expect(response.body.payment_status).toBe('pending');
      expect(response.body.number_of_nights).toBe(3);

      testBookingId = response.body.id;
    });

    it('should fail with invalid dates (check-out before check-in)', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const today = new Date();

      const invalidData = {
        branchId: testBranchId,
        roomId: testRoomId,
        guestInfo: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        checkInDate: tomorrow.toISOString(),
        checkOutDate: today.toISOString(),
        numberOfGuests: 1,
        totalAmount: 150000,
        paymentGateway: 'pesapal',
      };

      await request(app.getHttpServer()).post('/bookings').send(invalidData).expect(400);
    });
  });

  describe('POST /bookings/check-availability', () => {
    it('should check room availability', async () => {
      const response = await request(app.getHttpServer())
        .post('/bookings/check-availability')
        .send({
          branchId: testBranchId,
          roomId: testRoomId,
          checkInDate: '2026-03-20T14:00:00Z',
          checkOutDate: '2026-03-22T11:00:00Z',
        })
        .expect(201);

      const availability =
        typeof response.body === 'boolean'
          ? response.body
          : response.body?.available ?? response.body?.isAvailable ?? response.text === 'true';

      expect(typeof availability).toBe('boolean');
    });
  });

  describe('POST /bookings/ota', () => {
    it('should create OTA booking for staff', async () => {
      const response = await request(app.getHttpServer())
        .post('/bookings/ota')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          branchId: testBranchId,
          roomId: testRoomId,
          otaPlatform: 'Booking.com',
          otaReference: `OTA-${Date.now()}`,
          checkInDate: '2026-03-25T14:00:00Z',
          checkOutDate: '2026-03-27T11:00:00Z',
          numberOfGuests: 2,
          totalAmount: 300000,
          guestInfo: {
            firstName: 'OTA',
            lastName: 'Guest',
            email: 'ota.guest@example.com',
          },
        })
        .expect(201);

      expect(response.body.status).toBe('confirmed');
      expect(response.body.source).toBe('ota-manual');
      otaBookingIds.push(response.body.id);
    });
  });

  describe('GET /bookings', () => {
    it('should return list of bookings for staff', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((booking: any) => booking.id === testBookingId)).toBe(true);
    });

    it('should filter bookings by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((booking: any) => {
        expect(booking.status).toBe('pending');
      });
    });
  });

  describe('GET /bookings/:id', () => {
    it('should return booking details', async () => {
      const response = await request(app.getHttpServer()).get(`/bookings/${testBookingId}`).expect(200);

      expect(response.body.id).toBe(testBookingId);
      expect(response.body).toHaveProperty('booking_reference');
      expect(response.body).toHaveProperty('guest_info');
    });
  });

  describe('PATCH /bookings/:id', () => {
    it('should update booking status', async () => {
      const updateData = { status: 'confirmed' };

      const response = await request(app.getHttpServer())
        .patch(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });
  });

  describe('GET /bookings/branch/:branchId/stats', () => {
    it('should return booking stats for branch', async () => {
      const response = await request(app.getHttpServer())
        .get(`/bookings/branch/${testBranchId}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('totalRevenue');
    });
  });

  describe('POST /bookings/:id/check-in', () => {
    it('should check-in a booking', async () => {
      const response = await request(app.getHttpServer())
        .post(`/bookings/${testBookingId}/check-in`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.status).toBe('checked-in');
      expect(response.body.checked_in_at).toBeTruthy();
    });
  });

  describe('POST /bookings/:id/check-out', () => {
    it('should check-out a booking', async () => {
      const response = await request(app.getHttpServer())
        .post(`/bookings/${testBookingId}/check-out`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body.status).toBe('checked-out');
      expect(response.body.checked_out_at).toBeTruthy();
    });
  });

  describe('DELETE /bookings/:id', () => {
    it('should cancel a booking', async () => {
      await request(app.getHttpServer())
        .delete(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const { data } = await supabase
        .getAdminClient()
        .from('bookings')
        .select('status')
        .eq('id', testBookingId)
        .single();

      expect(data.status).toBe('cancelled');
    });
  });
});
