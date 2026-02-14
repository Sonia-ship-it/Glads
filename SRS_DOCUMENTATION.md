# Software Requirements Specification (SRS)
# GLADS Multi-Branch Hotel Management System

**Version:** 1.0  
**Date:** February 14, 2026  
**Project:** GLADS Apartment Hotel Management Platform

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Overview](#2-system-overview)
3. [Technology Stack](#3-technology-stack)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Database Schema](#7-database-schema)
8. [API Endpoints](#8-api-endpoints)
9. [UI/UX Requirements](#9-uiux-requirements)
10. [Security Requirements](#10-security-requirements)
11. [Integration Requirements](#11-integration-requirements)

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for the GLADS Multi-Branch Hotel Management System, a comprehensive platform for managing multiple hotel branches with booking, services, menu management, and revenue tracking capabilities.

### 1.2 Scope
The system will support:
- Multi-branch hotel operations
- Room and service booking management
- Payment processing via Pesapal
- Dynamic menu management
- News and updates system
- Role-based access control
- OTA (Online Travel Agency) integration
- Real-time notifications
- Revenue analytics across branches

### 1.3 Definitions & Acronyms
- **SRS**: Software Requirements Specification
- **OTA**: Online Travel Agency
- **UX**: User Experience
- **UI**: User Interface
- **API**: Application Programming Interface
- **RBAC**: Role-Based Access Control

---

## 2. System Overview

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Client Layer (Next.js)                │
│   React + TypeScript + Mobile-First Responsive Design   │
├─────────────────────────────────────────────────────────┤
│                  Branch Selection Logic                  │
│        (Context-based Branch Switching - Core)          │
├─────────────────────────────────────────────────────────┤
│               API Layer (NestJS Backend)                │
│    RESTful APIs + Real-time WebSocket Notifications    │
├─────────────────────────────────────────────────────────┤
│          Database Layer (Supabase PostgreSQL)           │
│     Tables: Users, Branches, Rooms, Bookings,          │
│     Services, Menus, News, Notifications, Payments      │
│     + Supabase Auth + Supabase Storage                  │
├─────────────────────────────────────────────────────────┤
│                 External Integrations                    │
│           Pesapal Payment Gateway + Email Service        │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Core Features
1. **About Page**: Team information per branch
2. **Booking System**: Rooms and services with Pesapal integration
3. **Menu Management**: Dynamic menu creation and display
4. **News & Updates**: Announcement system
5. **Multi-Role Management**: Super Admin, Super Manager, Branch Manager, Receptionist
6. **Branch Management**: Each branch operates independently
7. **OTA Manual Sync**: Receptionists manually update room availability when booked on external platforms (Booking.com, Airbnb, etc.)
8. **Notification System**: Email + In-app notifications
9. **Media Management**: Local storage for images/videos with focus on menu presentation
10. **Revenue Analytics**: Cross-branch financial reporting

---

## 3. Technology Stack

### 3.1 Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 19+
- **Language**: TypeScript
- **Styling**: Tailwind CSS / CSS Modules
- **State Management**: React Context API / Zustand
- **Form Handling**: React Hook Form + Zod validation
- **Date Handling**: date-fns / Day.js
- **HTTP Client**: Axios / Fetch API
- **Real-time**: Socket.io-client

### 3.2 Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Database Client**: @supabase/supabase-js (native Supabase client)
- **Authentication**: Supabase Auth (JWT-based)
- **Storage**: Supabase Storage (for images/videos)
- **Validation**: Class-validator
- **Real-time**: Supabase Realtime + Socket.io
- **Caching**: In-memory caching (@nestjs/cache-manager)
- **Task Scheduling**: @nestjs/schedule

### 3.3 Third-Party Services
- **Backend Platform**: Supabase (Database + Auth + Storage + Realtime)
- **Payment Gateway**: Pesapal API
- **Email Service**: SendGrid / AWS SES / Nodemailer (or Supabase Edge Functions)

---

## 4. User Roles & Permissions

### 4.1 Role Hierarchy

```
┌──────────────────────────────────────────────────────┐
│              Super Admin (System Owner)              │
│  • System configuration & management                 │
│  • User role assignment                              │
│  • System-wide settings                              │
│  • Branch creation/deletion                          │
└──────────────────────────────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼──────────┐          ┌──────────▼───────────┐
│  Super Manager   │          │   Branch Manager     │
│  (General Mgr)   │          │   (Per Branch)       │
│  • View all      │          │  • Manage branch     │
│    branches      │          │    operations        │
│  • Revenue       │          │  • Room management   │
│    analytics     │          │  • Service setup     │
│  • Reports       │          │  • Menu management   │
│  • No system     │          │  • Staff oversight   │
│    config access │          │  • Branch analytics  │
└──────────────────┘          └──────────┬───────────┘
                                         │
                               ┌─────────▼──────────┐
                               │   Receptionist     │
                               │   (Per Branch)     │
                               │  • View bookings   │
                               │  • Create bookings │
                               │  • Update room     │
                               │    status          │
                               │  • Check-in/out    │
                               │  • Manual OTA sync │
                               └────────────────────┘
```

### 4.2 Permission Matrix

| Feature                     | Super Admin | Super Manager | Branch Manager | Receptionist |
|-----------------------------|-------------|---------------|----------------|--------------|
| **System Management**       |             |               |                |              |
| Create/Delete Branches      | ✅          | ❌            | ❌             | ❌           |
| Manage User Roles           | ✅          | ❌            | ❌             | ❌           |
| System Configuration        | ✅          | ❌            | ❌             | ❌           |
| **Analytics & Reporting**   |             |               |                |              |
| View All Branches Revenue   | ✅          | ✅            | ❌             | ❌           |
| View Branch Revenue         | ✅          | ✅            | ✅             | ❌           |
| Export Reports              | ✅          | ✅            | ✅             | ❌           |
| **Branch Management**       |             |               |                |              |
| Update Branch Info          | ✅          | ❌            | ✅             | ❌           |
| Manage Branch Team          | ✅          | ❌            | ✅             | ❌           |
| **Room Management**         |             |               |                |              |
| Add/Edit Rooms              | ✅          | ❌            | ✅             | ❌           |
| Update Room Status          | ✅          | ❌            | ✅             | ✅           |
| Upload Room Images          | ✅          | ❌            | ✅             | ❌           |
| Manual OTA Sync             | ✅          | ❌            | ✅             | ✅           |
| **Booking Management**      |             |               |                |              |
| View All Bookings           | ✅          | ✅            | ✅*            | ✅*          |
| Create Booking              | ✅          | ❌            | ✅*            | ✅*          |
| Cancel/Modify Booking       | ✅          | ❌            | ✅*            | ✅*          |
| Process Payments            | ✅          | ❌            | ✅*            | ✅*          |
| **Service Management**      |             |               |                |              |
| Add/Edit Services           | ✅          | ❌            | ✅*            | ❌           |
| Update Service Images       | ✅          | ❌            | ✅*            | ❌           |
| Book Services               | ✅          | ❌            | ✅*            | ✅*          |
| **Menu Management**         |             |               |                |              |
| Add/Edit Menu Items         | ✅          | ❌            | ✅*            | ❌           |
| Update Menu Images          | ✅          | ❌            | ✅*            | ❌           |
| View Menu                   | ✅          | ✅            | ✅             | ✅           |
| **News & Updates**          |             |               |                |              |
| Create/Edit News            | ✅          | ❌            | ✅*            | ❌           |
| Publish/Unpublish News      | ✅          | ❌            | ✅*            | ❌           |
| View News                   | ✅          | ✅            | ✅             | ✅           |

*Branch-specific only

---

## 5. Functional Requirements

### 5.1 About Page

#### 5.1.1 Branch Information Display
**FR-1.1**: The system shall display an About page for each branch with:
- Branch name and location
- Contact information (phone, email, address)
- Branch description and amenities
- Operating hours
- Google Maps integration

**FR-1.2**: The system shall display team members for each branch:
- Team member photo
- Name and position
- Brief bio
- Contact information (optional)

**FR-1.3**: Branch Manager can add/edit/remove team members for their branch

**FR-1.4**: Super Admin can manage team members across all branches

#### 5.1.2 Implementation Details
```typescript
interface TeamMember {
  id: string;
  branchId: string;
  name: string;
  position: string;
  bio: string;
  photoUrl: string;
  email?: string;
  phone?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface BranchInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  coordinates: { lat: number; lng: number };
  amenities: string[];
  operatingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  teamMembers: TeamMember[];
}
```

---

### 5.2 Booking System

#### 5.2.1 Room Booking

**FR-2.1**: Guest users can search for available rooms by:
- Branch selection
- Check-in and check-out dates
- Number of guests
- Room type/category

**FR-2.2**: The system shall display room details:
- Room type and name
- Images (carousel/gallery)
- Price per night
- Amenities
- Maximum occupancy
- Availability status
- Room description

**FR-2.3**: The system shall calculate total price including:
- Base room rate × number of nights
- Applicable taxes
- Service charges
- Dynamic pricing (optional)

**FR-2.4**: The booking process shall include:
- Guest information form (name, email, phone, ID details)
- Special requests field
- Payment processing option (Pesapal gateway or Pay at property)
- Terms and conditions acceptance

**FR-2.5**: The system shall integrate with Pesapal payment gateway for processing:
- **Payment options via Pesapal**: Credit/Debit Cards, Mobile Money (MTN, Airtel), Bank Transfer
- Redirect to Pesapal payment gateway
- Guest selects payment method on Pesapal platform
- Handle payment callbacks (success/failure)
- Store transaction reference
- Update booking status based on payment status

**FR-2.6**: Upon successful booking:
- Generate unique booking reference
- Send confirmation email to guest
- Send notification to branch receptionist
- Update room availability

**FR-2.7**: Receptionists can create bookings manually:
- Walk-in bookings
- Phone bookings
- Payment can be marked as "Pay at property"

**FR-2.8**: Booking management features:
- View booking details
- Modify booking dates (if available)
- Cancel booking with refund policy
- Check-in/check-out process
- Payment status tracking

#### 5.2.2 OTA Manual Synchronization (No Automatic Integration)

**FR-2.9**: When a room is booked on external OTA platforms (Booking.com, Airbnb, etc.), receptionists must manually update the system:
- Select the room that was booked externally
- Mark date range as unavailable/occupied
- Add OTA platform name (Booking.com, Airbnb, Expedia, etc.)
- Add external booking reference number
- System immediately removes room from website availability for those dates
- Prevents double-booking across platforms

**FR-2.10**: Receptionists can release OTA bookings when guests check out:
- Mark room as available again
- System instantly updates availability on website
- Room appears in search results immediately

**FR-2.11**: System shall maintain audit log of all OTA manual updates:
- Staff member who made the change
- Timestamp of the change
- Which room and date range affected
- OTA platform name
- External booking reference
- Action type (block/release)

**Note**: This is a manual process only. There is NO automatic synchronization with OTA platforms. Receptionists are responsible for keeping the system updated when bookings occur on external platforms.

#### 5.2.3 Service Booking

**FR-2.12**: Guests can book additional services:
- View available services per branch
- Service details (name, description, images, price)
- Add to booking or book separately
- Select date/time for service
- Quantity selection

**FR-2.13**: Service booking shall support:
- Standalone service bookings (without room)
- Add services to existing room bookings
- Payment via Pesapal gateway (cards, mobile money, bank transfer)
- Email confirmation

**FR-2.14**: Branch Managers can manage services:
- Add new services
- Edit service details
- Upload/update service images (base + updates)
- Set pricing and billing type (one-time or subscription)
- Enable/disable services
- Set availability schedules

#### 5.2.3.1 Gym Subscription Service

**FR-2.15**: Gym service must be subscription-based:
- Cannot be booked as one-time service
- Requires subscription period selection (daily, weekly, monthly, quarterly, yearly)
- Pricing per subscription period
- Auto-renewal option
- Subscription start and end dates tracked
- Membership card/access code generation
- Email notification before subscription expires
- Renewal reminders 7 days before expiry

**FR-2.16**: Gym subscription management:
- Members can view subscription status
- Members can cancel auto-renewal
- Members can renew expired subscriptions
- Receptionists can verify active gym memberships
- Reports on active gym members per branch

**FR-2.17**: Gym access control:
- Generate unique membership ID
- QR code for gym access (optional)
- Check-in log for gym usage
- Usage analytics per member

#### 5.2.4 Data Models

```typescript
interface Room {
  id: string;
  branchId: string;
  roomNumber: string;
  roomType: 'standard' | 'deluxe' | 'suite' | 'penthouse';
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  bedType: string;
  size: number; // square meters
  amenities: string[];
  images: MediaFile[];
  status: 'available' | 'occupied' | 'maintenance' | 'blocked';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Booking {
  id: string;
  bookingReference: string;
  branchId: string;
  roomId: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    idType: string;
    idNumber: string;
    nationality: string;
  };
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  numberOfNights: number;
  roomRate: number;
  totalAmount: number;
  taxAmount: number;
  serviceCharges: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentGateway: 'pesapal' | 'pay-at-property'; // gateway used
  pesapalPaymentMethod?: 'card' | 'mobile-money' | 'bank-transfer'; // method selected on Pesapal
  pesapalTransactionId?: string;
  source: 'website' | 'walk-in' | 'phone' | 'ota-manual';
  otaPlatform?: string;
  otaReference?: string;
  createdBy: string; // userId
  createdAt: Date;
  updatedAt: Date;
  checkedInAt?: Date;
  checkedOutAt?: Date;
}

interface Service {
  id: string;
  branchId: string;
  name: string;
  description: string;
  category: 'spa' | 'restaurant' | 'transport' | 'laundry' | 'gym' | 'other';
  price: number;
  billingType: 'one-time' | 'subscription'; // gym requires subscription
  subscriptionPeriod?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'; // for gym subscriptions
  duration?: number; // minutes (for one-time services)
  images: MediaFile[];
  isActive: boolean;
  availabilitySchedule?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  maxBookingsPerSlot?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceBooking {
  id: string;
  bookingReference: string;
  branchId: string;
  serviceId: string;
  relatedRoomBookingId?: string; // if linked to room booking
  guestInfo: {
    name: string;
    email: string;
    phone: string;
  };
  serviceDate: Date;
  serviceTime?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentGateway: 'pesapal' | 'pay-at-property';
  pesapalPaymentMethod?: 'card' | 'mobile-money' | 'bank-transfer';
  pesapalTransactionId?: string;
  subscriptionStartDate?: Date; // for gym subscriptions
  subscriptionEndDate?: Date; // for gym subscriptions
  autoRenewal?: boolean; // for gym subscriptions
  createdAt: Date;
  updatedAt: Date;
}

interface MediaFile {
  id: string;
  filename: string;
  filepath: string; // local storage path
  fileType: 'image' | 'video';
  mimeType: string;
  size: number;
  order: number;
  isBase: boolean; // true if original, false if updated
  uploadedBy: string;
  uploadedAt: Date;
}
```

---

### 5.3 Menu Management

**FR-3.1**: Each branch can maintain its own menu

**FR-3.2**: Branch Managers can:
- Create menu categories (Breakfast, Lunch, Dinner, Drinks, etc.)
- Add menu items with:
  - Item name
  - Description
  - Price
  - Category
  - Dietary information (vegetarian, vegan, gluten-free, etc.)
  - Ingredients/allergen information
  - High-quality images (primary focus for visual presentation)
  - Availability status
- Edit menu items
- Update menu item images (replace or add new images)
- Delete menu items
- Reorder items within categories

**FR-3.2.1**: Menu Image Management (Key Feature):
- Upload multiple high-quality images per menu item
- Image optimization for fast loading and sharp display
- Support for different aspect ratios (square, landscape)
- Reorder images (set featured image)
- Delete and replace images
- Preview images before publishing
- Recommended image size: minimum 800x600px

**FR-3.3**: Menu display on client (Optimized for Visual Appeal):
- Categorized menu view with beautiful image grids
- High-quality image rendering with lazy loading
- Large, clear images that showcase food items
- Image zoom/lightbox for detailed view
- Search functionality
- Filter by dietary preferences
- Price display with clear formatting
- Responsive image galleries (mobile-optimized)
- Fast image loading with optimization

**FR-3.4**: Menu availability:
- Can be enabled/disabled per branch
- Time-based availability (breakfast hours, lunch hours)

```typescript
interface MenuCategory {
  id: string;
  branchId: string;
  name: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

interface MenuItem {
  id: string;
  branchId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  images: MediaFile[];
  dietaryInfo: ('vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free')[];
  allergens: string[];
  ingredients?: string[];
  preparationTime?: number; // minutes
  isAvailable: boolean;
  availabilitySchedule?: {
    startTime: string;
    endTime: string;
  };
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 5.4 News & Updates

**FR-4.1**: Branch Managers can create news/updates for their branch

**FR-4.2**: Super Admin can create system-wide news

**FR-4.3**: News creation includes:
- Title
- Content (rich text)
- Featured image
- Category (announcement, event, promotion, maintenance)
- Target audience (all guests, registered users, staff)
- Publication date
- Expiry date (optional)
- Branch-specific or global

**FR-4.4**: News display:
- Latest news on homepage
- News archive/listing page
- Filter by category and date
- Branch-specific news based on selected branch

**FR-4.5**: News management:
- Draft, publish, unpublish status
- Edit published news
- Delete news
- Pin important announcements

```typescript
interface News {
  id: string;
  title: string;
  content: string; // HTML/Markdown
  excerpt: string;
  featuredImage: MediaFile;
  category: 'announcement' | 'event' | 'promotion' | 'maintenance';
  scope: 'global' | 'branch-specific';
  branchId?: string; // if branch-specific
  targetAudience: 'all' | 'guests' | 'staff';
  status: 'draft' | 'published' | 'unpublished';
  isPinned: boolean;
  publishedAt?: Date;
  expiresAt?: Date;
  author: string; // userId
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 5.5 Branch Management

**FR-5.1**: Super Admin can create new branches with:
- Branch name
- Location details
- Contact information
- Initial configuration

**FR-5.2**: Branch switching on client:
- Persistent branch selection across pages
- Stored in localStorage/cookies
- Branch selector component visible on all pages
- Default to user's nearest branch (geo-location optional)

**FR-5.3**: All data filtered by selected branch:
- Rooms and availability
- Services
- Menu
- Team members
- News
- Bookings (for staff)

**FR-5.4**: Branch-specific operations:
- Each branch manages its own inventory independently
- Branch Managers only see their branch data
- Receptionists only operate within their branch

```typescript
interface Branch {
  id: string;
  name: string;
  code: string; // unique identifier
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contactInfo: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  amenities: string[];
  description: string;
  images: MediaFile[];
  isActive: boolean;
  operatingHours: {
    day: string;
    open: string;
    close: string;
  }[];
  settings: {
    currency: string;
    timezone: string;
    taxRate: number;
    serviceChargeRate: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 5.6 Notification System

**FR-6.1**: Email Notifications sent for:
- Booking confirmation (to guest)
- Booking modification (to guest)
- Booking cancellation (to guest)
- New booking alert (to receptionist)
- Payment confirmation
- Check-in reminder (24 hours before)
- Check-out reminder
- Service booking confirmation
- Password reset
- Account creation

**FR-6.2**: In-App Notifications for staff:
- New booking received
- Payment received
- Booking modification
- Booking cancellation
- OTA room update needed
- System announcements
- Low inventory alerts

**FR-6.3**: Notification features:
- Mark as read/unread
- Notification center/inbox
- Real-time push notifications (WebSocket)
- Notification preferences per user
- Notification history

```typescript
interface Notification {
  id: string;
  recipientId: string; // userId
  recipientRole: string; // for role-based notifications
  branchId?: string; // branch-specific notifications
  type: 'booking' | 'payment' | 'system' | 'alert';
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[]; // {{bookingReference}}, {{guestName}}, etc.
  category: 'booking' | 'payment' | 'account';
}
```

---

### 5.7 User Management

**FR-7.1**: Super Admin can:
- Create user accounts for all roles
- Assign roles and permissions
- Assign users to specific branches
- Deactivate/activate users
- Reset passwords

**FR-7.2**: Branch Managers can:
- Create receptionist accounts for their branch
- Manage their branch staff

**FR-7.3**: User authentication:
- Email and password login
- Password requirements (min 8 chars, uppercase, lowercase, number, special char)
- Password reset via email
- Session management with JWT
- Auto-logout after inactivity

**FR-7.4**: User profile:
- Basic information (name, email, phone)
- Profile picture
- Role and branch assignment
- Activity history
- Notification preferences

```typescript
interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profilePicture?: string;
  role: 'super-admin' | 'super-manager' | 'branch-manager' | 'receptionist';
  branchId?: string; // for branch-specific roles
  permissions: string[];
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    categories: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 5.8 Revenue & Analytics

**FR-8.1**: Super Manager can view:
- Total revenue across all branches
- Revenue breakdown by branch
- Revenue by date range
- Revenue by type (rooms, services, other)
- Occupancy rates per branch
- Booking trends and patterns
- Top performing branches
- Export reports (PDF, Excel)

**FR-8.2**: Branch Managers can view:
- Branch-specific revenue
- Daily/weekly/monthly revenue reports
- Room revenue vs service revenue
- Occupancy statistics
- Booking sources (website, walk-in, OTA)
- Pesapal payment method breakdown (card, mobile money, bank transfer)
- Peak seasons and trends

**FR-8.3**: Dashboard KPIs:
- Total revenue
- Total bookings
- Average occupancy rate
- Average booking value
- Guest satisfaction scores (if implemented)
- Pending payments
- Upcoming check-ins/check-outs

```typescript
interface RevenueReport {
  branchId?: string; // null for all branches
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  summary: {
    totalRevenue: number;
    roomRevenue: number;
    serviceRevenue: number;
    otherRevenue: number;
    totalBookings: number;
    averageBookingValue: number;
    occupancyRate: number;
  };
  dailyBreakdown: {
    date: Date;
    revenue: number;
    bookings: number;
  }[];
  branchBreakdown?: {
    branchId: string;
    branchName: string;
    revenue: number;
    bookings: number;
    occupancyRate: number;
  }[];
  paymentMethodBreakdown: {
    gateway: 'pesapal' | 'pay-at-property';
    pesapalMethod?: 'card' | 'mobile-money' | 'bank-transfer';
    amount: number;
    count: number;
  }[];
}

interface GymSubscription {
  id: string;
  serviceBookingId: string;
  memberId: string; // userId
  branchId: string;
  membershipNumber: string;
  subscriptionPeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  autoRenewal: boolean;
  qrCode?: string;
  accessCode?: string;
  renewalReminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 5.9 Media Management

**FR-9.1**: Supabase Storage for images and videos:
- Upload images/videos for rooms
- Upload images/videos for services
- Upload images for menu items
- Upload images for news articles
- Upload profile pictures
- Upload branch images
- CDN-enabled delivery via Supabase
- Automatic public URLs generation

**FR-9.2**: Image handling:
- Support formats: JPG, PNG, WebP
- Maximum file size: 5MB per image
- Automatic image optimization via Supabase Image Transformation
- Multiple image upload (gallery)
- Image ordering/reordering
- Delete images
- Signed URLs for private content

**FR-9.3**: Video handling:
- Support formats: MP4, WebM
- Maximum file size: 50MB per video
- Video thumbnails generation
- Streaming support

**FR-9.4**: Base vs Updated images:
- Initial images marked as "base"
- Updated images appended to gallery
- Both base and updated images visible
- Track who uploaded and when

**FR-9.5**: Supabase Storage Buckets structure:
```
Buckets:
- room-images (public)
- service-images (public)
- menu-images (public)
- news-images (public)
- profile-pictures (public)
- branch-images (public)
- videos (public)

Path structure within buckets:
/branches/{branchId}/rooms/{roomId}/{filename}
/branches/{branchId}/services/{serviceId}/{filename}
/branches/{branchId}/menu/{menuItemId}/{filename}
/branches/{branchId}/team/{teamMemberId}/{filename}
/news/{newsId}/{filename}
/users/{userId}/{filename}
```

---

## 6. Non-Functional Requirements

### 6.1 Performance

**NFR-1.1**: Page load time shall not exceed 3 seconds on 3G connection

**NFR-1.2**: API response time shall not exceed 500ms for 95% of requests

**NFR-1.3**: Image optimization:
- Lazy loading for images below the fold
- Responsive images (srcset)
- WebP format with fallbacks
- CDN delivery (optional)

**NFR-1.4**: Database queries optimized with:
- Proper indexing
- Pagination for large datasets
- In-memory caching for frequently accessed data (branches, room listings, menu items)

**NFR-1.5**: Frontend optimization:
- Code splitting
- Tree shaking
- Minification
- Gzip compression

### 6.2 Scalability

**NFR-2.1**: System shall support up to 50 branches simultaneously

**NFR-2.2**: System shall handle 10,000 concurrent users

**NFR-2.3**: Database shall be designed to scale horizontally

**NFR-2.4**: Stateless API design for horizontal scaling

### 6.3 Availability

**NFR-3.1**: System uptime shall be 99.5% or higher

**NFR-3.2**: Scheduled maintenance windows announced 48 hours in advance

**NFR-3.3**: Database backups performed daily

**NFR-3.4**: Disaster recovery plan in place

### 6.4 Usability

**NFR-4.1**: Mobile-first design principle:
- Responsive design for all screen sizes
- Touch-friendly interface (min 44x44px touch targets)
- Optimized for mobile performance
- Progressive Web App (PWA) capabilities

**NFR-4.2**: User Interface:
- Intuitive navigation
- Consistent design language
- Maximum 3 clicks to reach any feature
- Clear visual hierarchy
- Accessible color contrast (WCAG AA)

**NFR-4.3**: User Experience:
- Smooth animations and transitions
- Loading indicators for async operations
- Error messages clear and actionable
- Form validation with helpful feedback
- Confirmation dialogs for destructive actions

**NFR-4.4**: Accessibility:
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatible
- Alt text for images
- ARIA labels where needed

### 6.5 Compatibility

**NFR-5.1**: Browser support:
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 8+)

**NFR-5.2**: Device support:
- Desktop (1920x1080 and above)
- Laptop (1366x768 and above)
- Tablet (768x1024)
- Mobile (375x667 and above)

### 6.6 Maintainability

**NFR-6.1**: Code quality:
- TypeScript for type safety
- ESLint and Prettier for code style
- Comprehensive inline documentation
- Follow SOLID principles
- DRY (Don't Repeat Yourself)

**NFR-6.2**: Version control:
- Git with feature branch workflow
- Semantic versioning
- Detailed commit messages
- Pull request reviews

**NFR-6.3**: Testing:
- Unit tests (80% coverage target)
- Integration tests for critical flows
- E2E tests for user journeys
- API testing

**NFR-6.4**: Documentation:
- API documentation (Swagger/OpenAPI)
- Component documentation
- Setup and deployment guides
- User manuals for each role

---

## 7. Database Schema

### 7.1 Tables Overview (PostgreSQL via Supabase)

```
Supabase PostgreSQL Tables:
├── users (managed by Supabase Auth + extended profile)
├── branches
├── rooms
├── room_availability (for quick lookups)
├── bookings
├── services
├── service_bookings
├── menu_categories
├── menu_items
├── news
├── notifications
├── team_members
├── payments
├── media_files
├── audit_logs
└── system_settings

Supabase Features Used:
├── Supabase Auth (user authentication)
├── Supabase Storage (media files)
├── Row Level Security (RLS policies)
└── Realtime subscriptions (notifications)
```

### 7.2 Key Indexes (PostgreSQL)

```sql
-- Users table (extended profile)
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_branch_role ON users(branch_id, role);

-- Bookings table
CREATE INDEX idx_bookings_branch_dates ON bookings(branch_id, check_in_date, check_out_date);
CREATE UNIQUE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_guest_email ON bookings((guest_info->>'email'));
CREATE INDEX idx_bookings_status ON bookings(status, payment_status);

-- Rooms table
CREATE INDEX idx_rooms_branch_status ON rooms(branch_id, status);
CREATE INDEX idx_rooms_branch_type ON rooms(branch_id, room_type);

-- Room Availability (for performance)
CREATE UNIQUE INDEX idx_room_availability_room_date ON room_availability(room_id, date);
CREATE INDEX idx_room_availability_search ON room_availability(branch_id, date, is_available);

-- Services table
CREATE INDEX idx_services_branch_active ON services(branch_id, is_active);

-- Menu Items table
CREATE INDEX idx_menu_items_branch_category ON menu_items(branch_id, category_id, is_available);

-- News table
CREATE INDEX idx_news_status_published ON news(status, published_at DESC);
CREATE INDEX idx_news_branch_scope ON news(branch_id, scope);

-- Notifications table
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id, is_read, created_at DESC);
```

### 7.3 Sample Records (PostgreSQL/Supabase)

#### Branch Table Record
```sql
-- Table: branches
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  address JSONB NOT NULL,
  coordinates JSONB NOT NULL,
  contact_info JSONB NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  description TEXT,
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  operating_hours JSONB DEFAULT '[]',
  settings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample data:
```
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "GLADS Ndera",
  "code": "NDERA",
  "address": {
    "street": "KN 5 Rd",
    "city": "Kigali",
    "state": "Kigali Province",
    "zipCode": "00000",
    "country": "Rwanda"
  },
  "coordinates": {
    "latitude": -1.9441,
    "longitude": 30.1367
  },
  "contactInfo": {
    "phone": "+250788123456",
    "email": "ndera@glads.rw",
    "whatsapp": "+250788123456"
  },
  "amenities": ["WiFi", "Parking", "Restaurant", "Spa", "Gym"],
  "description": "Modern apartment hotel in the heart of Kigali",
  "images": [...],
  "isActive": true,
  "operatingHours": [
    { "day": "Monday", "open": "00:00", "close": "23:59" },
    ...
  ],
  "settings": {
    "currency": "RWF",
    "timezone": "Africa/Kigali",
    "taxRate": 0.18,
    "serviceChargeRate": 0.10
  },
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-02-14T00:00:00Z"
}
```

#### Room Table Record
```sql
-- Table: rooms
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('standard', 'deluxe', 'suite', 'penthouse')),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  max_occupancy INTEGER NOT NULL,
  bed_type VARCHAR(100),
  size DECIMAL(10, 2),
  amenities TEXT[] DEFAULT '{}',
  images JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'blocked')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(branch_id, room_number)
);

-- Sample data:
```
```json
{
  "id": "room_ndera_101",
  "branchId": "branch_ndera_001",
  "roomNumber": "101",
  "roomType": "deluxe",
  "name": "Deluxe King Suite",
  "description": "Spacious suite with king bed and city view",
  "basePrice": 150.00,
  "maxOccupancy": 2,
  "bedType": "King",
  "size": 35,
  "amenities": ["AC", "TV", "Minibar", "Balcony", "Safe"],
  "images": [
    {
      "id": "img_001",
      "filename": "room-101-main.jpg",
      "filepath": "/uploads/branches/branch_ndera_001/rooms/room_ndera_101/images/room-101-main.jpg",
      "fileType": "image",
      "mimeType": "image/jpeg",
      "size": 245678,
      "order": 1,
      "isBase": true,
      "uploadedBy": "user_admin_001",
      "uploadedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "status": "available",
  "isActive": true,
  "createdAt": "2026-01-15T00:00:00Z",
  "updatedAt": "2026-02-10T00:00:00Z"
}
```

#### Booking Table Record
```sql
-- Table: bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(100) UNIQUE NOT NULL,
  branch_id UUID NOT NULL REFERENCES branches(id),
  room_id UUID NOT NULL REFERENCES rooms(id),
  guest_info JSONB NOT NULL,
  check_in_date TIMESTAMPTZ NOT NULL,
  check_out_date TIMESTAMPTZ NOT NULL,
  number_of_guests INTEGER NOT NULL,
  number_of_nights INTEGER NOT NULL,
  room_rate DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  service_charges DECIMAL(10, 2) DEFAULT 0,
  special_requests TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_gateway VARCHAR(50) CHECK (payment_gateway IN ('pesapal', 'pay-at-property')),
  pesapal_payment_method VARCHAR(50) CHECK (pesapal_payment_method IN ('card', 'mobile-money', 'bank-transfer')),
  pesapal_transaction_id VARCHAR(255),
  source VARCHAR(50) CHECK (source IN ('website', 'walk-in', 'phone', 'ota-manual')),
  ota_platform VARCHAR(100),
  ota_reference VARCHAR(255),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in_at TIMESTAMPTZ,
  checked_out_at TIMESTAMPTZ
);

-- Sample data:
```
```json
{
  "id": "booking_001",
  "bookingReference": "GLAD-NDERA-20260214-001",
  "branchId": "branch_ndera_001",
  "roomId": "room_ndera_101",
  "guestInfo": {
    "firstName": "Jean",
    "lastName": "Uwizera",
    "email": "jean@example.com",
    "phone": "+250788987654",
    "idType": "National ID",
    "idNumber": "1234567890123456",
    "nationality": "Rwandan"
  },
  "checkInDate": "2026-02-20T14:00:00Z",
  "checkOutDate": "2026-02-22T11:00:00Z",
  "numberOfGuests": 2,
  "numberOfNights": 2,
  "roomRate": 150.00,
  "totalAmount": 372.00,
  "taxAmount": 54.00,
  "serviceCharges": 30.00,
  "specialRequests": "Late check-in expected",
  "status": "confirmed",
  "paymentStatus": "paid",
  "paymentGateway": "pesapal",
  "pesapalPaymentMethod": "mobile-money",
  "pesapalTransactionId": "PSP123456789",
  "source": "website",
  "createdBy": "guest",
  "createdAt": "2026-02-14T15:30:00Z",
  "updatedAt": "2026-02-14T15:35:00Z"
}
```

---

## 8. API Endpoints

### 8.1 Authentication & Authorization

```
# Supabase Auth endpoints (via Supabase client or direct API)
POST   /auth/v1/signup              - Register new user (Supabase Auth)
POST   /auth/v1/token?grant_type=password - User login (Supabase Auth)
POST   /auth/v1/logout              - User logout (Supabase Auth)
POST   /auth/v1/token?grant_type=refresh_token - Refresh JWT (Supabase Auth)
POST   /auth/v1/recover             - Request password reset (Supabase Auth)
PUT    /auth/v1/user                - Update user (Supabase Auth)

# Custom NestJS API endpoints (for extended functionality)
POST   /api/auth/register-staff     - Register staff user (admin only, creates in Supabase + profile)
GET    /api/auth/me                 - Get current user profile (extended info)
PUT    /api/auth/profile            - Update user profile (extended fields)
PUT    /api/auth/change-password    - Change password (via Supabase Auth)
```

### 8.2 Branches

```
GET    /api/branches                - Get all active branches
GET    /api/branches/:id            - Get branch details
POST   /api/branches                - Create branch (super admin)
PUT    /api/branches/:id            - Update branch
DELETE /api/branches/:id            - Delete branch (super admin)
GET    /api/branches/:id/stats      - Get branch statistics
```

### 8.3 Rooms

```
GET    /api/branches/:branchId/rooms              - Get all rooms for branch
GET    /api/branches/:branchId/rooms/:id          - Get room details
POST   /api/branches/:branchId/rooms              - Create room
PUT    /api/branches/:branchId/rooms/:id          - Update room
DELETE /api/branches/:branchId/rooms/:id          - Delete room
GET    /api/branches/:branchId/rooms/available    - Search available rooms
POST   /api/branches/:branchId/rooms/:id/images   - Upload room images
DELETE /api/rooms/images/:imageId                 - Delete room image
PUT    /api/rooms/images/:imageId/order           - Reorder images
```

### 8.4 Bookings

```
GET    /api/bookings                           - Get bookings (filtered by role/branch)
GET    /api/bookings/:id                       - Get booking details
POST   /api/bookings                           - Create booking
PUT    /api/bookings/:id                       - Update booking
DELETE /api/bookings/:id                       - Cancel booking
POST   /api/bookings/check-availability        - Check room availability
POST   /api/bookings/:id/check-in              - Check-in guest
POST   /api/bookings/:id/check-out             - Check-out guest
POST   /api/bookings/:id/payment-callback      - Pesapal payment callback
GET    /api/bookings/:id/invoice               - Generate invoice PDF
POST   /api/bookings/ota-manual                - Manual OTA booking entry
PUT    /api/bookings/ota-manual/:id/release    - Release OTA booking
```

### 8.5 Services

```
GET    /api/branches/:branchId/services        - Get all services
GET    /api/branches/:branchId/services/:id    - Get service details
POST   /api/branches/:branchId/services        - Create service
PUT    /api/branches/:branchId/services/:id    - Update service
DELETE /api/branches/:branchId/services/:id    - Delete service
POST   /api/branches/:branchId/services/:id/images - Upload service images
```

### 8.6 Service Bookings

```
GET    /api/service-bookings                   - Get service bookings
GET    /api/service-bookings/:id               - Get service booking details
POST   /api/service-bookings                   - Create service booking
PUT    /api/service-bookings/:id               - Update service booking
DELETE /api/service-bookings/:id               - Cancel service booking
POST   /api/service-bookings/:id/complete      - Mark as completed
```

### 8.7 Menu Management

```
GET    /api/branches/:branchId/menu            - Get full menu
GET    /api/branches/:branchId/menu/categories - Get menu categories
POST   /api/branches/:branchId/menu/categories - Create category
PUT    /api/menu/categories/:id                - Update category
DELETE /api/menu/categories/:id                - Delete category

GET    /api/branches/:branchId/menu/items      - Get menu items
GET    /api/menu/items/:id                     - Get menu item details
POST   /api/branches/:branchId/menu/items      - Create menu item
PUT    /api/menu/items/:id                     - Update menu item
DELETE /api/menu/items/:id                     - Delete menu item
POST   /api/menu/items/:id/images              - Upload menu item images
PUT    /api/menu/items/reorder                 - Reorder menu items
```

### 8.8 News & Updates

```
GET    /api/news                               - Get published news
GET    /api/news/:id                           - Get news details
POST   /api/news                               - Create news
PUT    /api/news/:id                           - Update news
DELETE /api/news/:id                           - Delete news
POST   /api/news/:id/publish                   - Publish news
POST   /api/news/:id/unpublish                 - Unpublish news
POST   /api/news/:id/pin                       - Pin news
```

### 8.9 Team Members

```
GET    /api/branches/:branchId/team            - Get team members
GET    /api/team/:id                           - Get team member details
POST   /api/branches/:branchId/team            - Add team member
PUT    /api/team/:id                           - Update team member
DELETE /api/team/:id                           - Remove team member
POST   /api/team/:id/photo                     - Upload team member photo
PUT    /api/team/reorder                       - Reorder team members
```

### 8.10 Notifications

```
GET    /api/notifications                      - Get user notifications
GET    /api/notifications/unread-count         - Get unread count
PUT    /api/notifications/:id/read             - Mark as read
PUT    /api/notifications/read-all             - Mark all as read
DELETE /api/notifications/:id                  - Delete notification
GET    /api/notifications/preferences          - Get notification preferences
PUT    /api/notifications/preferences          - Update preferences
```

### 8.11 Analytics & Reports

```
GET    /api/analytics/dashboard                - Get dashboard KPIs
GET    /api/analytics/revenue                  - Get revenue report
GET    /api/analytics/occupancy                - Get occupancy report
GET    /api/analytics/bookings                 - Get booking statistics
GET    /api/analytics/branches/compare         - Compare branches (super manager)
POST   /api/analytics/export                   - Export report (PDF/Excel)
```

### 8.12 Users & Permissions

```
GET    /api/users                              - Get all users
GET    /api/users/:id                          - Get user details
POST   /api/users                              - Create user
PUT    /api/users/:id                          - Update user
DELETE /api/users/:id                          - Delete user
PUT    /api/users/:id/activate                 - Activate user
PUT    /api/users/:id/deactivate               - Deactivate user
PUT    /api/users/:id/role                     - Change user role
```

### 8.13 Payments

```
POST   /api/payments/initiate                  - Initiate Pesapal payment
POST   /api/payments/callback                  - Payment gateway callback
GET    /api/payments/:transactionId/status     - Check payment status
POST   /api/payments/verify                    - Verify payment
POST   /api/payments/refund                    - Process refund
```

---

## 9. UI/UX Requirements

### 9.1 Design Principles

**Mobile-First Approach**
- Design for smallest screens first
- Progressive enhancement for larger screens
- Touch-friendly interactions
- Swipe gestures for galleries and navigation

**Visual Hierarchy**
- Clear primary, secondary, and tertiary actions
- Important information above the fold
- Consistent spacing and alignment
- Typography scale for readability

**Color Scheme**
- Primary color: Brand identity
- Secondary colors: Calls-to-action
- Neutral colors: Backgrounds and text
- Success/Error/Warning colors: Feedback
- Dark mode support (optional)

### 9.2 Key Pages & Components

#### 9.2.1 Homepage
- Hero section with branch selector
- Quick search (dates, guests, branch)
- Featured rooms carousel
- Services overview
- Latest news/promotions
- Footer with contact info and links

#### 9.2.2 Branch Selector Component
```
┌─────────────────────────────────────┐
│  📍 Select Branch                   │
│  ┌───────────────────────────────┐ │
│  │ ○ GLADS Ndera                 │ │
│  │ ● GLADS Kanombe (Selected)    │ │
│  │ ○ GLADS Kabeza                │ │
│  └───────────────────────────────┘ │
│  ✓ Stay on this branch             │
└─────────────────────────────────────┘
```
- Visible on all pages (header/sidebar)
- Persist selection across pages
- Show branch details on hover
- Quick switch without page reload

#### 9.2.3 Room Listing Page
- Filter sidebar (price, room type, amenities)
- Grid/List view toggle
- Room cards with:
  - Primary image
  - Room name and type
  - Price per night
  - Key amenities (icons)
  - "View Details" button
- Sort options (price, rating, popularity)
- Pagination or infinite scroll

#### 9.2.4 Room Details Page
- Image gallery (full-screen lightbox)
- Room information section
- Amenities list with icons
- Pricing breakdown
- Availability calendar
- Booking form (sticky sidebar on desktop)
- Similar rooms section
- Reviews (if implemented)

#### 9.2.5 Booking Flow
```
Step 1: Select Dates & Guests
  ↓
Step 2: Choose Room
  ↓
Step 3: Guest Information
  ↓
Step 4: Review & Payment
  ↓
Step 5: Confirmation
```

Each step shows:
- Progress indicator
- Back button
- Clear next action
- Summary sidebar

#### 9.2.6 Admin Dashboard
- Sidebar navigation with role-based menu
- Dashboard cards with KPIs
- Charts (revenue, occupancy, bookings)
- Recent activity feed
- Quick actions
- Notifications dropdown

#### 9.2.7 Booking Management Interface
- Table view with filters
- Status badges (color-coded)
- Quick actions dropdown per booking
- Bulk actions (optional)
- Search and date range filters
- Export button

#### 9.2.8 About Page
- Branch hero image
- Branch description
- Amenities grid
- Location map
- Contact information
- Team section with cards:
  ```
  ┌────────────────┐
  │     Photo      │
  │   John Doe     │
  │ Branch Manager │
  │   📧 📞        │
  └────────────────┘
  ```

#### 9.2.9 Menu Page
- Category tabs/pills
- Menu items grid/list
- Item cards with:
  - Image
  - Name and price
  - Description
  - Dietary icons
  - Quick view modal
- Search functionality
- Filter by dietary preferences

#### 9.2.10 News Page
- Featured news at top
- News grid with cards
- Filter by category
- Pagination
- News detail modal/page

### 9.3 Responsive Breakpoints

```
Mobile:    320px - 767px   (1 column layouts)
Tablet:    768px - 1023px  (2 column layouts)
Desktop:   1024px - 1439px (3 column layouts)
Large:     1440px+         (4 column layouts, wider containers)
```

### 9.4 Loading States

- Skeleton screens for content loading
- Spinner for button actions
- Progress bars for file uploads
- Shimmer effect for images
- Disable buttons during submission

### 9.5 Error Handling

- Inline form validation errors
- Toast notifications for success/error messages
- Error page for 404, 500, etc.
- Retry mechanisms for failed operations
- Clear error messages with solutions

### 9.6 Animations & Transitions

- Page transitions (fade, slide)
- Micro-interactions (hover states, button clicks)
- Smooth scrolling
- Modal open/close animations
- Performance: Use CSS transforms, avoid layout thrashing

---

## 10. Security Requirements

### 10.1 Authentication & Authorization

**SEC-1.1**: Implement Supabase Auth
- Built-in JWT-based authentication
- Access token (short-lived, configurable)
- Refresh token (long-lived, configurable)
- Secure httpOnly cookies for tokens
- Email/password authentication
- Social OAuth providers (optional: Google, GitHub, etc.)
- Magic link authentication (optional)

**SEC-1.2**: Password security (via Supabase Auth)
- Minimum 8 characters (configurable)
- Automatic secure hashing (bcrypt/scrypt)
- Password reset with time-limited tokens (1 hour)
- Account lockout after failed login attempts (configurable)
- Email verification on signup

**SEC-1.3**: Role-Based Access Control (RBAC)
- Custom user roles stored in extended user profile table
- Row Level Security (RLS) policies in Supabase
- Middleware to check permissions in NestJS
- Resource-level authorization
- Branch-scoped data access via RLS

**SEC-1.4**: API security
- Rate limiting (100 requests per 15 minutes per IP)
- CORS configuration (whitelist domains)
- Supabase service role key for server-side operations
- API key authentication for webhooks

### 10.2 Data Protection

**SEC-2.1**: Data encryption
- HTTPS/TLS for all connections (enforced by Supabase)
- Encrypt sensitive data at rest (payment info, personal data)
- Environment variables for secrets (Supabase URL, service keys)
- Supabase provides encryption at rest by default

**SEC-2.2**: Input validation
- Validate all user inputs (frontend + backend)
- Sanitize HTML inputs to prevent XSS
- Parameterized queries to prevent SQL injection (via ORM)
- Supabase RLS policies for additional data access control

**SEC-2.3**: File upload security (Supabase Storage)
- Validate file types and sizes before upload
- Scan for malware (optional)
- Supabase Storage bucket policies for access control
- Generate unique filenames (UUID-based)
- Signed URLs for temporary access to private files
- Storage size limits per bucket

**SEC-2.4**: Personal data handling
- GDPR/data privacy compliance
- Data retention policies
- User consent for data processing
- Right to be forgotten (data deletion)

### 10.3 Payment Security

**SEC-3.1**: PCI DSS compliance
- Never store full credit card numbers
- Use Pesapal tokenization
- Secure payment callback verification

**SEC-3.2**: Transaction verification
- Verify payment status server-side
- Implement idempotency for payments
- Log all payment attempts

### 10.4 Audit & Logging

**SEC-4.1**: Audit logs for:
- User login/logout
- Role changes
- Booking creation/modification/cancellation
- Payment transactions
- Data modifications by admins
- Failed login attempts

**SEC-4.2**: Log retention
- Store logs for minimum 1 year
- Secure log storage
- No sensitive data in logs (passwords, credit cards)

### 10.5 Infrastructure Security

**SEC-5.1**: Server hardening
- Keep software updated
- Disable unnecessary services
- Firewall configuration
- Regular security audits

**SEC-5.2**: Database security (Supabase/PostgreSQL)
- Row Level Security (RLS) policies for all tables
- Database user with minimal privileges
- Connection pooling via Supabase
- Network isolation (Supabase manages infrastructure)
- Automatic daily backups (Supabase Pro plan)
- Point-in-time recovery (Supabase Pro plan)
- Encrypted backups

**SEC-5.3**: Environment management
- Separate environments (dev, staging, production)
- No production credentials in version control
- Secret management (environment variables, vault)

---

## 11. Integration Requirements

### 11.1 Pesapal Payment Gateway

**INT-1.1**: Integration setup
- Register application with Pesapal
- Obtain API credentials (Consumer Key, Consumer Secret)
- Configure callback URLs (IPN - Instant Payment Notification)

**INT-1.2**: Pesapal supported payment methods
- **Credit/Debit Cards**: Visa, Mastercard, American Express
- **Mobile Money**: MTN Mobile Money, Airtel Money, Vodacom M-Pesa
- **Bank Transfer**: Direct bank payments
- Customer selects payment method on Pesapal's secure platform

**INT-1.3**: Payment flow
```
1. User initiates booking/payment
2. Backend creates payment request to Pesapal
3. Pesapal returns payment redirect URL
4. User redirected to Pesapal payment page
5. User selects payment method (card, mobile money, or bank transfer)
6. User completes payment via selected method
7. Pesapal redirects back to success/failure URL
8. Pesapal sends IPN callback to backend
9. Backend verifies payment status and records payment method used
10. Update booking status
11. Send confirmation to user
```

**INT-1.4**: Required Pesapal endpoints
- POST /api/Transactions/SubmitOrderRequest - Initiate payment
- GET /api/Transactions/GetTransactionStatus - Check status

**INT-1.5**: Error handling
- Payment timeout (30 minutes)
- Payment failure scenarios
- Network errors
- Retry mechanism for verification

**INT-1.6**: Testing
- Sandbox environment for testing
- Test cards, mobile money, and bank transfer methods provided by Pesapal
- Mock payments in development

### 11.2 Email Service

**INT-2.1**: Email provider options
- SendGrid (recommended)
- AWS SES
- Mailgun
- SMTP (Gmail, custom)

**INT-2.2**: Email templates
- Booking confirmation
- Booking modification
- Booking cancellation
- Payment receipt
- Check-in reminder
- Check-out reminder
- Password reset
- Welcome email

**INT-2.3**: Email features
- HTML + Plain text versions
- Responsive email design
- Personalization (guest name, booking details)
- Attachments (invoices, receipts)
- Tracking (opens, clicks) - optional

**INT-2.4**: Sending best practices
- Queue emails for async sending
- Retry failed sends
- Bounce handling
- Unsubscribe mechanism
- SPF/DKIM/DMARC configuration

### 11.3 Map Integration (Optional)

**INT-4.1**: Google Maps API
- Branch location display
- Directions link
- Nearby attractions

### 11.5 Analytics (Optional)

**INT-5.1**: Google Analytics 4
- Track user behavior
- Conversion tracking
- Booking funnel analysis

**INT-5.2**: Internal analytics
- Custom dashboard metrics
- Revenue tracking
- Occupancy tracking

---



##