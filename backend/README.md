# GLADS Backend API

NestJS backend for GLADS Hotel Management System.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your Supabase credentials.

3. **Run database schema:**
   - Go to Supabase SQL Editor
   - Run the SQL in `/database/schema.sql`

4. **Start development server:**
   ```bash
   npm run start:dev
   ```

   API will be available at: `http://localhost:3001/api`

## 📋 Available Endpoints

### Health Check
- `GET /api` - Welcome message
- `GET /api/health` - Health status

### Auth
- `GET /api/auth/me` - Get current user (protected)
- `GET /api/auth/test` - Test auth module

### Branches
- `GET /api/branches` - Get all branches
- `GET /api/branches/:id` - Get branch by ID
- `POST /api/branches` - Create branch (protected)
- `PUT /api/branches/:id` - Update branch (protected)
- `DELETE /api/branches/:id` - Delete branch (protected)

## 🔧 Development Commands

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Linting
npm run lint

# Testing
npm run test
```

## 📦 Project Structure

```
src/
├── auth/           # Authentication & authorization
├── branches/       # Branches module
├── supabase/       # Supabase client service
├── app.module.ts   # Root module
└── main.ts         # Application entry point
```

## 🔐 Environment Variables

See `.env.example` for required configuration.

## 📝 Next Steps

1. ✅ Basic setup complete
2. Add Rooms module
3. Add Bookings module
4. Add Pesapal integration
5. Add remaining modules
