import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Rooms Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let testBranchId: string;
  let testRoomId: string;
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
      email: 'rooms-test@glads.rw',
      password: 'TestPass123!',
      email_confirm: true,
    });

    testUser = authData.user;

    if (authData.user) {
      const { data: { session } } = await supabase.getClient().auth.signInWithPassword({
        email: 'rooms-test@glads.rw',
        password: 'TestPass123!',
      });
      authToken = session?.access_token || '';

      await supabase.getAdminClient().from('users').insert({
        id: authData.user.id,
        email: 'rooms-test@glads.rw',
        full_name: 'Rooms Test Admin',
        role: 'super-admin',
        is_active: true,
      });
    }

    // Create test branch
    const { data: branch, error: branchError } = await supabase.getAdminClient().from('branches').insert({
      name: 'Test Branch for Rooms',
      code: `TEST-ROOMS-${timestamp}`,

      address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
      coordinates: { latitude: -1.9441, longitude: 30.1367 },
      contact_info: { phone: '+250788000000', email: 'rooms@test.rw' },
      settings: { currency: 'RWF', timezone: 'Africa/Kigali' },
    }).select().single();

    if (branchError) {
      console.error('Failed to create test branch:', branchError);
      throw branchError;
    }

    testBranchId = branch.id;
  });

  afterAll(async () => {
    if (testRoomId) {
      await supabase.getAdminClient().from('rooms').delete().eq('id', testRoomId);
    }
    if (testBranchId) {
      await supabase.getAdminClient().from('branches').delete().eq('id', testBranchId);
    }
    await supabase.getAdminClient().from('users').delete().eq('email', 'rooms-test@glads.rw');
    if (testUser) {
      await supabase.getAdminClient().auth.admin.deleteUser(testUser.id);
    }
    await app.close();
  });

  describe('POST /rooms', () => {
    it('should create a new room with valid data', async () => {
      const roomData = {
        branchId: testBranchId,
        roomNumber: '101',
        floor: 1,
        roomType: 'deluxe',
        name: 'Deluxe Room 101',
        description: 'Spacious deluxe room with city view',
        basePrice: 150000,
        maxOccupancy: 2,
        bedType: 'King',
        sizeSqm: 35.5,
        viewType: 'City View',
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Air Conditioning'],
        images: ['https://example.com/room101.jpg'],
      };

      const response = await request(app.getHttpServer())
        .post(`/rooms/${testBranchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(roomData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.room_number).toBe(roomData.roomNumber);
      expect(response.body.room_type).toBe(roomData.roomType);
      expect(response.body.status).toBe('available');
      expect(response.body.is_active).toBe(true);

      testRoomId = response.body.id;
    });

    it('should fail with duplicate room_number in same branch', async () => {
      const duplicateData = {
        branchId: testBranchId,
        roomNumber: '101', // Duplicate
        floor: 2,
        roomType: 'standard',
        name: 'Standard Room 101',
        description: 'Standard room',
        basePrice: 80000,
        maxOccupancy: 2,
        bedType: 'Queen',
        sizeSqm: 25,
        viewType: 'Garden',
        amenities: ['WiFi', 'TV'],
        images: ['https://example.com/room.jpg'],
      };

      await request(app.getHttpServer())
        .post(`/rooms/${testBranchId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(500);
    });
  });

  describe('GET /rooms', () => {
    it('should return list of active rooms', async () => {
      const response = await request(app.getHttpServer())
        .get('/rooms')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('room_number');
    });

    it('should filter rooms by branch_id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rooms?branch_id=${testBranchId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((room: any) => {
        expect(room.branch_id).toBe(testBranchId);
      });
    });

    it('should filter rooms by room_type', async () => {
      const response = await request(app.getHttpServer())
        .get('/rooms?room_type=deluxe')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((room: any) => {
        expect(room.room_type).toBe('deluxe');
      });
    });
  });

  describe('GET /rooms/:id', () => {
    it('should return room details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/rooms/${testRoomId}`)
        .expect(200);

      expect(response.body.id).toBe(testRoomId);
      expect(response.body).toHaveProperty('room_number');
      expect(response.body).toHaveProperty('amenities');
    });

    it('should return 404 for non-existent room', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer())
        .get(`/rooms/${fakeId}`)
        .expect(404);
    });
  });

  describe('PUT /rooms/:id', () => {
    it('should update room details', async () => {
      const updateData = {
        name: 'Updated Deluxe Room 101',
        description: 'Updated description',
        basePrice: 175000,
      };

      const response = await request(app.getHttpServer())
        .put(`/rooms/${testRoomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.base_price).toBe(updateData.basePrice);
    });

    it('should update room status', async () => {
      const updateData = { status: 'maintenance' };

      const response = await request(app.getHttpServer())
        .put(`/rooms/${testRoomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.status).toBe('maintenance');
    });
  });

  describe('DELETE /rooms/:id', () => {
    it('should soft delete room', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/rooms/${testRoomId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify room is soft deleted
      const { data } = await supabase
        .getAdminClient()
        .from('rooms')
        .select('is_active')
        .eq('id', testRoomId)
        .single();

      expect(data.is_active).toBe(false);
    });
  });
});
