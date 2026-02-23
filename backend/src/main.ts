import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

const BODY_LIMIT = '50mb';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.use(json({ limit: BODY_LIMIT }));
  app.use(urlencoded({ extended: true, limit: BODY_LIMIT }));

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('GLADS Hotel Management API')
    .setDescription('Complete API documentation for GLADS Multi-Branch Hotel Management System')
    .setVersion('1.0')
    .setContact('Ishukwe Fiacre', 'https://github.com/Iacre/glads', 'contact@glads.rw')
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Branches', 'Branch management endpoints')
    .addTag('Rooms', 'Room management and availability endpoints')
    .addTag('Bookings', 'Booking management endpoints')
    .addTag('Services', 'Service management endpoints')
    .addTag('Service Bookings', 'Service booking endpoints')
    .addTag('Menu', 'Menu categories and items endpoints')
    .addTag('News', 'News and updates endpoints')
    .addTag('Team', 'Team members management')
    .addTag('Notifications', 'Notification system endpoints')
    .addTag('Payments', 'Payment processing endpoints')
    .addTag('Analytics', 'Analytics and reporting endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Testimonials', 'Guest testimonials endpoints')
    .addTag('Feedback', 'Guest feedback endpoints')
    .addTag('Special Offers', 'Promotions and special offers endpoints')
    .addTag('Contact', 'Contact and inquiry endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'GLADS API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 GLADS Backend API running on: http://localhost:${port}/api`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
