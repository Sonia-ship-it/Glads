# API Documentation

The GLADS backend API provides comprehensive Swagger/OpenAPI documentation.

## Accessing Documentation

Once the server is running, access the interactive API documentation at:

**📚 http://localhost:3001/api/docs**

## Features

- ✅ **Interactive API Explorer** - Test endpoints directly from browser
- ✅ **Complete Request/Response Schemas** - View all DTOs and models
- ✅ **Authentication Testing** - Test protected endpoints with JWT token
- ✅ **Request Examples** - See example payloads for all endpoints
- ✅ **Response Codes** - View all possible HTTP status codes

## API Categories

### 🔐 Authentication
- User login (Supabase Auth)
- Staff registration
- Profile management
- Password management

### 🏢 Branches
- Branch CRUD operations
- Branch statistics
- Multi-branch management

### 🛏️ Rooms
- Room management
- Availability search
- Image uploads
- Room status updates

### 📅 Bookings
- Booking creation and management
- Check-in/check-out
- OTA manual sync
- Booking modifications

### 🎯 Services
- Service management
- Service bookings
- Gym subscriptions
- Service categories

### 🍽️ Menu
- Menu categories
- Menu items
- Dietary information
- Image management

### 📰 News
- News management
- Branch-specific/global news
- Publishing system

### 👥 Team
- Team member profiles
- Branch team management

### 🔔 Notifications
- In-app notifications
- Email notifications
- Notification preferences

### 💳 Payments
- Pesapal integration
- Payment initiation
- Payment verification
- Transaction tracking

### 📊 Analytics
- Revenue reports
- Occupancy statistics
- Booking analytics
- Export functionality

### 👤 Users
- User management
- Role assignment
- User activation/deactivation

## Authentication

Most endpoints require authentication. To use protected endpoints:

1. Click **"Authorize"** button at top of Swagger UI
2. Enter your JWT token in format: `Bearer your-token-here`
3. Click **"Authorize"** to save
4. Protected endpoints will now work

## Testing Endpoints

1. Expand an endpoint
2. Click **"Try it out"**
3. Fill in required parameters
4. Click **"Execute"**
5. View response below

## Example Usage

### Create Branch
```bash
POST /api/branches
Authorization: Bearer your-token

{
  "name": "GLADS Ndera",
  "code": "NDERA",
  "address": {
    "street": "KN 5 Rd",
    "city": "Kigali",
    "state": "Kigali Province",
    "zipCode": "00000",
    "country": "Rwanda"
  },
  ...
}
```

### Search Available Rooms
```bash
GET /api/branches/{branchId}/rooms/available?checkInDate=2026-02-20&checkOutDate=2026-02-22&guests=2
```

### Create Booking
```bash
POST /api/bookings
Authorization: Bearer your-token

{
  "branchId": "uuid",
  "roomId": "uuid",
  "guestInfo": {...},
  "checkInDate": "2026-02-20T14:00:00Z",
  "checkOutDate": "2026-02-22T11:00:00Z",
  ...
}
```

## Response Format

All API responses follow consistent format:

### Success Response
```json
{
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

## Rate Limiting

- **Rate Limit**: 100 requests per 15 minutes per IP
- Headers include: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Support

For API issues or questions, refer to the SRS documentation or contact the development team.
