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
      email: 'bookings-test@glads.rw',
      password: 'TestPass123!',
      email_confirm: true,
    });

    testUser = authData.user;

    if (authData.user) {
      const { data: { session } } = await supabase.getClient().auth.signInWithPassword({
        email: 'bookings-test@glads.rw',
        password: 'TestPass123!',
      });
      authToken = session?.access_token || '';

      await supabase.getAdminClient().from('users').insert({
        id: authData.user.id,
        email: 'bookings-test@glads.rw',
        full_name: 'Bookings Test Admin',
        role: 'super-admin',
        is_active: true,
      });
    }

    // Create test branch and room
    const { data: branch } = await supabase.getAdminClient().from('branches').insert({
      name: 'Test Branch for Bookings',
      code: `TEST-BOOK-${timestamp}`,
      address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
      coordinates: { latitude: -1.9441, longitude: 30.1367 },
      contact_info: { phone: '+250788000001', email: 'bookings@test.rw' },
      settings: { currency: 'RWF', timezone: 'Africa/Kigali' },
    }).select().single();
    testBranchId = branch.id;

    const { data: room } = await supabase.getAdminClient().from('rooms').insert({
      branch_id: testBranchId,
      room_number: '201',
      floor: 2,
      room_type: 'deluxe',
      name: 'Test Room 201',
      base_price: 150000,
      max_occupancy: 2,
    }).select().single();
    testRoomId = room.id;
  });

  afterAll(async () => {
    if (testBookingId) {
      await supabase.getAdminClient().from('bookings').delete().eq('id', testBookingId);
    }
    if (testRoomId) {
      await supabase.getAdminClient().from('rooms').delete().eq('id', testRoomId);
    }
    if (testBranchId) {
      await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
    }
    await supabase.getAdminClient().from('users').delete().eq('email', 'bookings-test@glads.rw');
    if (testUser) {
      await supabase.getAdminClient().auth.admin.deleteUser(testUser.id);
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
        numberOfNights: 3,
        roomRate: 150000,
        totalAmount: 450000,
        taxAmount: 81000,
        serviceCharges: 45000,
        source: 'website',
      };

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('booking_reference');
      expect(response.body.status).toBe('pending');
      expect(response.body.payment_status).toBe('pending');
      expect(response.body.number_of_nights).toBe(3);

      testBookingId = response.body.id;
    });

    it('should fail with invalid dates (check-out before check-in)', async () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const invalidData = {
        branchId: testBranchId,
        roomId: testRoomId,
        guestInfo: { firstName: 'Test', lastName: 'User', email: 'test@example.com' },
        checkInDate: today.toISOString(),
        checkOutDate: yesterday.toISOString(),
        numberOfGuests: 1,
        numberOfNights: 1,
        roomRate: 150000,
        totalAmount: 150000,
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });
  });

  describe('GET /bookings', () => {
    it('should return list of bookings for staff', async () => {
      const response = await request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
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
      const response = await request(app.getHttpServer())
        .get(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testBookingId);
      expect(response.body).toHaveProperty('booking_reference');
      expect(response.body).toHaveProperty('guest_info');
    });
  });

  describe('PUT /bookings/:id', () => {
    it('should update booking status', async () => {
      const updateData = { status: 'confirmed' };

      const response = await request(app.getHttpServer())
        .put(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('confirmed');
    });

    it('should check-in a booking', async () => {
      const updateData = { status: 'checked-in' };

      const response = await request(app.getHttpServer())
        .put(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('checked-in');
      expect(response.body.checked_in_at).toBeTruthy();
    });
  });

  describe('DELETE /bookings/:id', () => {
    it('should cancel a booking', async () => {
      const updateData = { status: 'cancelled' };

      await request(app.getHttpServer())
        .put(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
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
