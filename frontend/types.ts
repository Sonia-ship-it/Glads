
export enum Branch {
  NDERA = 'Ndera',
  KANOMBE = 'Kanombe',
  KABEZA = 'Kabeza'
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  features: string[];
  amenities: string[];
  view3D?: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'Wellness & Fitness' | 'Food & Entertainment' | 'Business & Events' | 'Beauty & Care' | 'Convenience' | 'Family Services';
  icon?: string;
  description?: string;
  fullDescription?: string;
  longDescription?: string;
  hours?: string;
  pricing?: string;

  // Optional richer mini-page content
  coverImage?: string;
  highlights?: string[];
  inclusions?: string[];
  goodToKnow?: string[];
  gallery?: string[];
  videos?: Array<{ title?: string; url: string }>;
  faqs?: Array<{ q: string; a: string }>;
}

export interface BranchData {
  id: Branch;
  fullName: string;
  tagline: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    distance: string;
  };
  rooms: RoomType[];
  services: Service[];
  gallery: string[];
  contact: {
    address: string;
    phone: string;
    email: string;
  };
}

export interface BookingData {
  branchId: Branch;
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'paid' | 'confirmed';
}

export interface ServiceBooking {
  id: string;
  branchId: Branch;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface ServiceRevenue {
  serviceId: string;
  serviceName: string;
  totalBookings: number;
  totalRevenue: number;
  branchRevenue: Record<Branch, number>;
  monthlyRevenue: { month: string; revenue: number }[];
  popularityScore: number;
}

export interface BranchRevenue {
  branchId: Branch;
  roomRevenue: number;
  serviceRevenue: number;
  totalRevenue: number;
  bookingCount: number;
  occupancyRate: number;
  averageBookingValue: number;
}

export type AdminRole = 'Super Admin' | 'Branch Manager' | 'Reception';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  branch?: Branch;
  permissions: string[];
}
