import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth Module (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/auth/test (GET)', () => {
    it('should return auth test information', () => {
      return request(app.getHttpServer())
        .get('/api/auth/test')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });

  describe('/api/auth/register-staff (POST)', () => {
    it('should register a new staff member', () => {
      const registerDto = {
        email: `test-${Date.now()}@glads.com`,
        password: 'TestPass123!',
        fullName: 'Test Admin',
        phone: '+254712345678',
        role: 'admin',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register-staff')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('token');
          expect(res.body.user.email).toBe(registerDto.email);
          
          // Save for later tests
          authToken = res.body.token;
          userId = res.body.user.id;
        });
    });

    it('should fail with invalid email', () => {
      const invalidDto = {
        email: 'invalid-email',
        password: 'TestPass123!',
        fullName: 'Test User',
        phone: '+254712345678',
        role: 'staff',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register-staff')
        .send(invalidDto)
        .expect(400);
    });

    it('should fail with weak password', () => {
      const weakPasswordDto = {
        email: 'test@glads.com',
        password: '123',
        fullName: 'Test User',
        phone: '+254712345678',
        role: 'staff',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register-staff')
        .send(weakPasswordDto)
        .expect(400);
    });

    it('should fail with missing required fields', () => {
      const incompleteDto = {
        email: 'test@glads.com',
        // Missing password, fullName, etc.
      };

      return request(app.getHttpServer())
        .post('/api/auth/register-staff')
        .send(incompleteDto)
        .expect(400);
    });
  });

  describe('/api/auth/me (GET)', () => {
    it('should return current user profile with valid token', () => {
      if (!authToken) {
        console.log('Skipping: No auth token available');
        return;
      }

      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('fullName');
        });
    });

    it('should fail without authentication token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/api/auth/profile (PUT)', () => {
    it('should update user profile', () => {
      if (!authToken) {
        console.log('Skipping: No auth token available');
        return;
      }

      const updateDto = {
        fullName: 'Updated Name',
        phone: '+254712345679',
      };

      return request(app.getHttpServer())
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.fullName).toBe(updateDto.fullName);
          expect(res.body.phone).toBe(updateDto.phone);
        });
    });

    it('should fail without authentication', () => {
      const updateDto = {
        fullName: 'Updated Name',
      };

      return request(app.getHttpServer())
        .put('/api/auth/profile')
        .send(updateDto)
        .expect(401);
    });
  });

  describe('/api/auth/change-password (PUT)', () => {
    it('should fail with incorrect current password', () => {
      if (!authToken) {
        console.log('Skipping: No auth token available');
        return;
      }

      const changePasswordDto = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPass123!',
      };

      return request(app.getHttpServer())
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(changePasswordDto)
        .expect(400);
    });

    it('should fail without authentication', () => {
      const changePasswordDto = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      };

      return request(app.getHttpServer())
        .put('/api/auth/change-password')
        .send(changePasswordDto)
        .expect(401);
    });
  });
});
