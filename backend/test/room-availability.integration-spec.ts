import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('Room Availability Integration Tests', () => {
  let app: INestApplication;
  let supabase: SupabaseService;
  let authToken: string;
  let actorUserId: string | undefined;
  let testBranchId: string;
  let testRoomId: string;
  let testAvailabilityId: string;

  const timestamp = Date.now();
  const actorEmail = `availability-actor-${timestamp}@glads.test`;
  const testDate = '2026-03-01';
  const testEndDate = '2026-03-05';

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
      full_name: 'Availability Admin',
      role: 'super-admin',
      is_active: true,
    });

    const { data: branch, error: branchError } = await supabase
      .getAdminClient()
      .from('branches')
      .insert({
        name: 'Test Branch for Availability',
        code: `TEST-AVAIL-${timestamp}`,
        address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
        coordinates: { latitude: -1.9441, longitude: 30.1367 },
        contact_info: { phone: '+250788005555', email: 'availability@test.rw' },
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
        room_number: `A-${timestamp.toString().slice(-3)}`,
        floor: 1,
        room_type: 'standard',
        name: 'Availability Test Room',
        base_price: 100000,
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
  });

  afterAll(async () => {
    if (testAvailabilityId) {
      await supabase
        .getAdminClient()
        .from('room_availability')
        .delete()
        .eq('id', testAvailabilityId);
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

  it('should create room availability entry', async () => {
    const response = await request(app.getHttpServer())
      .post(`/room-availability/branch/${testBranchId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: testRoomId,
        date: testDate,
        isAvailable: true,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.room_id).toBe(testRoomId);
    testAvailabilityId = response.body.id;
  });

  it('should fetch availability by date range', async () => {
    const response = await request(app.getHttpServer())
      .get(
        `/room-availability?branchId=${testBranchId}&startDate=${testDate}&endDate=${testEndDate}`,
      )
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((entry: any) => entry.id === testAvailabilityId)).toBe(true);
  });

  it('should fetch room availability for specific room', async () => {
    const response = await request(app.getHttpServer())
      .get(`/room-availability/room/${testRoomId}?startDate=${testDate}&endDate=${testEndDate}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.some((entry: any) => entry.id === testAvailabilityId)).toBe(true);
  });

  it('should update availability entry', async () => {
    const response = await request(app.getHttpServer())
      .put(`/room-availability/${testAvailabilityId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ isAvailable: false })
      .expect(200);

    expect(response.body.is_available).toBe(false);
  });

  it('should bulk update availability', async () => {
    const response = await request(app.getHttpServer())
      .put('/room-availability/bulk')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        roomId: testRoomId,
        startDate: testDate,
        endDate: testEndDate,
        isAvailable: true,
      })
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should delete availability entry', async () => {
    await request(app.getHttpServer())
      .delete(`/room-availability/${testAvailabilityId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    const { data } = await supabase
      .getAdminClient()
      .from('room_availability')
      .select('id')
      .eq('id', testAvailabilityId);

    expect(data?.length || 0).toBe(0);
    testAvailabilityId = '';
  });
});
