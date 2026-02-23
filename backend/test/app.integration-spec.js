"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const request = require("supertest");
const app_module_1 = require("../src/app.module");
describe('App Integration Tests', () => {
    let app;
    beforeAll(async () => {
        const moduleFixture = await testing_1.Test.createTestingModule({
            imports: [app_module_1.AppModule],
        }).compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    });
    afterAll(async () => {
        await app.close();
    });
    it('GET / should return welcome message', async () => {
        const response = await request(app.getHttpServer()).get('/').expect(200);
        expect(response.text).toContain('Welcome to GLADS Hotel Management API');
    });
    it('GET /health should return service health', async () => {
        const response = await request(app.getHttpServer()).get('/health').expect(200);
        expect(response.body.status).toBe('ok');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('service');
    });
});
//# sourceMappingURL=app.integration-spec.js.map