"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('Auth Module (e2e)', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    describe('/auth/test (GET)', () => {
        it('should return auth test information', () => {
            return request(app.getHttpServer())
                .get('/auth/test')
                .expect(200)
                .expect((res) => {
                expect(res.body).toHaveProperty('message');
                expect(res.body).toHaveProperty('timestamp');
            });
        });
    });
    describe('/auth/me (GET)', () => {
        it('should fail without authentication token', () => {
            return request(app.getHttpServer()).get('/auth/me').expect(401);
        });
    });
    describe('/auth/profile (PUT)', () => {
        it('should fail without authentication', () => {
            return request(app.getHttpServer())
                .put('/auth/profile')
                .send({ firstName: 'Updated' })
                .expect(401);
        });
    });
    describe('/auth/change-password (PUT)', () => {
        it('should fail without authentication', () => {
            return request(app.getHttpServer())
                .put('/auth/change-password')
                .send({
                currentPassword: 'OldPass123!',
                newPassword: 'NewPass123!',
            })
                .expect(401);
        });
    });
    describe('/auth/register-staff (POST)', () => {
        it('should fail without authentication', () => {
            return request(app.getHttpServer())
                .post('/auth/register-staff')
                .send({
                email: 'staff@example.com',
                firstName: 'Test',
                lastName: 'Staff',
                role: 'receptionist',
                password: 'Password123!',
            })
                .expect(401);
        });
    });
});
//# sourceMappingURL=auth.e2e-spec.js.map