"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const supabase_service_1 = require("../src/supabase/supabase.service");
describe('News Integration Tests', () => {
    let app;
    let supabase;
    let authToken;
    let testBranchId;
    let testNewsId;
    let testUserId;
    const timestamp = Date.now();
    const testEmail = `news-test-${timestamp}@glads.test`;
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
            full_name: 'News Test Admin',
            role: 'super-admin',
            is_active: true,
        });
        const { data: branch, error: branchError } = await supabase
            .getAdminClient()
            .from('branches')
            .insert({
            name: 'Test Branch for News',
            code: `TEST-NEWS-${timestamp}`,
            address: { street: 'Test St', city: 'Kigali', country: 'Rwanda' },
            coordinates: { latitude: -1.9441, longitude: 30.1367 },
            contact_info: { phone: '+250788002222', email: 'news@test.rw' },
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
        if (testNewsId) {
            await supabase.getAdminClient().from('news').delete().eq('id', testNewsId);
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
    describe('POST /news', () => {
        it('should reject unauthenticated request', async () => {
            await request(app.getHttpServer())
                .post('/news')
                .send({
                authorId: testUserId,
                title: 'Unauthorized News',
                content: 'Content',
                category: 'announcement',
                scope: 'global',
                targetAudience: 'all',
            })
                .expect(401);
        });
        it('should create a published news article', async () => {
            const payload = {
                authorId: testUserId,
                title: `Grand Opening ${timestamp}`,
                content: 'We are opening a new branch next month.',
                excerpt: 'New branch opening soon.',
                category: 'announcement',
                imageUrl: 'https://example.com/news.jpg',
                scope: 'global',
                targetAudience: 'all',
            };
            const response = await request(app.getHttpServer())
                .post('/news')
                .set('Authorization', `Bearer ${authToken}`)
                .send(payload)
                .expect(201);
            expect(response.body).toHaveProperty('id');
            expect(response.body.title).toBe(payload.title);
            expect(response.body.category).toBe(payload.category);
            expect(response.body.status).toBe('published');
            testNewsId = response.body.id;
        });
    });
    describe('GET /news', () => {
        it('should return published news', async () => {
            const response = await request(app.getHttpServer()).get('/news').expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.some((item) => item.id === testNewsId)).toBe(true);
        });
        it('should filter news by category', async () => {
            const response = await request(app.getHttpServer())
                .get('/news?category=announcement')
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach((item) => {
                expect(item.category).toBe('announcement');
            });
        });
        it('should filter news by scope', async () => {
            const response = await request(app.getHttpServer()).get('/news?scope=global').expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach((item) => {
                expect(item.scope).toBe('global');
            });
        });
    });
    describe('GET /news/:id', () => {
        it('should return news details', async () => {
            const response = await request(app.getHttpServer()).get(`/news/${testNewsId}`).expect(200);
            expect(response.body.id).toBe(testNewsId);
            expect(response.body).toHaveProperty('title');
            expect(response.body).toHaveProperty('content');
        });
        it('should return 404 for non-existent news item', async () => {
            const fakeId = '00000000-0000-0000-0000-000000000000';
            await request(app.getHttpServer()).get(`/news/${fakeId}`).expect(404);
        });
    });
    describe('PATCH /news/:id', () => {
        it('should update a news article', async () => {
            const updateData = {
                title: `Updated News ${timestamp}`,
                category: 'promotion',
                targetAudience: 'staff',
                isPinned: true,
            };
            const response = await request(app.getHttpServer())
                .patch(`/news/${testNewsId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);
            expect(response.body.title).toBe(updateData.title);
            expect(response.body.category).toBe(updateData.category);
            expect(response.body.target_audience).toBe(updateData.targetAudience);
            expect(response.body.is_pinned).toBe(true);
        });
    });
    describe('DELETE /news/:id', () => {
        it('should soft delete news by setting status to unpublished', async () => {
            await request(app.getHttpServer())
                .delete(`/news/${testNewsId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            const { data } = await supabase
                .getAdminClient()
                .from('news')
                .select('status')
                .eq('id', testNewsId)
                .single();
            expect(data.status).toBe('unpublished');
        });
    });
});
//# sourceMappingURL=news.integration-spec.js.map