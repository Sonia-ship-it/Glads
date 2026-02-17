# GLADS Multi-Branch Hotel Management System

A comprehensive hotel management platform for managing multiple branches with booking, services, menu management, and revenue tracking.

## 🚀 Features

- **Multi-Branch Operations** - Manage multiple hotel locations independently
- **Room & Service Booking** - Complete booking system with availability management
- **Payment Integration** - Pesapal gateway (Cards, Mobile Money, Bank Transfer)
- **Dynamic Menu Management** - Visual menu system with high-quality images
- **OTA Manual Sync** - Track bookings from Booking.com, Airbnb, etc.
- **Gym Subscriptions** - Recurring membership management
- **Role-Based Access** - Super Admin, Manager, Receptionist roles
- **Real-time Notifications** - Email and in-app alerts
- **Revenue Analytics** - Cross-branch financial reporting

## 🛠️ Tech Stack

### Frontend
- **Next.js 16+** (App Router)
- **React 19+** with TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management

### Backend
- **NestJS** with TypeScript
- **Supabase** (PostgreSQL + Auth + Storage + Realtime)
- **Socket.io** for real-time features
- **Pesapal API** for payments

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account ([supabase.com](https://supabase.com))
- Pesapal merchant account

## 🔧 Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Iacre/glads.git
   cd glads
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Configure environment variables**

   Create `.env` files in both frontend and backend directories:

   **Backend `.env`:**
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key
   PESAPAL_CONSUMER_KEY=your_consumer_key
   PESAPAL_CONSUMER_SECRET=your_consumer_secret
   PESAPAL_IPN_URL=your_callback_url
   JWT_SECRET=your_jwt_secret
   ```

   **Frontend `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Set up Supabase database**
   - Run the SQL schema scripts in `/database/schema.sql`
   - Configure Row Level Security (RLS) policies
   - Set up Storage buckets (room-images, menu-images, etc.)

5. **Run the application**
   ```bash
   # Backend (port 3001)
   cd backend
   npm run start:dev

   # Frontend (port 3000)
   cd frontend
   npm run dev
   ```

## 📁 Project Structure

```
glads/
├── frontend/          # Next.js application
├── backend/           # NestJS API
├── database/          # SQL schemas and migrations
├── docs/              # Additional documentation
└── SRS_DOCUMENTATION.md  # Full requirements specification
```

## 👥 User Roles

- **Super Admin** - Full system access and configuration
- **Super Manager** - View all branches, revenue analytics
- **Branch Manager** - Manage specific branch operations
- **Receptionist** - Handle bookings and check-ins

## 🔐 Security

- Supabase Auth with JWT tokens
- Row Level Security (RLS) policies
- Secure file uploads via Supabase Storage
- PCI DSS compliant payment processing (Pesapal)

## 📖 Documentation

See [SRS_DOCUMENTATION.md](./SRS_DOCUMENTATION.md) for complete system requirements and specifications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 📞 Support

For issues and questions, please contact the development team.

---


