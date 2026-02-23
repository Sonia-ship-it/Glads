"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const supabase_service_1 = require("../src/supabase/supabase.service");
describe('Team Integration Tests', () => {
    let app;
    let supabase;
    let authToken;
    let testBranchId;
    let testTeamMemberId;
    let testUserId;
    const timestamp = Date.now();
    const testEmail = `team-test-${timestamp}@glads.test`;
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
            full_name: 'Team Test Admin',
            role: 'super-admin',
            is_active: true,
        });
        const { data: branch, error: branchError } = await supabase
            .getAdminClient()
            .from('branches')
            .insert({
            name: 'Test Branch for Team',
            code: `TEST-TEAM-${timestamp}`,
            address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
            coordinates: { latitude: -1.9441, longitude: 30.1367 },
            contact_info: { phone: '+250788001111', email: 'team@test.rw' },
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
        if (testTeamMemberId) {
            await supabase.getAdminClient().from('team_members').delete().eq('id', testTeamMemberId);
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
    describe('POST /team/:branchId', () => {
        it('should reject unauthenticated request', async () => {
            await request(app.getHttpServer())
                .post(`/team/${testBranchId}`)
                .send({
                fullName: 'Unauth Test',
                position: 'Manager',
                department: 'Operations',
            })
                .expect(401);
        });
        it('should create a new team member with valid data', async () => {
            const payload = {
                fullName: 'Jane Team Lead',
                position: 'Branch Manager',
                department: 'Management',
                bio: 'Experienced manager',
                email: 'jane.team@example.com',
                phone: '+250788123400',
                displayOrder: 1,
            };
            const response = await request(app.getHttpServer())
                .post(`/team/${testBranchId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(payload)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.full_name).toBe(payload.fullName);
            expect(response.body.position).toBe(payload.position);
            expect(response.body.department).toBe(payload.department);
            expect(response.body.is_active).toBe(true);
            testTeamMemberId = response.body.id;
        });
    });
    describe('GET /team', () => {
        it('should return all active team members', async () => {
            const response = await request(app.getHttpServer()).get('/team').expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.some((member) => member.id === testTeamMemberId)).toBe(true);
        });
        it('should filter team members by branchId', async () => {
            const response = await request(app.getHttpServer())
                .get(`/team?branchId=${testBranchId}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach((member) => {
                expect(member.branch_id).toBe(testBranchId);
            });
        });
        it('should filter team members by department', async () => {
            const response = await request(app.getHttpServer())
                .get('/team?department=Management')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach((member) => {
                expect(member.department).toBe('Management');
            });
        });
    });
    describe('GET /team/:id', () => {
        it('should return team member details', async () => {
            const response = await request(app.getHttpServer())
                .get(`/team/${testTeamMemberId}`)
                .expect(200);
            expect(response.body.id).toBe(testTeamMemberId);
            expect(response.body).toHaveProperty('full_name');
            expect(response.body).toHaveProperty('position');
        });
        it('should return 404 for non-existent team member', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            await request(app.getHttpServer()).get(`/team/${fakeId}`).expect(404);
        });
    });
    describe('PATCH /team/:id', () => {
        it('should update team member details', async () => {
            const updateData = {
                position: 'Regional Manager',
                displayOrder: 2,
            };
            const response = await request(app.getHttpServer())
                .patch(`/team/${testTeamMemberId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);
            expect(response.body.position).toBe(updateData.position);
            expect(response.body.display_order).toBe(updateData.displayOrder);
        });
    });
    describe('DELETE /team/:id', () => {
        it('should soft delete team member', async () => {
            await request(app.getHttpServer())
                .delete(`/team/${testTeamMemberId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            const { data } = await supabase
                .getAdminClient()
                .from('team_members')
                .select('is_active')
                .eq('id', testTeamMemberId)
                .single();
            expect(data.is_active).toBe(false);
        });
    });
});
//# sourceMappingURL=team.integration-spec.js.map