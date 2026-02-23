"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const supabase_service_1 = require("../src/supabase/supabase.service");
describe('Menu Integration Tests', () => {
    let app;
    let supabase;
    let authToken;
    let testBranchId;
    let testMenuId;
    let testUserId;
    const timestamp = Date.now();
    const testEmail = `menu-test-${timestamp}@glads.test`;
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
            full_name: 'Menu Test Admin',
            role: 'super-admin',
            is_active: true,
        });
        const { data: branch, error: branchError } = await supabase
            .getAdminClient()
            .from('branches')
            .insert({
            name: 'Test Branch for Menu',
            code: `TEST-MENU-${timestamp}`,
            address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
            coordinates: { latitude: -1.9441, longitude: 30.1367 },
            contact_info: { phone: '+250788003333', email: 'menu@test.rw' },
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
        if (testMenuId) {
            await supabase.getAdminClient().from('menus').delete().eq('id', testMenuId);
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
    it('should reject unauthenticated menu access', async () => {
        await request(app.getHttpServer()).get('/menu').expect(401);
    });
    it('should create menu with valid payload', async () => {
        const payload = {
            name: 'February 2026 Menu',
            menuUrl: 'https://example.com/menu-feb-2026.pdf',
            effectiveDate: '2026-02-20',
            description: 'Seasonal menu',
        };
        const response = await request(app.getHttpServer())
            .post(`/menu/${testBranchId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(payload)
            .expect(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toBe(payload.name);
        expect(response.body.menu_url).toBe(payload.menuUrl);
        testMenuId = response.body.id;
    });
    it('should list menus', async () => {
        const response = await request(app.getHttpServer())
            .get('/menu')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.some((menu) => menu.id === testMenuId)).toBe(true);
    });
    it('should filter menus by branchId', async () => {
        const response = await request(app.getHttpServer())
            .get(`/menu?branchId=${testBranchId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(Array.isArray(response.body)).toBe(true);
        response.body.forEach((menu) => {
            expect(menu.branch_id).toBe(testBranchId);
        });
    });
    it('should get a menu by id', async () => {
        const response = await request(app.getHttpServer())
            .get(`/menu/${testMenuId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(response.body.id).toBe(testMenuId);
    });
    it('should update menu', async () => {
        const response = await request(app.getHttpServer())
            .patch(`/menu/${testMenuId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ description: 'Updated menu description' })
            .expect(200);
        expect(response.body.description).toBe('Updated menu description');
    });
    it('should soft delete menu', async () => {
        await request(app.getHttpServer())
            .delete(`/menu/${testMenuId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        const { data } = await supabase
            .getAdminClient()
            .from('menus')
            .select('is_active')
            .eq('id', testMenuId)
            .single();
        expect(data.is_active).toBe(false);
    });
});
//# sourceMappingURL=menu.integration-spec.js.map