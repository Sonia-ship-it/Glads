"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
const supabase_service_1 = require("../src/supabase/supabase.service");
describe('Audit Logs Integration Tests', () => {
    let app;
    let supabase;
    let authToken;
    let actorUserId;
    let testAuditLogId;
    const entityId = '11111111-1111-1111-1111-111111111111';
    const timestamp = Date.now();
    const actorEmail = `audit-actor-${timestamp}@glads.test`;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
        supabase = moduleFixture.get(supabase_service_1.SupabaseService);
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
        const { data: { session }, error: signInError, } = await supabase.getClient().auth.signInWithPassword({
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
            full_name: 'Audit Logs User',
            role: 'super-admin',
            is_active: true,
        });
        const { data: seeded, error: seedError } = await supabase
            .getAdminClient()
            .from('audit_logs')
            .insert({
            user_id: actorUserId,
            action: 'update',
            entity_type: 'booking',
            entity_id: entityId,
            changes: { before: 'pending', after: 'confirmed' },
            ip_address: '127.0.0.1',
            user_agent: 'integration-test',
        })
            .select()
            .single();
        if (seedError || !seeded) {
            throw new Error(`Failed to seed audit log: ${seedError?.message}`);
        }
        testAuditLogId = seeded.id;
    });
    afterAll(async () => {
        if (testAuditLogId) {
            await supabase.getAdminClient().from('audit_logs').delete().eq('id', testAuditLogId);
        }
        if (actorUserId) {
            await supabase.getAdminClient().auth.admin.deleteUser(actorUserId);
        }
        await app.close();
    });
    it('should reject unauthenticated access', async () => {
        await request(app.getHttpServer()).get('/audit-logs').expect(401);
    });
    it('should get audit logs with filters', async () => {
        const response = await request(app.getHttpServer())
            .get(`/audit-logs?userId=${actorUserId}&entityType=booking&limit=10`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.some((log) => log.id === testAuditLogId)).toBe(true);
    });
    it('should get audit logs by entity', async () => {
        const response = await request(app.getHttpServer())
            .get(`/audit-logs/entity/booking/${entityId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.some((log) => log.id === testAuditLogId)).toBe(true);
    });
    it('should get audit log by id', async () => {
        const response = await request(app.getHttpServer())
            .get(`/audit-logs/${testAuditLogId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(response.body.id).toBe(testAuditLogId);
        expect(response.body.action).toBe('update');
    });
});
//# sourceMappingURL=audit-logs.integration-spec.js.map