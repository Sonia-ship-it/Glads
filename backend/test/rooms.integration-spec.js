"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const supabase_service_1 = require("../src/supabase/supabase.service");
describe('Rooms Integration Tests', () => {
    let app;
    let supabase;
    let authToken;
    let testBranchId;
    let testRoomId;
    let testUserId;
    const timestamp = Date.now();
    const testEmail = `rooms-test-${timestamp}@glads.test`;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        supabase = moduleFixture.get(supabase_service_1.SupabaseService);
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
        const { data: { session }, error: signInError, } = await supabase.getClient().auth.signInWithPassword({
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
            full_name: 'Rooms Test Admin',
            role: 'super-admin',
            is_active: true,
        });
        const { data: branch, error: branchError } = await supabase
            .getAdminClient()
            .from('branches')
            .insert({
            name: 'Test Branch for Rooms',
            code: `TEST-ROOMS-${timestamp}`,
            address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
            coordinates: { latitude: -1.9441, longitude: 30.1367 },
            contact_info: { phone: '+250788000000', email: 'rooms@test.rw' },
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
    describe('POST /rooms/:branchId', () => {
        it('should create a new room with valid data', async () => {
            const roomData = {
                branchId: testBranchId,
                roomNumber: `10${timestamp.toString().slice(-1)}`,
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
                roomNumber: `10${timestamp.toString().slice(-1)}`,
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
            const response = await request(app.getHttpServer()).get('/rooms').expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.some((room) => room.id === testRoomId)).toBe(true);
        });
        it('should filter rooms by branchId', async () => {
            const response = await request(app.getHttpServer())
                .get(`/rooms?branchId=${testBranchId}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach((room) => {
                expect(room.branch_id).toBe(testBranchId);
            });
        });
        it('should search available rooms', async () => {
            const response = await request(app.getHttpServer())
                .get(`/rooms/search?branchId=${testBranchId}&checkInDate=2026-03-10T14:00:00Z&checkOutDate=2026-03-12T11:00:00Z&numberOfGuests=2`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });
    describe('GET /rooms/:id', () => {
        it('should return room details', async () => {
            const response = await request(app.getHttpServer()).get(`/rooms/${testRoomId}`).expect(200);
            expect(response.body.id).toBe(testRoomId);
            expect(response.body).toHaveProperty('room_number');
            expect(response.body).toHaveProperty('amenities');
        });
        it('should return 404 for non-existent room', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            await request(app.getHttpServer()).get(`/rooms/${fakeId}`).expect(404);
        });
    });
    describe('PATCH /rooms/:id', () => {
        it('should update room details', async () => {
            const updateData = {
                name: 'Updated Deluxe Room 101',
                description: 'Updated description',
                basePrice: 175000,
            };
            const response = await request(app.getHttpServer())
                .patch(`/rooms/${testRoomId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);
            expect(response.body.name).toBe(updateData.name);
            expect(response.body.base_price).toBe(updateData.basePrice);
        });
        it('should update room status', async () => {
            const updateData = { status: 'maintenance' };
            const response = await request(app.getHttpServer())
                .patch(`/rooms/${testRoomId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);
            expect(response.body.status).toBe('maintenance');
        });
    });
    describe('GET /rooms/:branchId/stats', () => {
        it('should return room stats for branch', async () => {
            const response = await request(app.getHttpServer())
                .get(`/rooms/${testBranchId}/stats`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('total');
            expect(response.body).toHaveProperty('byType');
        });
    });
    describe('DELETE /rooms/:id', () => {
        it('should soft delete room', async () => {
            await request(app.getHttpServer())
                .delete(`/rooms/${testRoomId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            const { data } = await supabase
                .getAdminClient()
                .from('rooms')
                .select('is_active, status')
                .eq('id', testRoomId)
                .single();
            expect(data.is_active).toBe(false);
            expect(data.status).toBe('blocked');
        });
    });
});
//# sourceMappingURL=rooms.integration-spec.js.map