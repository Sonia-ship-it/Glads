'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Branch, RoomType, AdminRole, Service, TeamMember } from '../types';
import { BRANCH_DATA, COMPANY_PROFILE, SPORT_PRICES } from '../constants';

// Layout Components
import { Navbar } from './layout/Navbar';
import { Footer } from './layout/Footer';

// Section Components
import { HomeSection } from './sections/HomeSection';
import { AboutSection } from './sections/AboutSection';
import { RoomsSection } from './sections/RoomsSection';
import { ServicesSection } from './sections/ServicesSection';
import { GallerySection } from './sections/GallerySection';
import { ContactSection } from './sections/ContactSection';
import { FeedbackSection } from './sections/FeedbackSection';
import { AdminSection } from './sections/AdminSection';

// Modal & Experience Components
import { BranchSelectorModal } from './modals/BranchSelectorModal';
import { LocationGuide } from './modals/LocationGuide';
import { VirtualExperience } from './modals/VirtualExperience';
import { BookingModal } from './modals/BookingModal';

// Common Components
import { CustomCursor } from './common/CustomCursor';
import { Counter } from './common/Counter';
import { ImmersivePhotoViewer } from './ImmersivePhotoViewer';
import ServiceMiniPage from './ServiceMiniPage';
import { CalendarCheck2, Coffee, Dumbbell, LayoutDashboard, Leaf, LogOut, MapPin, Presentation, Settings2, ShoppingBag, Trophy, UserCircle2, Users, UtensilsCrossed, Waves } from 'lucide-react';
import { Logo } from './Logo';
import { BranchSelector } from './BranchSelector';
import { ThemeToggle } from './ThemeToggle';
import { AdminDashboard } from './AdminDashboard';
import { LoadingScreen } from './common/LoadingScreen';
import { BookingManagement } from './BookingManagement';
import { ServiceManagement } from './ServiceManagement';
import { getStoredBranch, setStoredBranch, subscribeToBranchChanges } from '@/lib/branchSelection';

type Role = 'Customer' | 'HQ Admin' | 'Branch Admin';
type LegalDocKey = 'privacy' | 'terms' | 'booking';
type LegalDoc = 'dashboard' | 'bookings' | 'services' | 'operations' | 'profile';
type Tab = 'Home' | 'About' | 'Rooms' | 'Services' | 'Gallery' | 'Contact' | 'Admin' | 'Feedback';
type AuthUser = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  branchId?: string;
};
type BranchOption = { id: string; name: string; code?: string };

const API_BASE = 'http://localhost:3001/api';
const TEMP_SUPER_ADMIN_EMAIL = 'admin@glads.com';
const TEMP_SUPER_ADMIN_PASSWORD = 'Glads@2026@';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const REQUEST_TIMEOUT_MS = 12000;

const LEGAL_CONTENT: Record<LegalDocKey, { title: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Data We Collect',
        body: 'Glads Apartment collects booking details, contact information, branch selection, and payment reference data necessary to process reservations and provide hospitality services.',
      },
      {
        heading: 'How We Use Data',
        body: 'Your data is used to confirm reservations, provide branch-specific services, support guest communication, and maintain operational records for Ndera, Kanombe, and Kabeza.',
      },
      {
        heading: 'Branch Data Access',
        body: 'Access is role-based: branch teams can only access data for their own branch, while HQ administrators can access consolidated system-wide data.',
      },
      {
        heading: 'Security and Retention',
        body: 'We apply administrative and technical safeguards to protect data and retain records only as required for booking operations, accounting, and legal compliance.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      {
        heading: 'Service Scope',
        body: 'This website represents one brand with multiple branches. Available rooms, services, prices, and facilities are always branch-specific and may differ between locations.',
      },
      {
        heading: 'Branch Selection',
        body: 'By using the site, you agree that the currently selected branch context controls your visible services, booking availability, and reservation processing.',
      },
      {
        heading: 'Availability and Changes',
        body: 'Room and service availability is subject to operational capacity. Glads Apartment may update rates, offerings, and service details without prior notice.',
      },
      {
        heading: 'Acceptable Use',
        body: 'Users must provide accurate booking details and must not misuse forms, payment flows, or administrative features of the platform.',
      },
    ],
  },
  booking: {
    title: 'Booking Terms',
    sections: [
      {
        heading: 'Branch-Tagged Reservations',
        body: 'Every reservation is tied to the active branch at checkout. Bookings and payments are recorded with branch ID for operational and financial accuracy.',
      },
      {
        heading: 'Payment Processing',
        body: 'Payments are handled through a shared company gateway. Confirmation is valid only after successful payment authorization and internal booking validation.',
      },
      {
        heading: 'Guest Responsibilities',
        body: 'Guests must provide valid contact details and arrival information. Any special requests are subject to branch-level availability.',
      },
      {
        heading: 'Cancellation and Modification',
        body: 'Cancellation or date changes depend on selected service and branch policy. Final terms are confirmed by the concierge team during booking confirmation.',
      },
    ],
  },
};

const normalize = (v: string) => (v || '').toLowerCase().trim();
const mapNameToBranch = (name?: string): Branch => {
  const n = normalize(name || '');
  if (n.includes('kanombe')) return Branch.KANOMBE;
  if (n.includes('kabeza')) return Branch.KABEZA;
  return Branch.NDERA;
};

const mapServiceCategory = (category?: string): Service['category'] => {
  const c = normalize(category || '');
  if (c.includes('spa') || c.includes('gym') || c.includes('sauna')) return 'Wellness & Fitness';
  if (c.includes('restaurant') || c.includes('coffee') || c.includes('bar')) return 'Food & Entertainment';
  if (c.includes('conference') || c.includes('meeting') || c.includes('business')) return 'Business & Events';
  if (c.includes('beauty') || c.includes('salon')) return 'Beauty & Care';
  if (c.includes('supermarket') || c.includes('milk') || c.includes('convenience')) return 'Convenience';
  return 'Family Services';
};

const mapApiRoomToUiRoom = (room: any): RoomType => {
  const images = Array.isArray(room?.images) ? room.images : [];
  const amenities = Array.isArray(room?.amenities) ? room.amenities : [];
  const name = room?.name || room?.roomType || room?.type || 'Room';
  const description = room?.description || `${name} at Glads Apartment`;
  const price = Number(room?.base_price ?? room?.pricePerNight ?? room?.price ?? room?.rate ?? 0);
  return {
    id: room?.id || room?._id || `room-${normalize(String(name)).replace(/\s+/g, '-')}`,
    name,
    description,
    longDescription: room?.longDescription || description,
    price: Number.isFinite(price) ? price : 0,
    image: images[0] || '/hero.jpeg',
    features: amenities.slice(0, 3),
    amenities,
    view3D: room?.view3D,
  };
};

const mapApiServiceToUiService = (service: any): Service => {
  const price = Number(service?.price ?? 0);
  const category = mapServiceCategory(service?.category);
  const description = service?.description || `${service?.name || 'Service'} available at this branch`;
  return {
    id: service?.id || service?._id || `service-${normalize(String(service?.name || 'service')).replace(/\s+/g, '-')}`,
    name: service?.name || 'Service',
    category,
    icon: Array.isArray(service?.images) ? service.images[0] : undefined,
    description,
    fullDescription: service?.fullDescription || description,
    longDescription: service?.longDescription || description,
    hours: Array.isArray(service?.availableTimes) ? service.availableTimes.join(', ') : service?.hours,
    pricing: Number.isFinite(price) && price > 0 ? `${price.toLocaleString()} Frw` : service?.pricing,
  };
};

const mapApiTeamToUiTeam = (member: any): TeamMember => {
  return {
    id: member?.id || member?._id || `team-${normalize(String(member?.fullName || member?.full_name || 'member')).replace(/\s+/g, '-')}`,
    fullName: member?.fullName || member?.full_name || 'Team Member',
    position: member?.position || 'Staff',
    department: member?.department,
    bio: member?.bio,
    photoUrl: member?.photoUrl || member?.photo_url || '/hero.jpeg',
    email: member?.email,
    phone: member?.phone,
    displayOrder: member?.displayOrder ?? member?.display_order,
  };
};

const mapApiNewsToUiNews = (n: any) => {
  const imageUrl = n?.imageUrl || n?.featured_image?.url || '/hero.jpeg';
  return {
    id: n?.id || n?._id,
    title: n?.title || 'Update',
    content: n?.content || '',
    excerpt: n?.excerpt || n?.content?.slice(0, 140) || 'Latest update from Glads Apartment.',
    category: n?.category || 'announcement',
    imageUrl,
    image: imageUrl, // Alias for frontend components using .image
    scope: n?.scope || 'global',
    targetAudience: n?.target_audience || n?.targetAudience || 'all',
    branchId: n?.branch_id || n?.branchId,
    isPublished: n?.status === 'published',
    isPinned: n?.is_pinned || n?.isPinned,
  };
};

const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...(init || {}), signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

const getFriendlyApiErrorMessage = (status: number, rawBody: string): string => {
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status >= 500) return 'Server error. Please try again shortly.';
  if (status === 404) return 'Requested resource was not found.';

  let parsedMessage = '';
  try {
    const parsed = rawBody ? JSON.parse(rawBody) : null;
    const candidate = parsed?.message || parsed?.error || parsed?.details || '';
    if (Array.isArray(candidate)) parsedMessage = candidate.join(', ');
    else if (typeof candidate === 'string') parsedMessage = candidate;
  } catch {
    parsedMessage = '';
  }

  if (!parsedMessage) {
    parsedMessage = String(rawBody || '').trim();
  }

  return parsedMessage || `Request failed (${status}).`;
};

const decodeAuthUserFromToken = (token: string): AuthUser | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const raw = atob(padded);
    const parsed = JSON.parse(raw) as any;
    return {
      id: parsed?.sub,
      email: parsed?.email,
      role: parsed?.role || parsed?.user_metadata?.role || 'receptionist',
      firstName: parsed?.user_metadata?.first_name || parsed?.user_metadata?.firstName || '',
      lastName: parsed?.user_metadata?.last_name || parsed?.user_metadata?.lastName || '',
    };
  } catch {
    return null;
  }
};

const TAB_TO_PATH: Record<Tab, string> = {
  Home: '/',
  About: '/about',
  Rooms: '/rooms',
  Services: '/services',
  Gallery: '/gallery',
  Contact: '/contact',
  Admin: '/admin',
  Feedback: '/feedback',
};

const PATH_TO_TAB: Record<string, Tab> = {
  '/': 'Home',
  '/about': 'About',
  '/rooms': 'Rooms',
  '/services': 'Services',
  '/gallery': 'Gallery',
  '/contact': 'Contact',
  '/admin': 'Admin',
  '/feedback': 'Feedback',
};

type MainAppProps = {
  initialTab?: Tab;
};

const App: React.FC<MainAppProps> = ({ initialTab = 'Home' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeBranch, setActiveBranch] = useState<Branch>(Branch.NDERA);
  const [isDark, setIsDark] = useState(false);
  const [isThemeReady, setIsThemeReady] = useState(false);

  const [currentTab, setCurrentTabState] = useState<Tab>(initialTab);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [selectedRoomImage, setSelectedRoomImage] = useState<string | null>(null);
  const [bookingRoom, setBookingRoom] = useState<RoomType | null>(null);
  const [immersivePhoto, setImmersivePhoto] = useState<{ src: string; title: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole>('Super Admin');
  const [adminSection, setAdminSection] = useState<'dashboard' | 'bookings' | 'services' | 'operations' | 'profile'>('dashboard');
  const [serviceCategory, setServiceCategory] = useState<string>('all');
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [show3DView, setShow3DView] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showLocationGuide, setShowLocationGuide] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingService, setBookingService] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | null>(null);
  const [roomCheckoutStep, setRoomCheckoutStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [roomPaymentMethod, setRoomPaymentMethod] = useState<'card' | 'momo' | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [locationAnimation, setLocationAnimation] = useState({
    isAnimating: false,
    startPoint: '',
    destination: '',
    progress: 0
  });
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorActive, setCursorActive] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [stats, setStats] = useState({ locations: 0, suites: 0, satisfaction: 0 });
  const [isNavCondensed, setIsNavCondensed] = useState(false);
  const [legalDoc, setLegalDoc] = useState<LegalDocKey | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authHydrated, setAuthHydrated] = useState(false);
  const [isRestoringAuth, setIsRestoringAuth] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'receptionist',
    branchId: '',
  });
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const [liveRooms, setLiveRooms] = useState<RoomType[]>([]);
  const [liveServices, setLiveServices] = useState<Service[]>([]);
  const [liveTeamMembers, setLiveTeamMembers] = useState<TeamMember[]>([]);
  const [liveRoomBookings, setLiveRoomBookings] = useState<any[]>([]);
  const [liveServiceBookings, setLiveServiceBookings] = useState<any[]>([]);
  const [liveNews, setLiveNews] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [branchesLoaded, setBranchesLoaded] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '', profilePicture: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [opsTab, setOpsTab] = useState<'branches' | 'rooms' | 'users' | 'news' | 'team' | 'menu' | 'payments' | 'analytics' | 'settings' | 'audit'>('branches');
  const [opsLoading, setOpsLoading] = useState(false);
  const [opsMessage, setOpsMessage] = useState<string | null>(null);
  const [opsData, setOpsData] = useState({
    branches: [] as any[],
    rooms: [] as any[],
    roomStats: null as { total: number; available: number; occupied: number; maintenance: number; blocked: number; byType: Record<string, number> } | null,
    users: [] as any[],
    news: [] as any[],
    team: [] as any[],
    menu: [] as any[],
    payments: [] as any[],
    analytics: null as any,
    settings: [] as any[],
    audit: [] as any[],
  });
  const [branchCreateForm, setBranchCreateForm] = useState({
    name: '',
    code: '',
    address: '',
    latitude: '',
    longitude: '',
    phone: '',
    email: '',
    description: '',
  });
  const [userCreateForm, setUserCreateForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'receptionist',
    branchId: '',
  });
  const [newsCreateForm, setNewsCreateForm] = useState({
    title: '',
    content: '',
    category: 'announcement',
    scope: 'global',
    targetAudience: 'all',
    branchId: '',
    imageUrl: '',
  });
  const [teamCreateForm, setTeamCreateForm] = useState({
    branchId: '',
    fullName: '',
    position: '',
    department: '',
    email: '',
    phone: '',
    bio: '',
    photoUrl: '',
    displayOrder: 1,
  });
  const [menuCreateForm, setMenuCreateForm] = useState({
    branchId: '',
    name: '',
    menuUrl: '',
    effectiveDate: '',
    description: '',
  });
  const [serviceCreateForm, setServiceCreateForm] = useState({
    name: '',
    description: '',
    category: 'Wellness & Fitness' as Service['category'],
    icon: '',
    hours: '',
    pricing: '',
    branchId: '',
  });
  const [roomCreateForm, setRoomCreateForm] = useState({
    roomNumber: '',
    roomType: 'deluxe' as 'standard' | 'deluxe' | 'suite' | 'penthouse',
    floor: 1,
    name: '',
    description: '',
    basePrice: '',
    maxOccupancy: 2,
    sizeSqm: '',
    bedType: '',
    viewType: '',
    amenities: '' as string | string[],
    images: [] as string[],
  });
  const [roomSearchForm, setRoomSearchForm] = useState({ checkIn: '', checkOut: '', guests: 2 });
  const [roomSearchResults, setRoomSearchResults] = useState<any[] | null>(null);
  const [roomSearchLoading, setRoomSearchLoading] = useState(false);
  const [roomEditForm, setRoomEditForm] = useState<{
    id: string;
    roomNumber: string;
    roomType: string;
    floor: number;
    name: string;
    description: string;
    basePrice: string;
    maxOccupancy: number;
    sizeSqm: string;
    bedType: string;
    viewType: string;
    status: string;
    amenities: string;
    images: string[];
  } | null>(null);
  const [teamEditForm, setTeamEditForm] = useState<{
    id: string;
    fullName: string;
    position: string;
    department: string;
    email?: string;
    phone?: string;
    bio?: string;
    photoUrl: string;
    displayOrder?: number;
  } | null>(null);
  const [newsEditForm, setNewsEditForm] = useState<{
    id: string;
    title: string;
    content: string;
    category: string;
    scope: string;
    targetAudience: string;
    branchId?: string;
    imageUrl?: string;
    isPublished?: boolean;
    isPinned?: boolean;
  } | null>(null);
  const [serviceEditForm, setServiceEditForm] = useState<{
    id: string;
    name: string;
    description: string;
    category: Service['category'];
    icon: string;
    hours: string;
    pricing: string;
    branchId: string;
  } | null>(null);
  const [menuEditForm, setMenuEditForm] = useState<{
    id: string;
    name: string;
    menuUrl: string;
    effectiveDate: string;
    description?: string;
    branchId: string;
  } | null>(null);

  const [settingCreateForm, setSettingCreateForm] = useState({
    key: '',
    valueJson: '{}',
    description: '',
  });

  const tabFromPath = useCallback((path: string): Tab => {
    return PATH_TO_TAB[path] || 'Home';
  }, []);

  const setCurrentTab = useCallback((tab: Tab) => {
    setCurrentTabState(tab);
    const targetPath = TAB_TO_PATH[tab] || '/';
    if (pathname !== targetPath) {
      router.push(targetPath);
    }
  }, [pathname, router]);

  useEffect(() => {
    const routeTab = tabFromPath(pathname || '/');
    setCurrentTabState((prev) => (prev === routeTab ? prev : routeTab));
  }, [pathname, tabFromPath]);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Main cursor tracks exactly
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseDown = () => setCursorActive(true);
    const handleMouseUp = () => setCursorActive(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowAuthModal(true);
      }
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onScroll = () => setIsNavCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const savedBranch = localStorage.getItem('glads-selected-branch') as Branch | null;
    if (savedBranch && Object.values(Branch).includes(savedBranch)) {
      setActiveBranch(savedBranch);
    }

    const savedTheme = localStorage.getItem('glads-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(savedTheme === 'dark' || (!savedTheme && prefersDark));
    setIsThemeReady(true);
  }, []);

  useEffect(() => {
    if (!isThemeReady) return;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('glads-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('glads-theme', 'light');
    }
  }, [isDark, isThemeReady]);

  const activeBranchOption = useMemo(
    () => branchOptions.find((b) => mapNameToBranch(b.name) === activeBranch) || null,
    [branchOptions, activeBranch]
  );
  const data = useMemo(() => {
    const base = BRANCH_DATA[activeBranch];
    const useApiData = !!activeBranchOption?.id;

    // SMART GUARD: Only show section loading if we have NO live data AND the API is fetching.
    // This prevents the LoadingScreen from appearing during background re-validation.
    const roomsLoading = useApiData && apiLoading && liveRooms.length === 0;
    const servicesLoading = useApiData && apiLoading && liveServices.length === 0;
    const teamLoading = useApiData && apiLoading && liveTeamMembers.length === 0;

    return {
      ...base,
      // Seamlessly prioritize live data if it exists, otherwise use base data.
      rooms: liveRooms.length > 0 ? liveRooms : base.rooms,
      services: liveServices.length > 0 ? liveServices : base.services,
      teamMembers: liveTeamMembers.length > 0 ? liveTeamMembers : ((base as any).teamMembers || []),
      roomsLoading,
      servicesLoading,
      teamLoading,
    };
  }, [activeBranch, activeBranchOption?.id, liveRooms, liveServices, liveTeamMembers, apiLoading, branchesLoaded]);
  const mappedNews = useMemo(() => {
    if (liveNews.length === 0) return [];
    return liveNews.slice(0, 3).map((n: any) => ({
      title: n.title,
      text: n.excerpt,
      image: n.image,
    }));
  }, [liveNews]);
  const allowedAdminSections = useMemo(() => getAllowedAdminSections(adminRole), [adminRole]);
  const roleCapabilities = useMemo(() => getRoleCapabilities(adminRole), [adminRole]);
  const isAdminWorkspace = currentTab === 'Admin' && !!authUser;
  const testimonials = useMemo(() => ([
    { quote: 'An exceptional experience. The attention to detail and level of service exceeded all expectations.', initials: 'JD', name: 'James Davidson', role: 'Business Executive' },
    { quote: 'The perfect blend of luxury and comfort with impeccable hospitality from check-in to check-out.', initials: 'SM', name: 'Sarah Mitchell', role: 'Travel Blogger' },
    { quote: 'Outstanding location, elegant rooms, and a team that consistently goes above and beyond.', initials: 'MC', name: 'Michael Chen', role: 'Entrepreneur' },
  ]), []);

  const availableTabs = useMemo(() => {
    const tabs: Tab[] = ['Home', 'About', 'Rooms', 'Services', 'Gallery', 'Contact'];
    if (activeBranch === Branch.KABEZA) { // Kabeza is the residential-only branch (no services)
      return tabs.filter(t => t !== 'Services');
    }
    return tabs;
  }, [activeBranch]);

  useEffect(() => {
    if (currentTab !== 'Admin' && currentTab !== 'Feedback' && !availableTabs.includes(currentTab as any)) {
      setCurrentTab('Home');
    }
  }, [activeBranch, availableTabs, currentTab]);

  const mapBackendRoleToAdminRole = (role?: string): AdminRole => {
    const normalized = (role || '').toUpperCase();
    if (normalized.includes('SUPER')) return 'Super Admin';
    if (normalized.includes('BRANCH')) return 'Branch Manager';
    if (normalized.includes('RECEPTION')) return 'Reception';
    if (normalized.includes('RECEPTIONIST')) return 'Reception';
    return 'Reception';
  };

  function getAllowedAdminSections(role: AdminRole): LegalDoc[] {
    if (role === 'Reception') return ['dashboard', 'bookings', 'profile'];
    if (role === 'Branch Manager') return ['dashboard', 'bookings', 'services', 'operations', 'profile'];
    return ['dashboard', 'bookings', 'services', 'operations', 'profile'];
  }

  function getRoleCapabilities(role: AdminRole): string[] {
    if (role === 'Super Admin') {
      return [
        'Manage branches (create, update, delete)',
        'Register staff accounts and assign branch/role',
        'View analytics, payments, and cross-branch performance',
        'Access all bookings, rooms, services, team, news, and menus',
        'Manage system settings and audit logs',
      ];
    }
    if (role === 'Branch Manager') {
      return [
        'Manage branch rooms, services, team members, and menus',
        'Track branch bookings and operational performance',
        'Update branch-level content and service availability',
        'Handle branch service bookings and guest operations',
      ];
    }
    return [
      'Manage day-to-day bookings and guest check-in/check-out',
      'Handle front-desk booking updates and cancellations',
      'Support service booking completion workflows',
    ];
  }

  const uiRoleLabel = (role: AdminRole): string => {
    if (role === 'Reception') return 'Receptionist';
    return role;
  };

  const allOpsTabs: Array<'branches' | 'rooms' | 'users' | 'news' | 'team' | 'menu' | 'payments' | 'analytics' | 'settings' | 'audit'> = [
    'branches', 'rooms', 'users', 'news', 'team', 'menu', 'payments', 'analytics', 'settings', 'audit',
  ];

  const allowedOpsTabs = useMemo(() => {
    if (adminRole === 'Super Admin') return allOpsTabs;
    if (adminRole === 'Branch Manager') return ['branches', 'rooms', 'news', 'team', 'menu'] as Array<typeof allOpsTabs[number]>;
    return [] as Array<typeof allOpsTabs[number]>;
  }, [adminRole]);

  const formatAdminSectionLabel = (section: LegalDoc): string => {
    if (section === 'bookings') return 'Booking Desk';
    if (section === 'services') return 'Services';
    if (section === 'operations') return 'Operations';
    if (section === 'profile') return 'My Profile';
    return 'Dashboard';
  };

  const getAdminSectionIcon = (section: LegalDoc) => {
    if (section === 'dashboard') return LayoutDashboard;
    if (section === 'bookings') return CalendarCheck2;
    if (section === 'services') return Settings2;
    if (section === 'profile') return UserCircle2;
    return Settings2;
  };

  const mapBranchIdToEnum = (branchId?: string): Branch => {
    if (!branchId) return Branch.NDERA;
    const opt = branchOptions.find((b) => b.id === branchId);
    return mapNameToBranch(opt?.name || branchId);
  };

  const adminRoomBookings = useMemo(() => {
    return liveRoomBookings.map((b: any) => ({
      id: b?.id || b?._id || '',
      branch: mapBranchIdToEnum(b?.branchId),
      amount: Number(b?.totalAmount ?? b?.amount ?? 0),
      customer: [b?.guestInfo?.firstName, b?.guestInfo?.lastName].filter(Boolean).join(' ') || b?.guestName || 'Guest',
      status: b?.status || 'pending',
      roomId: b?.roomId,
      checkInDate: b?.checkInDate,
      checkOutDate: b?.checkOutDate,
    }));
  }, [liveRoomBookings, branchOptions]);

  const adminServiceBookings = useMemo(() => {
    return liveServiceBookings.map((b: any) => ({
      id: b?.id || b?._id || '',
      branchId: mapBranchIdToEnum(b?.branchId),
      serviceId: b?.serviceId || '',
      serviceName: b?.serviceName || b?.service?.name || 'Service',
      customerName: b?.guestInfo?.name || b?.customerName || 'Guest',
      customerEmail: b?.guestInfo?.email || b?.customerEmail || '',
      customerPhone: b?.guestInfo?.phone || b?.customerPhone || '',
      date: b?.bookingDate || b?.date || '',
      time: b?.bookingTime || b?.time || '',
      amount: Number(b?.totalAmount ?? b?.amount ?? 0),
      status: b?.status || 'pending',
      notes: b?.specialRequests || b?.notes,
      createdAt: b?.createdAt || '',
    }));
  }, [liveServiceBookings, branchOptions]);

  const adminBranchRevenue = useMemo(() => {
    const base = new Map<string, { roomRevenue: number; serviceRevenue: number; bookingCount: number; occupancyCount: number }>();
    const ensureBranch = (id: string) => {
      if (!id) return;
      if (!base.has(id)) {
        base.set(id, { roomRevenue: 0, serviceRevenue: 0, bookingCount: 0, occupancyCount: 0 });
      }
    };
    const normalizeBranchId = (value: any): string => String(value || '').trim();

    branchOptions.forEach((b) => ensureBranch(b.id));

    liveRoomBookings.forEach((b: any) => {
      const branchId = normalizeBranchId(b?.branchId);
      if (!branchId) return;
      ensureBranch(branchId);
      const row = base.get(branchId)!;
      row.roomRevenue += Number(b?.totalAmount ?? b?.amount ?? 0);
      row.bookingCount += 1;
      if (String(b?.status || '').toLowerCase().includes('check') || String(b?.status || '').toLowerCase().includes('confirm')) {
        row.occupancyCount += 1;
      }
    });

    liveServiceBookings.forEach((b: any) => {
      const branchId = normalizeBranchId(b?.branchId);
      if (!branchId) return;
      ensureBranch(branchId);
      const row = base.get(branchId)!;
      row.serviceRevenue += Number(b?.totalAmount ?? b?.amount ?? 0);
      row.bookingCount += 1;
    });

    return Array.from(base.entries()).map(([branchId, row]) => {
      const totalRevenue = row.roomRevenue + row.serviceRevenue;
      const bookingCount = row.bookingCount;
      return {
        branchId,
        branchName: branchOptions.find((b) => b.id === branchId)?.name || branchId,
        roomRevenue: row.roomRevenue,
        serviceRevenue: row.serviceRevenue,
        totalRevenue,
        bookingCount,
        occupancyRate: bookingCount > 0 ? Math.round((row.occupancyCount / bookingCount) * 100) : 0,
        averageBookingValue: bookingCount > 0 ? Math.round(totalRevenue / bookingCount) : 0,
      };
    });
  }, [liveRoomBookings, liveServiceBookings, branchOptions]);

  const adminServiceRevenue = useMemo(() => {
    const grouped = new Map<string, { serviceName: string; totalBookings: number; totalRevenue: number; branchRevenue: Record<Branch, number> }>();
    adminServiceBookings.forEach((b: any) => {
      const key = b.serviceId || b.serviceName || 'service';
      if (!grouped.has(key)) {
        grouped.set(key, {
          serviceName: b.serviceName || 'Service',
          totalBookings: 0,
          totalRevenue: 0,
          branchRevenue: { [Branch.NDERA]: 0, [Branch.KANOMBE]: 0, [Branch.KABEZA]: 0 },
        });
      }
      const row = grouped.get(key)!;
      row.totalBookings += 1;
      row.totalRevenue += Number(b.amount || 0);
      row.branchRevenue[b.branchId || Branch.NDERA] += Number(b.amount || 0);
    });
    return Array.from(grouped.entries()).map(([serviceId, row]) => ({
      serviceId,
      serviceName: row.serviceName,
      totalBookings: row.totalBookings,
      totalRevenue: row.totalRevenue,
      branchRevenue: row.branchRevenue,
      monthlyRevenue: [],
      popularityScore: Math.min(100, row.totalBookings * 2),
    }));
  }, [adminServiceBookings]);

  const fetchCurrentUser = async (token: string): Promise<AuthUser> => {
    const res = await fetchWithTimeout(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Invalid or expired session.');
    return res.json();
  };

  const applyAuthenticatedSession = (token: string, user: AuthUser) => {
    setAuthToken(token);
    setAuthUser(user);
    setAdminRole(mapBackendRoleToAdminRole(user.role));
    localStorage.setItem('glads-auth-token', token);
  };

  useEffect(() => {
    const restoreAuth = async () => {
      const saved = localStorage.getItem('glads-auth-token');
      if (!saved) {
        setAuthHydrated(true);
        return;
      }
      setIsRestoringAuth(true);

      if (saved === 'local-dev-super-admin') {
        applyAuthenticatedSession(saved, {
          email: TEMP_SUPER_ADMIN_EMAIL,
          firstName: 'Super',
          lastName: 'Administrator',
          role: 'super-admin',
        });
        setAuthHydrated(true);
        setIsRestoringAuth(false);
        return;
      }

      const decoded = decodeAuthUserFromToken(saved);
      try {
        const user = await fetchCurrentUser(saved);
        applyAuthenticatedSession(saved, user);
      } catch {
        if (decoded) {
          applyAuthenticatedSession(saved, decoded);
        } else {
          localStorage.removeItem('glads-auth-token');
          setAuthToken(null);
          setAuthUser(null);
        }
      } finally {
        setAuthHydrated(true);
        setIsRestoringAuth(false);
      }
    };
    restoreAuth();
  }, []);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await fetch(`${API_BASE}/branches`);
        if (!res.ok) {
          setBranchesLoaded(true);
          return;
        }
        const raw = await res.json();
        const normalized: BranchOption[] = (Array.isArray(raw) ? raw : []).map((b: any) => ({
          id: b.id || b._id || '',
          name: b.name || b.fullName || b.code || 'Branch',
          code: b.code,
        })).filter((b: BranchOption) => !!b.id);
        setBranchOptions(normalized);
      } catch {
        setBranchOptions([]);
      } finally {
        setBranchesLoaded(true);
      }
    };
    loadBranches();
  }, []);

  useEffect(() => {
    if (!authUser?.branchId || branchOptions.length === 0) return;
    const role = mapBackendRoleToAdminRole(authUser.role);
    if (role === 'Branch Manager' || role === 'Reception') {
      const opt = branchOptions.find((b) => b.id === authUser.branchId);
      if (opt) setActiveBranch(mapNameToBranch(opt.name));
    }
  }, [authUser?.branchId, authUser?.role, branchOptions]);

  useEffect(() => {
    const loadBranchData = async () => {
      if (!activeBranchOption?.id) return;

      // If we already have data for this branch, don't show a full loading state
      const hasData = liveRooms.length > 0 || liveServices.length > 0 || liveTeamMembers.length > 0;
      if (!hasData) {
        // Initial load for this branch option - maybe show a more subtle state?
      }

      setApiLoading(true);
      try {
        const [roomsRes, servicesRes, teamRes] = await Promise.all([
          fetch(`${API_BASE}/rooms?branchId=${encodeURIComponent(activeBranchOption.id)}`),
          fetch(`${API_BASE}/services?branchId=${encodeURIComponent(activeBranchOption.id)}`),
          fetch(`${API_BASE}/team?branchId=${encodeURIComponent(activeBranchOption.id)}`),
        ]);

        if (roomsRes.ok) {
          const roomsRaw = await roomsRes.json();
          const rooms = (Array.isArray(roomsRaw) ? roomsRaw : []).map(mapApiRoomToUiRoom);
          if (rooms.length > 0) setLiveRooms(rooms);
        }

        if (servicesRes.ok) {
          const servicesRaw = await servicesRes.json();
          const services = (Array.isArray(servicesRaw) ? servicesRaw : []).map(mapApiServiceToUiService);
          if (services.length > 0) setLiveServices(services);
        }

        if (teamRes.ok) {
          const teamRaw = await teamRes.json();
          const members = (Array.isArray(teamRaw) ? teamRaw : []).map(mapApiTeamToUiTeam);
          if (members.length > 0) setLiveTeamMembers(members);
        }
      } catch (err) {
        console.error("Failed to refresh branch data:", err);
        // We do NOT clear liveRooms/liveServices here; we keep the existing or base data.
      } finally {
        setApiLoading(false);
      }
    };
    loadBranchData();
  }, [activeBranchOption?.id]);

  useEffect(() => {
    const loadAdminData = async () => {
      if (!authToken) {
        setLiveRoomBookings([]);
        setLiveServiceBookings([]);
        return;
      }
      try {
        const headers = { Authorization: `Bearer ${authToken}` };
        const [bookingsRes, serviceBookingsRes] = await Promise.all([
          fetch(`${API_BASE}/bookings`, { headers }),
          fetch(`${API_BASE}/service-bookings`, { headers }),
        ]);

        const bookingsRaw = bookingsRes.ok ? await bookingsRes.json() : [];
        const serviceBookingsRaw = serviceBookingsRes.ok ? await serviceBookingsRes.json() : [];
        setLiveRoomBookings(Array.isArray(bookingsRaw) ? bookingsRaw : []);
        setLiveServiceBookings(Array.isArray(serviceBookingsRaw) ? serviceBookingsRaw : []);
      } catch {
        setLiveRoomBookings([]);
        setLiveServiceBookings([]);
      }
    };
    loadAdminData();
  }, [authToken]);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const res = await fetch(`${API_BASE}/news`);
        if (!res.ok) {
          setLiveNews([]);
          return;
        }
        const raw = await res.json();
        setLiveNews((Array.isArray(raw) ? raw : []).map(mapApiNewsToUiNews));
      } catch {
        setLiveNews([]);
      }
    };
    loadNews();
  }, []);

  useEffect(() => {
    if (!authToken) return;
    if (currentTab !== 'Admin') return;

    // Staleness check: Only load if opsData from backend is empty
    if (opsData.branches.length === 0) {
      loadOperationsData();
    }
  }, [authToken, currentTab, opsData.branches.length]);

  useEffect(() => {
    if (!authHydrated) return;
    if (currentTab === 'Admin' && !authUser) {
      setCurrentTab('Home');
      setShowAuthModal(true);
    }
  }, [currentTab, authUser, authHydrated]);

  useEffect(() => {
    if (!authUser) return;
    setProfileForm({
      fullName: [authUser.firstName, authUser.lastName].filter(Boolean).join(' '),
      phone: '',
      profilePicture: '',
    });
  }, [authUser]);

  useEffect(() => {
    if (!allowedAdminSections.includes(adminSection as LegalDoc)) {
      setAdminSection(allowedAdminSections[0]);
    }
  }, [adminRole, adminSection, allowedAdminSections]);

  useEffect(() => {
    if (allowedOpsTabs.length === 0) return;
    if (!allowedOpsTabs.includes(opsTab as any)) {
      setOpsTab(allowedOpsTabs[0] as any);
    }
  }, [allowedOpsTabs, opsTab]);

  useEffect(() => {
    if (!activeBranchOption?.id) return;
    const branchId = activeBranchOption.id;
    setRegisterForm((prev) => ({ ...prev, branchId }));
    setUserCreateForm((prev) => ({ ...prev, branchId }));
    setNewsCreateForm((prev) => ({ ...prev, branchId }));
    setTeamCreateForm((prev) => ({ ...prev, branchId }));
    setMenuCreateForm((prev) => ({ ...prev, branchId }));
    setServiceCreateForm((prev) => ({ ...prev, branchId }));
  }, [activeBranchOption?.id]);

  const openAdminArea = (section: LegalDoc = 'dashboard') => {
    if (!authUser) {
      setAuthError(null);
      setShowAuthModal(true);
      return;
    }
    setAdminSection(allowedAdminSections.includes(section) ? section : allowedAdminSections[0]);
    setCurrentTab('Admin');
  };

  const logoutAdmin = () => {
    localStorage.removeItem('glads-auth-token');
    setAuthUser(null);
    setAuthToken(null);
    setCurrentTab('Home');
  };

  const submitPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });

      if (res.status === 404) {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
          throw new Error('Login endpoint not found and Supabase client env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        }
        const supabaseRes = await fetchWithTimeout(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            email: authEmail,
            password: authPassword,
          }),
        });
        if (!supabaseRes.ok) {
          throw new Error('Supabase login failed. Check email/password.');
        }
        const supabasePayload = await supabaseRes.json();
        const supabaseToken = supabasePayload?.access_token;
        if (!supabaseToken) throw new Error('Supabase did not return an access token.');
        let user: AuthUser;
        try {
          user = await fetchCurrentUser(supabaseToken);
        } catch {
          const decoded = decodeAuthUserFromToken(supabaseToken);
          if (!decoded) throw new Error('Signed in, but user profile could not be loaded.');
          user = decoded;
        }
        applyAuthenticatedSession(supabaseToken, user);
        setShowAuthModal(false);
        setCurrentTab('Admin');
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(getFriendlyApiErrorMessage(res.status, text));
      }

      const payload = await res.json();
      const token = payload?.access_token || payload?.accessToken || payload?.token || payload?.data?.accessToken;
      if (!token) throw new Error('No access token returned by backend.');

      let user: AuthUser;
      try {
        user = await fetchCurrentUser(token);
      } catch {
        const decoded = decodeAuthUserFromToken(token);
        if (!decoded) throw new Error('Signed in, but user profile could not be loaded.');
        user = decoded;
      }
      applyAuthenticatedSession(token, user);
      setShowAuthModal(false);
      setCurrentTab('Admin');
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        setAuthError('Login timed out. Please retry in a few seconds.');
      } else {
        setAuthError(err?.message || 'Unable to login right now.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const submitRegisterStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);
    setRegisterSuccess(null);
    try {
      if (!authToken) throw new Error('Only authenticated admins can register staff. Please sign in first.');
      const branchId = registerForm.branchId || activeBranchOption?.id;
      if (!branchId) {
        throw new Error('Please select a branch for this staff role.');
      }

      const payload: any = {
        email: registerForm.email,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        phone: registerForm.phone || undefined,
        role: registerForm.role,
        password: registerForm.password,
      };
      payload.branchId = branchId;

      const res = await fetch(`${API_BASE}/auth/register-staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to register staff.');
      }

      setRegisterSuccess('Staff account created successfully.');
      setRegisterForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        role: 'receptionist',
        branchId: '',
      });
    } catch (err: any) {
      setRegisterError(err?.message || 'Unable to register staff.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const submitUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMessage(null);
    try {
      if (!authToken) throw new Error('Not authenticated');
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fullName: profileForm.fullName || undefined,
          phone: profileForm.phone || undefined,
          profilePicture: profileForm.profilePicture || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setProfileMessage('Profile updated successfully.');
    } catch (err: any) {
      setProfileMessage(err?.message || 'Unable to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileImageUpload = async (file?: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Unable to read image file.'));
        reader.readAsDataURL(file);
      });

      setProfileForm((prev) => ({ ...prev, profilePicture: dataUrl }));
      setProfileMessage('Profile image selected. Save profile to apply.');
    } catch (err: any) {
      setProfileMessage(err?.message || 'Unable to process selected image.');
    }
  };

  const toDataUrl = async (file?: File | null): Promise<string> => {
    if (!file) return '';
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Unable to read image file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleNewsImageUpload = async (file?: File | null) => {
    try {
      const dataUrl = await toDataUrl(file);
      if (!dataUrl) return;
      setNewsCreateForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      setOpsMessage('News image selected.');
    } catch (err: any) {
      setOpsMessage(err?.message || 'Unable to process selected image.');
    }
  };

  const handleNewsEditImageUpload = async (file?: File | null) => {
    try {
      const dataUrl = await toDataUrl(file);
      if (!dataUrl) return;
      setNewsEditForm((prev) => prev ? { ...prev, imageUrl: dataUrl } : null);
      setOpsMessage('Team edit photo selected.');
    } catch (err: any) {
      setOpsMessage(err?.message || 'Unable to process selected photo.');
    }
  };

  const handleServiceIconUpload = async (file?: File | null) => {
    try {
      const dataUrl = await toDataUrl(file);
      if (!dataUrl) return;
      setServiceCreateForm((prev) => ({ ...prev, icon: dataUrl }));
      setOpsMessage('Service icon selected.');
    } catch (err: any) {
      setOpsMessage(err?.message || 'Unable to process selected icon.');
    }
  };

  const handleServiceEditIconUpload = async (file?: File | null) => {
    try {
      const dataUrl = await toDataUrl(file);
      if (!dataUrl) return;
      setServiceEditForm((prev) => prev ? { ...prev, icon: dataUrl } : null);
      setOpsMessage('Service edit icon selected.');
    } catch (err: any) {
      setOpsMessage(err?.message || 'Unable to process selected icon.');
    }
  };

  const handleTeamPhotoUpload = async (file?: File | null) => {
    try {
      const dataUrl = await toDataUrl(file);
      if (!dataUrl) return;
      setTeamCreateForm((prev) => ({ ...prev, photoUrl: dataUrl }));
      setOpsMessage('Team photo selected.');
    } catch (err: any) {
      setOpsMessage(err?.message || 'Unable to process selected image.');
    }
  };

  const handleTeamEditPhotoUpload = async (file?: File | null) => {
    try {
      const dataUrl = await toDataUrl(file);
      if (!dataUrl) return;
      setTeamEditForm((prev) => prev ? { ...prev, photoUrl: dataUrl } : null);
      setOpsMessage('Team edit photo selected.');
    } catch (err: any) {
      setOpsMessage(err?.message || 'Unable to process selected image.');
    }
  };

  const handleRoomImagesUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const dataUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await toDataUrl(files[i]);
        if (url) dataUrls.push(url);
      }
      setRoomCreateForm((prev) => ({ ...prev, images: [...prev.images, ...dataUrls] }));
      setOpsMessage(`${dataUrls.length} image(s) added.`);
    } catch (err: any) {
      setOpsMessage(err?.message || 'Unable to process images.');
    }
  };

  const handleMenuFileUpload = async (file?: File | null) => {
    try {
      const dataUrl = await toDataUrl(file);
      if (!dataUrl) return;
      setMenuCreateForm((prev) => ({ ...prev, menuUrl: dataUrl }));
      setOpsMessage('Menu file selected. Create to save.');
    } catch (err: any) {
      setOpsMessage(err?.message || 'Unable to process file.');
    }
  };

  const handleMenuEditFileUpload = async (file?: File | null) => {
    try {
      const dataUrl = await toDataUrl(file);
      if (!dataUrl) return;
      setMenuEditForm((prev) => prev ? { ...prev, menuUrl: dataUrl } : null);
      setOpsMessage('Menu edit file selected.');
    } catch (err: any) {
      setOpsMessage(err?.message || 'Unable to process file.');
    }
  };

  const handleRoomEditImagesUpload = async (files: FileList | null) => {
    if (!files?.length || !roomEditForm) return;
    try {
      const dataUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await toDataUrl(files[i]);
        if (url) dataUrls.push(url);
      }
      setRoomEditForm((prev) => prev ? { ...prev, images: [...prev.images, ...dataUrls] } : null);
      setOpsMessage(`${dataUrls.length} image(s) added.`);
    } catch (err: any) {
      setOpsMessage(err?.message || 'Unable to process images.');
    }
  };

  const submitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordMessage(null);
    try {
      if (!authToken) throw new Error('Not authenticated');
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(passwordForm),
      });
      if (!res.ok) throw new Error('Failed to change password');
      setPasswordMessage('Password changed successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err: any) {
      setPasswordMessage(err?.message || 'Unable to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const apiRequest = async (path: string, options: RequestInit = {}, requireAuth = true) => {
    const isLocalFallbackSession = authToken === 'local-dev-super-admin';
    if (requireAuth && !authToken) {
      throw new Error('You must login first.');
    }
    if (requireAuth && isLocalFallbackSession) {
      throw new Error('This action requires a real admin session. Sign in with a backend-authenticated account.');
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (authToken) headers.Authorization = `Bearer ${authToken}`;
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(getFriendlyApiErrorMessage(res.status, text));
    }
    if (res.status === 204) return null;
    return res.json();
  };

  const loadOperationsData = async () => {
    if (!authToken) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      const canAccess = (tab: string) => allowedOpsTabs.includes(tab as any);
      const branchIdForRooms = activeBranchOption?.id;
      const [branches, roomsRes, roomStatsRes, users, news, team, menu, payments, settings, audit] = await Promise.all([
        canAccess('branches') ? apiRequest('/branches') : Promise.resolve([]),
        canAccess('rooms') ? fetch(`${API_BASE}/rooms${branchIdForRooms ? `?branchId=${encodeURIComponent(branchIdForRooms)}` : ''}`).then((r) => (r.ok ? r.json() : [])).catch(() => []) : Promise.resolve([]),
        canAccess('rooms') && branchIdForRooms ? fetch(`${API_BASE}/rooms/${branchIdForRooms}/stats`, { headers: authToken ? { Authorization: `Bearer ${authToken}` } : {} }).then((r) => (r.ok ? r.json() : null)).catch(() => null) : Promise.resolve(null),
        canAccess('users') ? apiRequest('/users') : Promise.resolve([]),
        canAccess('news') ? apiRequest('/news') : Promise.resolve([]),
        canAccess('team') ? apiRequest('/team') : Promise.resolve([]),
        canAccess('menu') ? apiRequest('/menu') : Promise.resolve([]),
        canAccess('payments') ? apiRequest('/payments') : Promise.resolve([]),
        canAccess('settings') ? apiRequest('/system-settings') : Promise.resolve([]),
        canAccess('audit') ? apiRequest('/audit-logs') : Promise.resolve([]),
      ]);

      const rooms = Array.isArray(roomsRes) ? roomsRes : [];
      const roomStats = roomStatsRes && typeof roomStatsRes === 'object' ? roomStatsRes : null;

      let analytics: any = null;
      if (canAccess('analytics')) {
        try {
          analytics = await apiRequest('/analytics/revenue');
        } catch {
          analytics = null;
        }
      }

      setOpsData((prev) => ({
        ...prev,
        branches: Array.isArray(branches) ? branches : [],
        rooms,
        roomStats,
        users: Array.isArray(users) ? users : [],
        news: (Array.isArray(news) ? news : []).map(mapApiNewsToUiNews),
        team: (Array.isArray(team) ? team : []).map(mapApiTeamToUiTeam),
        menu: Array.isArray(menu) ? menu : [],
        payments: Array.isArray(payments) ? payments : [],
        analytics,
        settings: Array.isArray(settings) ? settings : [],
        audit: Array.isArray(audit) ? audit : [],
      }));
      setOpsMessage('Operations data refreshed.');
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to load operations data.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest('/branches', {
        method: 'POST',
        body: JSON.stringify({
          name: branchCreateForm.name,
          code: branchCreateForm.code,
          address: branchCreateForm.address,
          coordinates: {
            latitude: Number(branchCreateForm.latitude || 0),
            longitude: Number(branchCreateForm.longitude || 0),
          },
          contactInfo: {
            phone: branchCreateForm.phone,
            email: branchCreateForm.email,
          },
          amenities: [],
          description: branchCreateForm.description,
          settings: {},
        }),
      });
      setOpsMessage('Branch created successfully.');
      setBranchCreateForm({ name: '', code: '', address: '', latitude: '', longitude: '', phone: '', email: '', description: '' });
      await loadOperationsData();
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to create branch.');
    } finally {
      setOpsLoading(false);
    }
  };

  const parseList = (v: string | string[]): string[] => {
    if (Array.isArray(v)) return v.filter(Boolean);
    if (typeof v === 'string') return v.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const submitCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      const branchId = activeBranchOption?.id;
      if (!branchId) throw new Error('Select a branch first.');
      const amenities = parseList(roomCreateForm.amenities);
      const images = Array.isArray(roomCreateForm.images) ? roomCreateForm.images : parseList(roomCreateForm.images as string);
      if (amenities.length === 0) throw new Error('Add at least one amenity.');
      if (images.length === 0) throw new Error('Upload at least one image.');

      await apiRequest(`/rooms/${branchId}`, {
        method: 'POST',
        body: JSON.stringify({
          branchId,
          roomNumber: roomCreateForm.roomNumber,
          roomType: roomCreateForm.roomType,
          floor: Number(roomCreateForm.floor) || 1,
          name: roomCreateForm.name,
          description: roomCreateForm.description,
          basePrice: Number(roomCreateForm.basePrice) || 0,
          maxOccupancy: Number(roomCreateForm.maxOccupancy) || 2,
          sizeSqm: Number(roomCreateForm.sizeSqm) || 0,
          bedType: roomCreateForm.bedType || 'King',
          viewType: roomCreateForm.viewType || 'Standard',
          amenities,
          images,
        }),
      });
      setOpsMessage('Room created successfully.');
      setRoomCreateForm({
        roomNumber: '',
        roomType: 'deluxe',
        floor: 1,
        name: '',
        description: '',
        basePrice: '',
        maxOccupancy: 2,
        sizeSqm: '',
        bedType: '',
        viewType: '',
        amenities: '',
        images: [],
      });
      await loadOperationsData();
      const teamRes = await fetch(`${API_BASE}/team?branchId=${encodeURIComponent(branchId)}`);
      if (teamRes.ok) {
        const raw = await teamRes.json();
        setLiveTeamMembers((Array.isArray(raw) ? raw : []).map(mapApiTeamToUiTeam));
      }
      const roomsRes = await fetch(`${API_BASE}/rooms?branchId=${encodeURIComponent(branchId)}`);
      if (roomsRes.ok) {
        const raw = await roomsRes.json();
        const rooms = (Array.isArray(raw) ? raw : []).map(mapApiRoomToUiRoom);
        setLiveRooms(rooms);
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to create room.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomEditForm) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/rooms/${roomEditForm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          roomNumber: roomEditForm.roomNumber,
          roomType: roomEditForm.roomType,
          floor: Number(roomEditForm.floor) || 1,
          name: roomEditForm.name,
          description: roomEditForm.description,
          basePrice: Number(roomEditForm.basePrice) || 0,
          maxOccupancy: Number(roomEditForm.maxOccupancy) || 2,
          sizeSqm: Number(roomEditForm.sizeSqm) || 0,
          bedType: roomEditForm.bedType || undefined,
          viewType: roomEditForm.viewType || undefined,
          status: roomEditForm.status || undefined,
          amenities: parseList(roomEditForm.amenities),
          images: roomEditForm.images,
        }),
      });
      setOpsMessage('Room updated successfully.');
      setRoomEditForm(null);
      await loadOperationsData();
      const branchId = activeBranchOption?.id;
      if (branchId) {
        const roomsRes = await fetch(`${API_BASE}/rooms?branchId=${encodeURIComponent(branchId)}`);
        if (roomsRes.ok) {
          const raw = await roomsRes.json();
          const rooms = (Array.isArray(raw) ? raw : []).map(mapApiRoomToUiRoom);
          setLiveRooms(rooms);
        }
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to update room.');
    } finally {
      setOpsLoading(false);
    }
  };

  const searchAvailableRooms = async () => {
    const branchId = activeBranchOption?.id;
    if (!branchId || !roomSearchForm.checkIn || !roomSearchForm.checkOut) {
      setOpsMessage('Select branch and enter check-in/check-out dates.');
      return;
    }
    setRoomSearchLoading(true);
    setRoomSearchResults(null);
    setOpsMessage(null);
    try {
      const params = new URLSearchParams({
        branchId,
        checkInDate: roomSearchForm.checkIn,
        checkOutDate: roomSearchForm.checkOut,
        numberOfGuests: String(roomSearchForm.guests),
      });
      const res = await fetch(`${API_BASE}/rooms/search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setRoomSearchResults(Array.isArray(data) ? data : []);
      setOpsMessage(`Found ${Array.isArray(data) ? data.length : 0} available rooms.`);
    } catch (err: any) {
      setOpsMessage(err?.message || 'Availability search failed.');
      setRoomSearchResults([]);
    } finally {
      setRoomSearchLoading(false);
    }
  };

  const submitDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room? It will be marked inactive.')) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/rooms/${roomId}`, { method: 'DELETE' });
      setOpsMessage('Room deleted successfully.');
      setRoomEditForm(null);
      await loadOperationsData();
      const branchId = activeBranchOption?.id;
      if (branchId) {
        const roomsRes = await fetch(`${API_BASE}/rooms?branchId=${encodeURIComponent(branchId)}`);
        if (roomsRes.ok) {
          const raw = await roomsRes.json();
          const rooms = (Array.isArray(raw) ? raw : []).map(mapApiRoomToUiRoom);
          setLiveRooms(rooms);
        }
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to delete room.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify({
          email: userCreateForm.email,
          password: userCreateForm.password,
          fullName: userCreateForm.fullName,
          phone: userCreateForm.phone || undefined,
          role: userCreateForm.role,
          branchId: userCreateForm.branchId || undefined,
        }),
      });
      setOpsMessage('User created successfully.');
      setUserCreateForm({ email: '', password: '', fullName: '', phone: '', role: 'receptionist', branchId: '' });
      await loadOperationsData();
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to create user.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest('/news', {
        method: 'POST',
        body: JSON.stringify({
          authorId: authUser?.id || 'local-super-admin',
          title: newsCreateForm.title,
          content: newsCreateForm.content,
          category: newsCreateForm.category,
          imageUrl: newsCreateForm.imageUrl || undefined,
          scope: newsCreateForm.scope,
          targetAudience: newsCreateForm.targetAudience,
          branchId: newsCreateForm.scope === 'branch-specific' ? newsCreateForm.branchId || undefined : undefined,
          excerpt: newsCreateForm.content.slice(0, 140),
        }),
      });
      setOpsMessage('News created successfully.');
      setNewsCreateForm({ title: '', content: '', category: 'announcement', scope: 'global', targetAudience: 'all', branchId: '', imageUrl: '' });
      await loadOperationsData();
      const newsRes = await fetch(`${API_BASE}/news`);
      if (newsRes.ok) {
        const raw = await newsRes.json();
        setLiveNews((Array.isArray(raw) ? raw : []).map(mapApiNewsToUiNews));
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to create news.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitUpdateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEditForm) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/news/${newsEditForm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: newsEditForm.title,
          content: newsEditForm.content,
          category: newsEditForm.category,
          imageUrl: newsEditForm.imageUrl || undefined,
          scope: newsEditForm.scope,
          targetAudience: newsEditForm.targetAudience,
          branchId: newsEditForm.scope === 'branch-specific' ? newsEditForm.branchId || undefined : undefined,
          excerpt: newsEditForm.content.slice(0, 140),
          isPublished: newsEditForm.isPublished,
          isPinned: newsEditForm.isPinned,
        }),
      });
      setOpsMessage('News updated successfully.');
      setNewsEditForm(null);
      await loadOperationsData();
      const newsRes = await fetch(`${API_BASE}/news`);
      if (newsRes.ok) {
        const raw = await newsRes.json();
        setLiveNews((Array.isArray(raw) ? raw : []).map(mapApiNewsToUiNews));
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to update news.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitDeleteNews = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/news/${id}`, { method: 'DELETE' });
      setOpsMessage('News deleted successfully.');
      await loadOperationsData();
      const newsRes = await fetch(`${API_BASE}/news`);
      if (newsRes.ok) {
        const raw = await newsRes.json();
        setLiveNews((Array.isArray(raw) ? raw : []).map(mapApiNewsToUiNews));
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to delete news.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitCreateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      const branchId = teamCreateForm.branchId || activeBranchOption?.id;
      if (!branchId) throw new Error('No branch selected in dashboard.');
      await apiRequest(`/team/${branchId}`, {
        method: 'POST',
        body: JSON.stringify({
          fullName: teamCreateForm.fullName,
          position: teamCreateForm.position,
          department: teamCreateForm.department,
          photoUrl: teamCreateForm.photoUrl || undefined,
          email: teamCreateForm.email || undefined,
          phone: teamCreateForm.phone || undefined,
          bio: teamCreateForm.bio || undefined,
          displayOrder: Number(teamCreateForm.displayOrder) || 1,
        }),
      });
      setOpsMessage('Team member created successfully.');
      setTeamCreateForm({ branchId: '', fullName: '', position: '', department: '', email: '', phone: '', bio: '', photoUrl: '', displayOrder: 1 });
      await loadOperationsData();
      if (branchId) {
        const teamRes = await fetch(`${API_BASE}/team?branchId=${encodeURIComponent(branchId)}`);
        if (teamRes.ok) {
          const raw = await teamRes.json();
          setLiveTeamMembers((Array.isArray(raw) ? raw : []).map(mapApiTeamToUiTeam));
        }
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to create team member.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitUpdateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamEditForm) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/team/${teamEditForm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: teamEditForm.fullName,
          position: teamEditForm.position,
          department: teamEditForm.department,
          photoUrl: teamEditForm.photoUrl || undefined,
          email: teamEditForm.email || undefined,
          phone: teamEditForm.phone || undefined,
          bio: teamEditForm.bio || undefined,
          displayOrder: teamEditForm.displayOrder,
        }),
      });
      setOpsMessage('Team member updated successfully.');
      setTeamEditForm(null);
      await loadOperationsData();
      const branchId = activeBranchOption?.id;
      if (branchId) {
        const teamRes = await fetch(`${API_BASE}/team?branchId=${encodeURIComponent(branchId)}`);
        if (teamRes.ok) {
          const raw = await teamRes.json();
          setLiveTeamMembers((Array.isArray(raw) ? raw : []).map(mapApiTeamToUiTeam));
        }
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to update team member.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitDeleteTeamMember = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/team/${id}`, {
        method: 'DELETE',
      });
      setOpsMessage('Team member deleted successfully.');
      await loadOperationsData();
      const branchId = activeBranchOption?.id;
      if (branchId) {
        const teamRes = await fetch(`${API_BASE}/team?branchId=${encodeURIComponent(branchId)}`);
        if (teamRes.ok) {
          const raw = await teamRes.json();
          setLiveTeamMembers((Array.isArray(raw) ? raw : []).map(mapApiTeamToUiTeam));
        }
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to delete team member.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitCreateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      const branchId = menuCreateForm.branchId || activeBranchOption?.id;
      if (!branchId) throw new Error('No branch selected in dashboard.');
      if (!menuCreateForm.menuUrl) throw new Error('Upload a menu file (image or PDF) first.');
      await apiRequest(`/menu/${branchId}`, {
        method: 'POST',
        body: JSON.stringify({
          branchId,
          name: menuCreateForm.name,
          menuUrl: menuCreateForm.menuUrl,
          effectiveDate: menuCreateForm.effectiveDate,
          description: menuCreateForm.description || undefined,
        }),
      });
      setOpsMessage('Menu created successfully.');
      setMenuCreateForm({ branchId: '', name: '', menuUrl: '', effectiveDate: '', description: '' });
      await loadOperationsData();
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to create menu.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitUpdateMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuEditForm) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/menu/${menuEditForm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: menuEditForm.name,
          menuUrl: menuEditForm.menuUrl,
          effectiveDate: menuEditForm.effectiveDate,
          description: menuEditForm.description || undefined,
        }),
      });
      setOpsMessage('Menu updated successfully.');
      setMenuEditForm(null);
      await loadOperationsData();
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to update menu.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitDeleteMenu = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this menu?')) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/menu/${id}`, { method: 'DELETE' });
      setOpsMessage('Menu deleted successfully.');
      await loadOperationsData();
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to delete menu.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      const branchId = serviceCreateForm.branchId || activeBranchOption?.id;
      if (!branchId) throw new Error('No branch selected.');
      await apiRequest(`/services/${branchId}`, {
        method: 'POST',
        body: JSON.stringify({
          name: serviceCreateForm.name,
          description: serviceCreateForm.description,
          category: serviceCreateForm.category,
          price: parseFloat(serviceCreateForm.pricing) || 0,
          billingType: 'one-time',
          images: serviceCreateForm.icon ? [serviceCreateForm.icon] : [],
          amenities: [],
        }),
      });
      setOpsMessage('Service created successfully.');
      setServiceCreateForm({
        name: '',
        description: '',
        category: 'Wellness & Fitness',
        icon: '',
        hours: '',
        pricing: '',
        branchId: '',
      });
      await loadOperationsData();
      // Also refresh live data
      const res = await fetch(`${API_BASE}/services?branchId=${branchId}`);
      if (res.ok) {
        const raw = await res.json();
        setLiveServices((Array.isArray(raw) ? raw : []).map(mapApiServiceToUiService));
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to create service.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceEditForm) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/services/${serviceEditForm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: serviceEditForm.name,
          description: serviceEditForm.description,
          category: serviceEditForm.category,
          price: parseFloat(serviceEditForm.pricing) || 0,
          billingType: 'one-time',
          images: serviceEditForm.icon ? [serviceEditForm.icon] : [],
        }),
      });
      setOpsMessage('Service updated successfully.');
      setServiceEditForm(null);
      await loadOperationsData();
      const branchId = activeBranchOption?.id;
      if (branchId) {
        const res = await fetch(`${API_BASE}/services?branchId=${branchId}`);
        if (res.ok) {
          const raw = await res.json();
          setLiveServices((Array.isArray(raw) ? raw : []).map(mapApiServiceToUiService));
        }
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to update service.');
    } finally {
      setOpsLoading(false);
    }
  };

  useEffect(() => {
    return subscribeToBranchChanges((branch) => {
      setActiveBranch(branch);
    });
  }, []);



  const submitDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/services/${id}`, { method: 'DELETE' });
      setOpsMessage('Service deleted successfully.');
      await loadOperationsData();
      // Refresh live data
      const branchId = activeBranchOption?.id;
      if (branchId) {
        const res = await fetch(`${API_BASE}/services?branchId=${branchId}`);
        if (res.ok) {
          const raw = await res.json();
          setLiveServices((Array.isArray(raw) ? raw : []).map(mapApiServiceToUiService));
        }
      }
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to delete service.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitCreateSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      let parsedValue: any = {};
      try {
        parsedValue = JSON.parse(settingCreateForm.valueJson);
      } catch {
        throw new Error('Setting value must be valid JSON.');
      }
      await apiRequest('/system-settings', {
        method: 'POST',
        body: JSON.stringify({
          key: settingCreateForm.key,
          value: parsedValue,
          description: settingCreateForm.description || undefined,
        }),
      });
      setOpsMessage('System setting created successfully.');
      setSettingCreateForm({ key: '', valueJson: '{}', description: '' });
      await loadOperationsData();
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to create system setting.');
    } finally {
      setOpsLoading(false);
    }
  };

  const handleBranchSwitch = (branch: Branch) => {
    setActiveBranch(branch);
    setIsMobileMenuOpen(false);
    setStoredBranch(branch);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openImmersive = (src: string, title: string) => {
    setImmersivePhoto({ src, title });
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingRoom(null);
    }, 3000);
  };

  const openBooking = (service: any) => {
    setBookingService(service);
    setShowBookingModal(true);
  };

  const openRoomBooking = (room: RoomType) => {
    setShowBranchSelector(false);
    setShowLocationGuide(false);
    setIsMobileMenuOpen(false);
    setSelectedRoom(null);
    setSelectedRoomImage(null);
    setBookingSuccess(false);
    setRoomCheckoutStep('details');
    setRoomPaymentMethod(null);
    setBookingRoom(room);
  };

  const start360Rotation = () => {
    setIsRotating(true);
    const interval = setInterval(() => {
      setRotation(prev => {
        const newRotation = prev + 2;
        if (newRotation >= 360) {
          clearInterval(interval);
          setIsRotating(false);
          return 0;
        }
        return newRotation;
      });
    }, 16); // 60fps
  };

  const startLocationAnimation = (startPoint: string, destination: string) => {
    setLocationAnimation({
      isAnimating: true,
      startPoint,
      destination,
      progress: 0
    });

    const interval = setInterval(() => {
      setLocationAnimation(prev => {
        const newProgress = prev.progress + 1;
        if (newProgress >= 100) {
          clearInterval(interval);
          return {
            ...prev,
            isAnimating: false,
            progress: 100
          };
        }
        return {
          ...prev,
          progress: newProgress
        };
      });
    }, 50); // Animation over 5 seconds
  };

  if (isRestoringAuth) {
    return <LoadingScreen message="Restoring session..." variant="full" />;
  }

  return (
    <div className="min-h-screen transition-all duration-700 bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans selection:bg-burgundy selection:text-white overflow-x-hidden">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <CustomCursor cursorActive={cursorActive} cursorPos={cursorPos} cursorLabel={cursorLabel} />

      <ImmersivePhotoViewer
        isOpen={!!immersivePhoto}
        src={immersivePhoto?.src || ''}
        title={immersivePhoto?.title || ''}
        onClose={() => setImmersivePhoto(null)}
      />

      <VirtualExperience
        isOpen={show3DView}
        selectedRoom={selectedRoom}
        data={data}
        rotation={rotation}
        isRotating={isRotating}
        onClose={() => { setShow3DView(false); setRotation(0); }}
        setRotation={setRotation}
        start360Rotation={start360Rotation}
      />

      <LocationGuide
        isOpen={showLocationGuide}
        activeBranch={activeBranch}
        onClose={() => setShowLocationGuide(false)}
        onBranchSwitch={handleBranchSwitch}
        onTabSwitch={setCurrentTab}
      />

      {selectedService && (
        <ServiceMiniPage
          service={selectedService}
          activeBranch={activeBranch}
          branchGallery={data.gallery}
          onClose={() => setSelectedService(null)}
          onBook={(svc) => openBooking(svc)}
          onOpenImage={(src, title) => openImmersive(src, title)}
        />
      )}

      {/* Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative">
            <button onClick={() => { setSelectedRoom(null); setSelectedRoomImage(null); }} className="absolute top-8 right-8 text-neutral-400 hover:text-black dark:hover:text-white z-10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-y-auto md:overflow-hidden">
              <div className="md:w-1/2">
                {/* Main Room Image */}
                <div className="cursor-pointer group relative mb-4" onClick={() => openImmersive(selectedRoomImage ?? selectedRoom.image, selectedRoom.name)}>
                  <img src={selectedRoomImage ?? selectedRoom.image} className="h-80 w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 rounded-lg" alt={selectedRoom.name} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
                    <span className="text-white bg-burgundy/80 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Open Immersive View</span>
                  </div>
                </div>

                {/* Room Image Gallery */}
                <div className="grid grid-cols-4 gap-2 px-4">
                  {data.gallery.slice(0, 8).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${selectedRoom.name} view ${idx + 1}`}
                      className="w-full h-16 object-cover rounded-lg hover:scale-105 transition-transform cursor-pointer shadow-md opacity-80 hover:opacity-100"
                      onClick={() => {
                        setSelectedRoomImage(img);
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="md:w-1/2 p-12 flex flex-col justify-between">
                <div>
                  <span className="text-burgundy font-black tracking-widest uppercase text-[10px] mb-2 block">{activeBranch} Collection</span>
                  <h3 className="text-5xl font-sans italic mb-6 leading-none">{selectedRoom.name}</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed mb-8">{selectedRoom.longDescription}</p>
                  <div className="space-y-4 mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-50">Included Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.amenities.map(a => <span key={a} className="bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-neutral-500 uppercase">{a}</span>)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800 pt-8 mt-8">
                  <span className="text-3xl font-black">${selectedRoom.price}<span className="text-sm opacity-30"> / night</span></span>
                  <div className="flex gap-3">
                    <button onClick={() => { setShow3DView(true); }} className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all">3D View</button>
                    <button onClick={() => openRoomBooking(selectedRoom)} className="bg-burgundy text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl">Book Now</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingRoom && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom duration-500">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-xl rounded-[3rem] p-12 shadow-3xl border border-white/5 relative overflow-y-auto max-h-[90vh]">
            <button onClick={() => { setBookingRoom(null); setRoomCheckoutStep('details'); setRoomPaymentMethod(null); }} className="absolute top-8 right-8 text-neutral-400 hover:text-black dark:hover:text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Progress Steps */}
            {!bookingSuccess && (
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className={`flex items-center gap-2 ${roomCheckoutStep === 'details' ? 'text-burgundy' : 'text-neutral-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${roomCheckoutStep === 'details' ? 'bg-burgundy text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>1</div>
                  <span className="text-xs font-bold hidden md:inline">Details</span>
                </div>
                <div className="w-12 h-0.5 bg-neutral-200 dark:bg-neutral-700"></div>
                <div className={`flex items-center gap-2 ${roomCheckoutStep === 'payment' ? 'text-burgundy' : 'text-neutral-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${roomCheckoutStep === 'payment' ? 'bg-burgundy text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>2</div>
                  <span className="text-xs font-bold hidden md:inline">Payment</span>
                </div>
                <div className="w-12 h-0.5 bg-neutral-200 dark:bg-neutral-700"></div>
                <div className={`flex items-center gap-2 ${roomCheckoutStep === 'confirmation' ? 'text-burgundy' : 'text-neutral-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${roomCheckoutStep === 'confirmation' ? 'bg-burgundy text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>3</div>
                  <span className="text-xs font-bold hidden md:inline">Confirm</span>
                </div>
              </div>
            )}

            {bookingSuccess ? (
              <div className="text-center py-20 animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-green-500/30">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-4xl font-sans italic mb-4">Reservation Placed</h3>
                <p className="text-neutral-400">Your request for {bookingRoom.name} at {activeBranch} has been sent to our concierge.</p>
              </div>
            ) : roomCheckoutStep === 'details' ? (
              <form onSubmit={(e) => { e.preventDefault(); setRoomCheckoutStep('payment'); }} className="space-y-10">
                <div className="text-center mb-10">
                  <span className="text-burgundy font-black tracking-widest uppercase text-[10px] mb-4 block">Secure Booking</span>
                  <h3 className="text-4xl font-sans italic mb-2">Reserve {bookingRoom.name}</h3>
                  <p className="text-neutral-400 text-sm italic">{activeBranch} Branch ID: GLAD-{activeBranch.toUpperCase().substring(0, 3)}</p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Check-in</label>
                    <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full bg-neutral-50 dark:bg-neutral-800 py-4 px-6 rounded-2xl outline-none focus:ring-1 ring-burgundy transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Check-out</label>
                    <input required type="date" min={new Date().toISOString().split('T')[0]} className="w-full bg-neutral-50 dark:bg-neutral-800 py-4 px-6 rounded-2xl outline-none focus:ring-1 ring-burgundy transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Your Name</label>
                  <input required placeholder="Full Name" className="w-full bg-neutral-50 dark:bg-neutral-800 py-4 px-6 rounded-2xl outline-none focus:ring-1 ring-burgundy transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Phone Number</label>
                  <input required type="tel" placeholder="+250 xxx xxx xxx" className="w-full bg-neutral-50 dark:bg-neutral-800 py-4 px-6 rounded-2xl outline-none focus:ring-1 ring-burgundy transition-all" />
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-2xl flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest">Total Estimated</p>
                    <p className="text-2xl font-black">${bookingRoom.price}<span className="text-sm opacity-40">/night</span></p>
                  </div>
                </div>
                <button type="submit" className="w-full bg-burgundy text-white py-6 rounded-4xl text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] transition-all">Continue to Payment</button>
              </form>
            ) : roomCheckoutStep === 'payment' ? (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-sans italic mb-2">Choose Payment Method</h3>
                  <p className="text-neutral-500 text-sm">Secure payment via card or mobile money</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setRoomPaymentMethod('card')}
                    className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${roomPaymentMethod === 'card'
                      ? 'border-burgundy bg-burgundy/5'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-burgundy/50'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${roomPaymentMethod === 'card' ? 'bg-burgundy text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                        }`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2" /><path strokeLinecap="round" strokeWidth="2" d="M2 10h20" /></svg>
                      </div>
                      <div className="text-center">
                        <p className="font-bold mb-1">Card Payment</p>
                        <p className="text-xs text-neutral-500">Visa, Mastercard, Amex</p>
                      </div>
                      {roomPaymentMethod === 'card' && (
                        <div className="w-6 h-6 bg-burgundy rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setRoomPaymentMethod('momo')}
                    className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${roomPaymentMethod === 'momo'
                      ? 'border-burgundy bg-burgundy/5'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-burgundy/50'
                      }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${roomPaymentMethod === 'momo' ? 'bg-burgundy text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                        }`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="text-center">
                        <p className="font-bold mb-1">Mobile Money</p>
                        <p className="text-xs text-neutral-500">MTN, Airtel Money</p>
                      </div>
                      {roomPaymentMethod === 'momo' && (
                        <div className="w-6 h-6 bg-burgundy rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {roomPaymentMethod === 'card' && (
                  <form onSubmit={(e) => { e.preventDefault(); setRoomCheckoutStep('confirmation'); }} className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-burgundy">Card Number</label>
                      <input type="text" required placeholder="1234 5678 9012 3456" maxLength={19} className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold mb-2 text-burgundy">Expiry</label>
                        <input type="text" required placeholder="MM/YY" maxLength={5} className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 text-burgundy">CVV</label>
                        <input type="text" required placeholder="123" maxLength={3} className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-burgundy">Cardholder Name</label>
                      <input type="text" required placeholder="Name on card" className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all" />
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => { setRoomCheckoutStep('details'); setRoomPaymentMethod(null); }} className="flex-1 border border-neutral-300 dark:border-neutral-700 py-4 px-6 rounded-full font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">Back</button>
                      <button type="submit" className="flex-1 bg-burgundy text-white py-4 px-6 rounded-full font-bold hover:brightness-125 transition-all">Proceed</button>
                    </div>
                  </form>
                )}

                {roomPaymentMethod === 'momo' && (
                  <form onSubmit={(e) => { e.preventDefault(); setRoomCheckoutStep('confirmation'); }} className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-burgundy">Provider</label>
                      <select required className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all">
                        <option value="">Select provider</option>
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="airtel">Airtel Money</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-burgundy">Phone Number</label>
                      <input type="tel" required placeholder="+250 7XX XXX XXX" className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all" />
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                        <div className="text-sm">
                          <p className="font-bold text-blue-900 dark:text-blue-300 mb-1">Payment Instructions</p>
                          <p className="text-blue-700 dark:text-blue-400">You will receive a prompt on your phone to authorize the payment.</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <button type="button" onClick={() => { setRoomCheckoutStep('details'); setRoomPaymentMethod(null); }} className="flex-1 border border-neutral-300 dark:border-neutral-700 py-4 px-6 rounded-full font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">Back</button>
                      <button type="submit" className="flex-1 bg-burgundy text-white py-4 px-6 rounded-full font-bold hover:brightness-125 transition-all">Send Request</button>
                    </div>
                  </form>
                )}

                {!roomPaymentMethod && (
                  <button onClick={() => setRoomCheckoutStep('details')} className="w-full border border-neutral-300 dark:border-neutral-700 py-4 px-6 rounded-full font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">Back</button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 space-y-6">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h3 className="text-3xl font-sans italic mb-2">Booking Confirmed!</h3>
                  <p className="text-neutral-500">Your {bookingRoom.name} reservation is confirmed</p>
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-2xl space-y-3 text-left max-w-sm mx-auto">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Room</span>
                    <span className="font-bold">{bookingRoom.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Location</span>
                    <span className="font-bold">{activeBranch}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Payment</span>
                    <span className="font-bold">{roomPaymentMethod === 'card' ? 'Card Payment' : 'Mobile Money'}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-3 border-t border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-500">Amount</span>
                    <span className="font-bold text-burgundy">${bookingRoom.price}/night</span>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 max-w-md mx-auto">A confirmation email has been sent. Our team will contact you shortly.</p>
                <button onClick={() => { setBookingRoom(null); setRoomCheckoutStep('details'); setRoomPaymentMethod(null); setBookingSuccess(true); setTimeout(() => setBookingSuccess(false), 3000); }} className="bg-burgundy text-white py-4 px-8 rounded-full font-bold hover:brightness-125 transition-all">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      {!isAdminWorkspace && (
        <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center pointer-events-none font-sans font-(--font-outfit) transition-all duration-300">
          <div className={`glass-nav rounded-full px-4 md:px-7 lg:px-8 flex items-center justify-between pointer-events-auto border border-neutral-200/70 dark:border-white/10 shadow-2xl transition-all duration-300 h-20 md:h-20 ${isNavCondensed ? 'w-[min(92vw,1220px)] xl:w-[min(90vw,1260px)]' : 'w-[min(96vw,1280px)] xl:w-[min(94vw,1320px)]'}`}>
            <div className="flex items-center gap-6 xl:gap-8">
              <button className="cursor-pointer shrink-0" onClick={() => setCurrentTab('Home')} aria-label="Go to Home">
                <Logo className="scale-75 md:scale-90" />
              </button>
              <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5" style={{ fontFamily: 'var(--font-outfit)' }} aria-label="Primary navigation">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCurrentTab(tab as any)}
                    aria-current={currentTab === tab ? 'page' : undefined}
                    className={`text-[10px] xl:text-[11px] font-semibold tracking-[0.08em] uppercase relative py-1.5 px-3 rounded-full border transition-colors ${currentTab === tab ? 'text-burgundy dark:text-white bg-white/90 dark:bg-white/20 border-neutral-200/80 dark:border-white/20 shadow-sm' : 'text-[#9d9d9d] dark:text-[#9d9d9d] border-transparent hover:text-[#787878] dark:hover:text-[#c4c4c4] hover:bg-white/65 dark:hover:bg-white/10'
                      }`}
                    style={{ fontFamily: 'var(--font-outfit)', fontWeight: 600 }}
                  >
                    {tab}
                    <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-0.75 bg-burgundy dark:bg-white transition-none rounded-full ${currentTab === tab ? 'w-full' : 'w-0'}`}></span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
              <div className="hidden sm:block">
                <BranchSelector activeBranch={activeBranch} onSelect={handleBranchSwitch} />
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="xl:hidden p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
                  aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-nav-drawer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
                </button>
                <button onClick={() => setCurrentTab('Rooms')} className="hidden md:block bg-burgundy text-white px-5 py-2.5 rounded-full text-[10px] font-semibold tracking-[0.08em] uppercase hover:brightness-110 transition-all shadow-lg">
                  Book Now
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Nav Drawer */}
          <div id="mobile-nav-drawer" role="dialog" aria-modal="true" className={`xl:hidden fixed inset-0 z-100 bg-white/98 dark:bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center space-y-10 transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-10 right-10 text-neutral-400"
              aria-label="Close mobile navigation"
            >
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="sm:hidden mb-8">
              <BranchSelector activeBranch={activeBranch} onSelect={handleBranchSwitch} />
            </div>
            {availableTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setCurrentTab(tab as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-[0.78rem] font-semibold tracking-[0.01em] uppercase transition-colors font-sans ${currentTab === tab ? 'text-burgundy' : 'text-neutral-900 dark:text-neutral-100'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>
      )}

      <main id="main-content" tabIndex={-1} className={`${isAdminWorkspace ? 'pt-0 min-h-screen' : 'pt-32 md:pt-44 min-h-screen'} transition-all duration-700 ease-in-out`} key={currentTab}>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {currentTab === 'Home' && (
            <HomeSection
              data={data}
              activeBranch={activeBranch}
              setCurrentTab={setCurrentTab}
              handleBranchSwitch={handleBranchSwitch}
              openImmersive={openImmersive}
              setCursorLabel={setCursorLabel}
              testimonials={testimonials}
              mappedNews={mappedNews}
            />
          )}
          {currentTab === 'About' && (
            <AboutSection
              activeBranch={activeBranch}
              activeFeatureIndex={activeFeatureIndex}
              setActiveFeatureIndex={setActiveFeatureIndex}
              teamMembers={data.teamMembers}
              isLoading={data.teamLoading}
            />
          )}

          {currentTab === 'Rooms' && (
            <RoomsSection data={data} activeBranch={activeBranch} setCurrentTab={setCurrentTab} show3DView={show3DView} setCursorLabel={setCursorLabel} openImmersive={openImmersive} openRoomBooking={openRoomBooking} setRotation={setRotation} setShow3DView={setShow3DView} start360Rotation={start360Rotation} />
          )}

          {currentTab === 'Services' && activeBranch !== Branch.KABEZA && (
            <section className="reveal max-w-7xl mx-auto px-6 py-20">
              <div className="mb-16 bg-neutral-50 dark:bg-neutral-900/40 rounded-[2.5rem] p-8 md:p-12 border border-neutral-200 dark:border-white/10">
                <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Lifestyle Services</span>
                <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tight mb-6 leading-[0.82]">Curated <br /> Experiences.</h2>
                <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl">
                  Discover signature services designed for comfort, wellness, and memorable stays.
                </p>
              </div>

              {data.servicesLoading ? (
                <LoadingScreen message="Loading services..." variant="section" />
              ) : (
                <>
                  {/* Category Filter */}
                  <div className="mb-12 flex flex-wrap gap-3 justify-start">
                    <button
                      onClick={() => setServiceCategory('all')}
                      className={`px-7 py-3.5 rounded-4xl text-[10px] font-black uppercase tracking-[0.18em] transition-all border ${serviceCategory === 'all'
                        ? 'bg-burgundy text-white border-burgundy shadow-xl scale-105'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        }`}
                    >
                      All Services
                    </button>
                    {Array.from(new Set(data.services.map(s => s.category))).map(category => (
                      <button
                        key={category}
                        onClick={() => setServiceCategory(category)}
                        className={`px-7 py-3.5 rounded-4xl text-[10px] font-black uppercase tracking-[0.18em] transition-all border ${serviceCategory === category
                          ? 'bg-burgundy text-white border-burgundy shadow-xl scale-105'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.services
                      .filter(service => serviceCategory === 'all' || service.category === serviceCategory)
                      .map((service, i) => (
                        <div
                          key={service.id}
                          className="relative group h-110 rounded-[2.25rem] overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-500 border border-neutral-200/60 dark:border-white/10"
                          onClick={() => setSelectedService(service)}
                          onMouseEnter={() => setCursorLabel('Explore Service')}
                          onMouseLeave={() => setCursorLabel(null)}
                        >
                          <img src={service.icon} alt={service.name} className="absolute inset-0 w-full h-full object-cover grayscale-[0.25] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.2s]" />
                          <div className="absolute inset-0 bg-linear-to-t from-black/86 via-black/30 to-black/8"></div>
                          <div className="absolute bottom-8 left-8 right-8 z-10">
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white! mb-3 block">
                              <Counter target={i + 1} zeroPad /> &bull; {service.category}
                            </span>
                            <h4 className="text-3xl font-black mb-3 text-white! leading-tight">{service.name}</h4>
                            <p className="text-sm text-white! font-normal leading-relaxed line-clamp-3">{service.description}</p>
                          </div>
                          <div className="absolute top-6 right-6 bg-burgundy/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Wellness Rates - Moved from About */}
                  <div className="mt-32 text-left">
                    <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-[3rem] p-12 border border-neutral-100 dark:border-white/5 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-burgundy/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                      <div className="text-center mb-12">
                        <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-4 block">Wellness & Recreation</span>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Sport Prices.</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {SPORT_PRICES.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-4 border-b border-neutral-200 dark:border-neutral-800">
                            <span className="font-bold text-lg text-white">{item.product}</span>
                            <span className="text-burgundy font-black text-xl">{item.price}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-center text-neutral-400 text-sm mt-8 italic">* Prices are per person unless otherwise stated. Monthly memberships available.</p>
                    </div>
                  </div>
                </>
              )}
            </section>
          )}

          {currentTab === 'Gallery' && (
            <GallerySection data={data} activeBranch={activeBranch} setCursorLabel={setCursorLabel} openImmersive={openImmersive} setCurrentTab={setCurrentTab} />
          )}

          {currentTab === 'Contact' && (
            <ContactSection activeBranch={activeBranch} data={data} />
          )}

          {currentTab === 'Feedback' && (
            <FeedbackSection />
          )}

          {currentTab === 'Admin' && authUser && (
            <section className="reveal h-[100dvh] w-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden">
              <div className="grid h-full grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="h-full bg-white dark:bg-neutral-900 p-4 md:p-5 shadow-[0_18px_45px_rgba(255,255,255,0.45)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)] border-r border-neutral-200 dark:border-white/10 flex flex-col font-(--font-outfit)">
                  <button
                    onClick={() => setAdminSection('profile')}
                    className="w-full mb-4 px-2 py-2 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <img src={isDark ? '/logo1.png' : '/logo.png'} alt="Glads Logo" className="h-12 w-auto object-contain shrink-0" />
                      <span>
                        <p className="text-base md:text-lg font-extrabold text-burgundy dark:text-white leading-tight">{uiRoleLabel(adminRole)}</p>
                      </span>
                    </span>
                  </button>
                  <div className="space-y-2 flex-1">
                    {allowedAdminSections.map(section => (
                      <button
                        key={section}
                        onClick={() => setAdminSection(section)}
                        className={`w-full text-left px-2 py-3 text-sm font-extrabold transition-all ${adminSection === section
                          ? 'rounded-xl bg-burgundy text-white shadow-lg'
                          : 'rounded-none bg-transparent text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white'
                          }`}
                      >
                        <span className="flex items-center gap-2.5">
                          {React.createElement(getAdminSectionIcon(section), { size: 18, strokeWidth: 2.2 })}
                          {formatAdminSectionLabel(section)}
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-auto pt-5 border-t border-neutral-200 dark:border-white/20">
                    <button
                      onClick={logoutAdmin}
                      className="w-full text-left px-2 py-3 text-sm font-extrabold text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white transition-all"
                    >
                      <span className="flex items-center gap-2.5">
                        <LogOut size={18} strokeWidth={2.2} />
                        Logout
                      </span>
                    </button>
                  </div>
                </aside>

                <div className="h-full overflow-y-auto p-5 md:p-8 lg:p-10 font-(--font-outfit)">
                  <div className="mb-6 rounded-2xl border border-burgundy/70 bg-burgundy p-4 md:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-[11px] font-extrabold tracking-[0.08em] text-white!">Admin workspace</p>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="rounded-lg bg-white/15 px-3 py-1.5 font-extrabold text-white!">
                            {uiRoleLabel(adminRole)}
                          </span>
                          <span className="rounded-lg bg-white/15 px-3 py-1.5 font-extrabold text-white!">
                            Branch: {activeBranch}
                          </span>
                          <span className="rounded-lg bg-white/15 px-3 py-1.5 font-extrabold text-white!">
                            Section: {formatAdminSectionLabel(adminSection)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8 pb-8">
                    {adminSection === 'profile' && (
                      <section className="mb-0 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 md:p-8 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-burgundy mb-3">Account Settings</p>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <form onSubmit={submitUpdateProfile} className="space-y-3 rounded-2xl border border-neutral-200 dark:border-white/10 p-4">
                            <h4 className="text-lg font-black">Update Profile</h4>
                            <input
                              type="text"
                              value={profileForm.fullName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                              placeholder="Full name"
                              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-burgundy"
                            />
                            <input
                              type="text"
                              value={profileForm.phone}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="Phone"
                              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-burgundy"
                            />
                            <div className="space-y-2">
                              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">Upload Profile Photo</label>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => void handleProfileImageUpload(e.target.files?.[0])}
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-burgundy file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                              />
                              {profileForm.profilePicture && (
                                <img
                                  src={profileForm.profilePicture}
                                  alt="Profile preview"
                                  className="h-20 w-20 rounded-xl object-cover border border-neutral-200 dark:border-white/10"
                                />
                              )}
                            </div>
                            <button
                              type="submit"
                              disabled={profileLoading || !authToken}
                              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60"
                            >
                              {profileLoading ? 'Saving...' : 'Save Profile'}
                            </button>
                            {profileMessage && <p className="text-xs text-neutral-600 dark:text-neutral-300">{profileMessage}</p>}
                          </form>

                          <form onSubmit={submitChangePassword} className="space-y-3 rounded-2xl border border-neutral-200 dark:border-white/10 p-4">
                            <h4 className="text-lg font-black">Change Password</h4>
                            <input
                              type="password"
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              placeholder="Current password"
                              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-burgundy"
                              required
                            />
                            <input
                              type="password"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              placeholder="New password"
                              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none focus:border-burgundy"
                              required
                            />
                            <button
                              type="submit"
                              disabled={passwordLoading || !authToken}
                              className="w-full md:w-auto px-5 py-2.5 rounded-xl border border-burgundy text-burgundy dark:text-white dark:border-white/30 text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60"
                            >
                              {passwordLoading ? 'Updating...' : 'Change Password'}
                            </button>
                            {passwordMessage && <p className="text-xs text-neutral-600 dark:text-neutral-300">{passwordMessage}</p>}
                          </form>
                        </div>
                      </section>
                    )}

                    {adminSection === 'profile' && (
                      <section className="mb-0 rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 md:p-8 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-burgundy mb-3">Role Access</p>
                        <h3 className="text-2xl md:text-3xl font-black tracking-tight">{uiRoleLabel(adminRole)} Permissions</h3>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
                          Permissions are aligned to backend API role rules for this account.
                        </p>
                        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {roleCapabilities.map((item) => (
                            <div key={item} className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200">
                              {item}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {adminSection === 'dashboard' && (
                      <AdminDashboard
                        role={adminRole}
                        branchId={activeBranchOption?.id || activeBranch}
                        branch={activeBranch}
                        branchOptions={branchOptions}
                        branchRevenues={adminBranchRevenue}
                        roomBookings={adminRoomBookings}
                        serviceBookings={adminServiceBookings}
                      />
                    )}

                    {adminSection === 'bookings' && (
                      <BookingManagement
                        role={adminRole}
                        branch={activeBranch}
                        roomBookings={adminRoomBookings}
                        serviceBookings={adminServiceBookings}
                      />
                    )}

                    {adminSection === 'services' && (
                      <ServiceManagement
                        branch={activeBranch}
                        services={data.services}
                        isSuperAdmin={adminRole === 'Super Admin'}
                        bookings={adminServiceBookings}
                        revenue={adminServiceRevenue}
                        createForm={serviceCreateForm}
                        setCreateForm={setServiceCreateForm}
                        onSubmitCreate={submitCreateService}
                        editForm={serviceEditForm}
                        setEditForm={setServiceEditForm}
                        onSubmitUpdate={submitUpdateService}
                        onDelete={submitDeleteService}
                        onIconUpload={handleServiceIconUpload}
                        onEditIconUpload={handleServiceEditIconUpload}
                        loading={opsLoading}
                      />
                    )}

                    {adminSection === 'operations' && (
                      <section className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <h3 className="text-4xl font-black tracking-tight">Operations Hub</h3>
                            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">Live API control panel for admin modules.</p>
                          </div>
                          <button
                            onClick={loadOperationsData}
                            disabled={opsLoading || !authToken}
                            className="px-5 py-3 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60"
                          >
                            {opsLoading ? 'Refreshing...' : 'Refresh Data'}
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-2 bg-neutral-100 dark:bg-neutral-800 p-2 rounded-2xl">
                          {allowedOpsTabs.map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setOpsTab(tab)}
                              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.14em] transition-all ${opsTab === tab ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-lg' : 'opacity-50'}`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {opsMessage && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 px-4 py-3">
                            {opsMessage}
                          </p>
                        )}

                        {opsTab === 'branches' && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {adminRole === 'Super Admin' ? (
                              <form onSubmit={submitCreateBranch} className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                                <h4 className="text-xl font-black">Create Branch</h4>
                                <input value={branchCreateForm.name} onChange={(e) => setBranchCreateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Branch name" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                <input value={branchCreateForm.code} onChange={(e) => setBranchCreateForm(prev => ({ ...prev, code: e.target.value }))} placeholder="Branch code" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                <input value={branchCreateForm.address} onChange={(e) => setBranchCreateForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Address" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                <div className="grid grid-cols-2 gap-3">
                                  <input value={branchCreateForm.latitude} onChange={(e) => setBranchCreateForm(prev => ({ ...prev, latitude: e.target.value }))} placeholder="Latitude" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                  <input value={branchCreateForm.longitude} onChange={(e) => setBranchCreateForm(prev => ({ ...prev, longitude: e.target.value }))} placeholder="Longitude" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <input value={branchCreateForm.phone} onChange={(e) => setBranchCreateForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                  <input value={branchCreateForm.email} onChange={(e) => setBranchCreateForm(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" type="email" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                </div>
                                <textarea value={branchCreateForm.description} onChange={(e) => setBranchCreateForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" rows={3} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none resize-none" required />
                                <button type="submit" disabled={opsLoading || adminRole !== 'Super Admin'} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Create Branch</button>
                              </form>
                            ) : (
                              <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                                <h4 className="text-xl font-black">Branch Access</h4>
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                                  Branch Manager can view branch records and manage branch-level operations (news, team, menus), but cannot create or delete branches.
                                </p>
                              </div>
                            )}
                            <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
                              <h4 className="text-xl font-black mb-4">Branches ({opsData.branches.length})</h4>
                              <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                                {opsData.branches.map((b: any) => (
                                  <div key={b.id || b.code} className="rounded-xl border border-neutral-200 dark:border-white/10 p-3">
                                    <p className="font-bold">{b.name || b.fullName || b.code}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                      {typeof b.address === 'string'
                                        ? b.address
                                        : b.address && typeof b.address === 'object'
                                          ? [b.address.street, b.address.city, b.address.country].filter(Boolean).join(', ')
                                          : b.code}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {opsTab === 'rooms' && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                              <form onSubmit={submitCreateRoom} className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                                <h4 className="text-xl font-black">Create Room</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                  Branch: <span className="font-bold">{activeBranch}</span>
                                  {!activeBranchOption?.id && <span className="text-amber-600 ml-1">(Select a branch)</span>}
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                  <input value={roomCreateForm.roomNumber} onChange={(e) => setRoomCreateForm((p) => ({ ...p, roomNumber: e.target.value }))} placeholder="Room number" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                  <select value={roomCreateForm.roomType} onChange={(e) => setRoomCreateForm((p) => ({ ...p, roomType: e.target.value as any }))} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none">
                                    <option value="standard">Standard</option>
                                    <option value="deluxe">Deluxe</option>
                                    <option value="suite">Suite</option>
                                    <option value="penthouse">Penthouse</option>
                                  </select>
                                </div>
                                <input value={roomCreateForm.name} onChange={(e) => setRoomCreateForm((p) => ({ ...p, name: e.target.value }))} placeholder="Room name" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                <textarea value={roomCreateForm.description} onChange={(e) => setRoomCreateForm((p) => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none resize-none" required />
                                <div className="grid grid-cols-3 gap-3">
                                  <input type="number" value={roomCreateForm.floor} onChange={(e) => setRoomCreateForm((p) => ({ ...p, floor: Number(e.target.value) || 1 }))} placeholder="Floor" min={0} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                  <input type="number" value={roomCreateForm.basePrice} onChange={(e) => setRoomCreateForm((p) => ({ ...p, basePrice: e.target.value }))} placeholder="Base price" min={0} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                  <input type="number" value={roomCreateForm.maxOccupancy} onChange={(e) => setRoomCreateForm((p) => ({ ...p, maxOccupancy: Number(e.target.value) || 2 }))} placeholder="Max guests" min={1} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <input value={roomCreateForm.sizeSqm} onChange={(e) => setRoomCreateForm((p) => ({ ...p, sizeSqm: e.target.value }))} placeholder="Size (sqm)" type="number" min={0} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                  <input value={roomCreateForm.bedType} onChange={(e) => setRoomCreateForm((p) => ({ ...p, bedType: e.target.value }))} placeholder="Bed type" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                  <input value={roomCreateForm.viewType} onChange={(e) => setRoomCreateForm((p) => ({ ...p, viewType: e.target.value }))} placeholder="View type" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none col-span-2" />
                                </div>
                                <input value={roomCreateForm.amenities as string} onChange={(e) => setRoomCreateForm((p) => ({ ...p, amenities: e.target.value }))} placeholder="Amenities (comma-separated: AC, TV, Minibar, Balcony)" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">Room Images</label>
                                  <input type="file" accept="image/*" multiple onChange={(e) => void handleRoomImagesUpload(e.target.files)} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-burgundy file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" />
                                  {roomCreateForm.images.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {roomCreateForm.images.map((img, i) => (
                                        <div key={i} className="relative">
                                          <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover border border-neutral-200 dark:border-white/10" />
                                          <button type="button" onClick={() => setRoomCreateForm((p) => ({ ...p, images: p.images.filter((_, j) => j !== i) }))} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center hover:bg-red-600">×</button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <button type="submit" disabled={opsLoading || !activeBranchOption?.id} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Create Room</button>
                              </form>

                              {roomEditForm && (
                                <form onSubmit={submitUpdateRoom} className="rounded-3xl border-2 border-burgundy/50 dark:border-burgundy/30 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                                  <h4 className="text-xl font-black">Edit Room</h4>
                                  <div className="grid grid-cols-2 gap-3">
                                    <input value={roomEditForm.roomNumber} onChange={(e) => setRoomEditForm((p) => p ? { ...p, roomNumber: e.target.value } : null)} placeholder="Room number" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                    <select value={roomEditForm.roomType} onChange={(e) => setRoomEditForm((p) => p ? { ...p, roomType: e.target.value } : null)} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none">
                                      <option value="standard">Standard</option>
                                      <option value="deluxe">Deluxe</option>
                                      <option value="suite">Suite</option>
                                      <option value="penthouse">Penthouse</option>
                                    </select>
                                  </div>
                                  <input value={roomEditForm.name} onChange={(e) => setRoomEditForm((p) => p ? { ...p, name: e.target.value } : null)} placeholder="Room name" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                  <textarea value={roomEditForm.description} onChange={(e) => setRoomEditForm((p) => p ? { ...p, description: e.target.value } : null)} placeholder="Description" rows={2} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none resize-none" />
                                  <div className="grid grid-cols-3 gap-3">
                                    <input type="number" value={roomEditForm.floor} onChange={(e) => setRoomEditForm((p) => p ? { ...p, floor: Number(e.target.value) || 1 } : null)} placeholder="Floor" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                    <input type="number" value={roomEditForm.basePrice} onChange={(e) => setRoomEditForm((p) => p ? { ...p, basePrice: e.target.value } : null)} placeholder="Base price" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                    <input type="number" value={roomEditForm.maxOccupancy} onChange={(e) => setRoomEditForm((p) => p ? { ...p, maxOccupancy: Number(e.target.value) || 2 } : null)} placeholder="Max guests" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                  </div>
                                  <select value={roomEditForm.status} onChange={(e) => setRoomEditForm((p) => p ? { ...p, status: e.target.value } : null)} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none">
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="blocked">Blocked</option>
                                  </select>
                                  <input value={roomEditForm.amenities} onChange={(e) => setRoomEditForm((p) => p ? { ...p, amenities: e.target.value } : null)} placeholder="Amenities (comma-separated)" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                  <div className="space-y-2">
                                    <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">Room Images</label>
                                    <input type="file" accept="image/*" multiple onChange={(e) => void handleRoomEditImagesUpload(e.target.files)} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-burgundy file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" />
                                    {roomEditForm.images.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {roomEditForm.images.map((img, i) => (
                                          <div key={i} className="relative">
                                            <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover border border-neutral-200 dark:border-white/10" />
                                            <button type="button" onClick={() => setRoomEditForm((p) => p ? { ...p, images: p.images.filter((_, j) => j !== i) } : null)} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center hover:bg-red-600">×</button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="submit" disabled={opsLoading} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Save Changes</button>
                                    <button type="button" onClick={() => setRoomEditForm(null)} className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-[11px] font-black uppercase tracking-[0.16em]">Cancel</button>
                                  </div>
                                </form>
                              )}
                            </div>

                            <div className="space-y-6">
                              <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
                                <h4 className="text-lg font-black mb-4">Check Room Availability</h4>
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Search for available rooms by date range (GET /api/rooms/search)</p>
                                <div className="flex flex-wrap gap-3 items-end">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Check-in</label>
                                    <input type="date" value={roomSearchForm.checkIn} onChange={(e) => setRoomSearchForm((p) => ({ ...p, checkIn: e.target.value }))} className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm outline-none" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Check-out</label>
                                    <input type="date" value={roomSearchForm.checkOut} onChange={(e) => setRoomSearchForm((p) => ({ ...p, checkOut: e.target.value }))} className="rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm outline-none" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Guests</label>
                                    <input type="number" min={1} value={roomSearchForm.guests} onChange={(e) => setRoomSearchForm((p) => ({ ...p, guests: Number(e.target.value) || 1 }))} className="w-20 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-sm outline-none" />
                                  </div>
                                  <button type="button" onClick={searchAvailableRooms} disabled={roomSearchLoading || !activeBranchOption?.id} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Search</button>
                                </div>
                                {roomSearchResults !== null && (
                                  <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-white/10">
                                    <p className="text-sm font-bold mb-2">{roomSearchResults.length} room(s) available</p>
                                    <div className="flex flex-wrap gap-2">
                                      {roomSearchResults.slice(0, 8).map((r: any) => (
                                        <span key={r.id} className="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 text-xs font-bold">{r.name || r.room_number} · ${Number(r.base_price ?? 0).toLocaleString()}/nt</span>
                                      ))}
                                      {roomSearchResults.length > 8 && <span className="text-xs text-neutral-500">+{roomSearchResults.length - 8} more</span>}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {opsData.roomStats && (
                                <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
                                  <h4 className="text-xl font-black mb-4">Room Statistics</h4>
                                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    <div className="rounded-xl border border-neutral-200 dark:border-white/10 p-3 text-center">
                                      <p className="text-2xl font-black">{opsData.roomStats.total}</p>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Total</p>
                                    </div>
                                    <div className="rounded-xl border border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/20 p-3 text-center">
                                      <p className="text-2xl font-black text-green-700 dark:text-green-400">{opsData.roomStats.available}</p>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Available</p>
                                    </div>
                                    <div className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/20 p-3 text-center">
                                      <p className="text-2xl font-black text-amber-700 dark:text-amber-400">{opsData.roomStats.occupied}</p>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Occupied</p>
                                    </div>
                                    <div className="rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/20 p-3 text-center">
                                      <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{opsData.roomStats.maintenance}</p>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Maintenance</p>
                                    </div>
                                    <div className="rounded-xl border border-neutral-200 dark:border-white/10 p-3 text-center">
                                      <p className="text-2xl font-black">{opsData.roomStats.blocked}</p>
                                      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Blocked</p>
                                    </div>
                                  </div>
                                  {opsData.roomStats.byType && Object.keys(opsData.roomStats.byType).length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-white/10">
                                      <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 mb-2">By Type</p>
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(opsData.roomStats.byType).map(([type, count]) => (
                                          <span key={type} className="rounded-lg bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-sm font-bold">{type}: {count}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
                                <h4 className="text-xl font-black mb-4">Rooms ({opsData.rooms.length})</h4>
                                <div className="space-y-3 max-h-[400px] overflow-auto pr-1">
                                  {opsData.rooms.length === 0 ? (
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4">No rooms yet. Create one above.</p>
                                  ) : (
                                    opsData.rooms.map((r: any) => (
                                      <div key={r.id} className="rounded-xl border border-neutral-200 dark:border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold">{r.name || r.room_number}</p>
                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">{r.room_type}</span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${r.status === 'available' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                                              r.status === 'occupied' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' :
                                                r.status === 'maintenance' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                                                  'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                                              }`}>{r.status || 'available'}</span>
                                          </div>
                                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                            ${Number(r.base_price ?? 0).toLocaleString()}/nt · {r.max_occupancy} guests · {r.size_sqm ? `${r.size_sqm} sqm` : ''}
                                          </p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => setRoomEditForm({
                                              id: r.id,
                                              roomNumber: r.room_number || '',
                                              roomType: r.room_type || 'deluxe',
                                              floor: r.floor ?? 1,
                                              name: r.name || '',
                                              description: r.description || '',
                                              basePrice: String(r.base_price ?? 0),
                                              maxOccupancy: r.max_occupancy ?? 2,
                                              sizeSqm: String(r.size_sqm ?? ''),
                                              bedType: r.bed_type || '',
                                              viewType: r.view_type || '',
                                              status: r.status || 'available',
                                              amenities: Array.isArray(r.amenities) ? r.amenities.join(', ') : (r.amenities || ''),
                                              images: Array.isArray(r.images) ? [...r.images] : (r.images ? [String(r.images)] : []),
                                            })}
                                            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-[10px] font-bold uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => submitDeleteRoom(r.id)}
                                            disabled={opsLoading}
                                            className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {opsTab === 'users' && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <form onSubmit={submitCreateUser} className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                              <h4 className="text-xl font-black">Register Staff</h4>
                              <p className="text-xs text-neutral-500 dark:text-neutral-400">Only Super Admin can create Branch Manager and Receptionist accounts.</p>
                              <input value={userCreateForm.fullName} onChange={(e) => setUserCreateForm(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Full name" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                              <input value={userCreateForm.email} onChange={(e) => setUserCreateForm(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" type="email" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                              <input value={userCreateForm.password} onChange={(e) => setUserCreateForm(prev => ({ ...prev, password: e.target.value }))} placeholder="Password" type="password" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                              <input value={userCreateForm.phone} onChange={(e) => setUserCreateForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone (optional)" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                              <select value={userCreateForm.role} onChange={(e) => setUserCreateForm(prev => ({ ...prev, role: e.target.value }))} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none">
                                <option value="branch-manager">Branch Manager</option>
                                <option value="receptionist">Receptionist</option>
                              </select>
                              <div className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-sm">
                                Branch: <span className="font-bold">{activeBranch}</span>
                              </div>
                              <button type="submit" disabled={opsLoading || adminRole !== 'Super Admin'} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Create Staff</button>
                            </form>
                            <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
                              <h4 className="text-xl font-black mb-4">Users ({opsData.users.length})</h4>
                              <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                                {opsData.users.map((u: any) => (
                                  <div key={u.id || u.email} className="rounded-xl border border-neutral-200 dark:border-white/10 p-3">
                                    <p className="font-bold">{u.fullName || u.name || u.email}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{u.email} • {u.role}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {opsTab === 'news' && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <form onSubmit={submitCreateNews} className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                              <h4 className="text-xl font-black">Create News</h4>
                              <input value={newsCreateForm.title} onChange={(e) => setNewsCreateForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                              <textarea value={newsCreateForm.content} onChange={(e) => setNewsCreateForm(prev => ({ ...prev, content: e.target.value }))} placeholder="Content" rows={4} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none resize-none" required />
                              <div className="space-y-2">
                                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">Upload News Image</label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  onChange={(e) => void handleNewsImageUpload(e.target.files?.[0])}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-burgundy file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                                />
                                {newsCreateForm.imageUrl && (
                                  <img src={newsCreateForm.imageUrl} alt="News preview" className="h-20 w-20 rounded-xl object-cover border border-neutral-200 dark:border-white/10" />
                                )}
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <select value={newsCreateForm.category} onChange={(e) => setNewsCreateForm(prev => ({ ...prev, category: e.target.value }))} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none">
                                  <option value="announcement">Announcement</option>
                                  <option value="event">Event</option>
                                  <option value="promotion">Promotion</option>
                                  <option value="maintenance">Maintenance</option>
                                </select>
                                <select value={newsCreateForm.scope} onChange={(e) => setNewsCreateForm(prev => ({ ...prev, scope: e.target.value }))} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none">
                                  <option value="global">Global</option>
                                  <option value="branch-specific">Branch Specific</option>
                                </select>
                              </div>
                              <select value={newsCreateForm.targetAudience} onChange={(e) => setNewsCreateForm(prev => ({ ...prev, targetAudience: e.target.value }))} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none">
                                <option value="all">All</option>
                                <option value="guests">Guests</option>
                                <option value="staff">Staff</option>
                              </select>
                              {newsCreateForm.scope === 'branch-specific' && (
                                <select value={newsCreateForm.branchId} onChange={(e) => setNewsCreateForm(prev => ({ ...prev, branchId: e.target.value }))} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required>
                                  <option value="">Select branch</option>
                                  {branchOptions.map((b) => (<option key={b.id} value={b.id}>{mapNameToBranch(b.name)}</option>))}
                                </select>
                              )}
                              <button type="submit" disabled={opsLoading} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Create News</button>
                            </form>

                            {newsEditForm && (
                              <form onSubmit={submitUpdateNews} className="rounded-3xl border-2 border-burgundy/50 dark:border-burgundy/30 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                                <h4 className="text-xl font-black">Edit News</h4>
                                <input value={newsEditForm.title} onChange={(e) => setNewsEditForm(prev => prev ? ({ ...prev, title: e.target.value }) : null)} placeholder="Title" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                <textarea value={newsEditForm.content} onChange={(e) => setNewsEditForm(prev => prev ? ({ ...prev, content: e.target.value }) : null)} placeholder="Content" rows={4} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none resize-none" required />
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">Upload News Image</label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => void handleNewsEditImageUpload(e.target.files?.[0])}
                                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-burgundy file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                                  />
                                  {newsEditForm.imageUrl && (
                                    <img src={newsEditForm.imageUrl} alt="News preview" className="h-20 w-20 rounded-xl object-cover border border-neutral-200 dark:border-white/10" />
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <select value={newsEditForm.category} onChange={(e) => setNewsEditForm(prev => prev ? ({ ...prev, category: e.target.value }) : null)} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none">
                                    <option value="announcement">Announcement</option>
                                    <option value="event">Event</option>
                                    <option value="promotion">Promotion</option>
                                    <option value="maintenance">Maintenance</option>
                                  </select>
                                  <select value={newsEditForm.scope} onChange={(e) => setNewsEditForm(prev => prev ? ({ ...prev, scope: e.target.value }) : null)} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none">
                                    <option value="global">Global</option>
                                    <option value="branch-specific">Branch Specific</option>
                                  </select>
                                </div>
                                <select value={newsEditForm.targetAudience} onChange={(e) => setNewsEditForm(prev => prev ? ({ ...prev, targetAudience: e.target.value }) : null)} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none">
                                  <option value="all">All</option>
                                  <option value="guests">Guests</option>
                                  <option value="staff">Staff</option>
                                </select>
                                <div className="flex gap-2">
                                  <button type="submit" disabled={opsLoading} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Save Changes</button>
                                  <button type="button" onClick={() => setNewsEditForm(null)} className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-[11px] font-black uppercase tracking-[0.16em]">Cancel</button>
                                </div>
                              </form>
                            )}
                            <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
                              <h4 className="text-xl font-black mb-4">News ({opsData.news.length})</h4>
                              <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                                {opsData.news.length === 0 ? (
                                  <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4">No news articles yet. Create one above.</p>
                                ) : (
                                  opsData.news.map((n: any, idx: number) => (
                                    <div key={n.id || idx} className="rounded-xl border border-neutral-200 dark:border-white/10 p-3 flex items-center justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold truncate">{n.title}</p>
                                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{n.category} • {n.scope}</p>
                                      </div>
                                      <div className="flex gap-2 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => setNewsEditForm({
                                            id: n.id,
                                            title: n.title,
                                            content: n.content,
                                            category: n.category,
                                            scope: n.scope,
                                            targetAudience: n.targetAudience,
                                            branchId: n.branchId,
                                            imageUrl: n.imageUrl,
                                            isPublished: n.isPublished,
                                            isPinned: n.isPinned,
                                          })}
                                          className="px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 text-[11px] font-bold uppercase transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        >
                                          Edit
                                        </button>
                                        {(adminRole === 'Super Admin') && (
                                          <button
                                            type="button"
                                            onClick={() => submitDeleteNews(n.id)}
                                            disabled={opsLoading}
                                            className="px-2 py-1 rounded border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-[11px] font-bold uppercase transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                                          >
                                            Delete
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {opsTab === 'team' && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                              <form onSubmit={submitCreateTeamMember} className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                                <h4 className="text-xl font-black">Create Team Member</h4>
                                <div className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-sm">
                                  Branch: <span className="font-bold">{activeBranch}</span>
                                </div>
                                <input value={teamCreateForm.fullName} onChange={(e) => setTeamCreateForm(prev => ({ ...prev, fullName: e.target.value }))} placeholder="Full name" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                <div className="grid grid-cols-2 gap-3">
                                  <input value={teamCreateForm.position} onChange={(e) => setTeamCreateForm(prev => ({ ...prev, position: e.target.value }))} placeholder="Position" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                  <input value={teamCreateForm.department} onChange={(e) => setTeamCreateForm(prev => ({ ...prev, department: e.target.value }))} placeholder="Department" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <input value={teamCreateForm.email} onChange={(e) => setTeamCreateForm(prev => ({ ...prev, email: e.target.value }))} placeholder="Email" type="email" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                  <input value={teamCreateForm.phone} onChange={(e) => setTeamCreateForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Phone" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                </div>
                                <textarea value={teamCreateForm.bio} onChange={(e) => setTeamCreateForm(prev => ({ ...prev, bio: e.target.value }))} placeholder="Bio" rows={3} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none resize-none" />
                                <div className="space-y-1">
                                  <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">Display Order</label>
                                  <input type="number" value={teamCreateForm.displayOrder} onChange={(e) => setTeamCreateForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 1 }))} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" min="1" />
                                </div>
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">Upload Team Photo</label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => void handleTeamPhotoUpload(e.target.files?.[0])}
                                    className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-burgundy file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                                  />
                                  {teamCreateForm.photoUrl && (
                                    <img src={teamCreateForm.photoUrl} alt="Team preview" className="h-20 w-20 rounded-xl object-cover border border-neutral-200 dark:border-white/10" />
                                  )}
                                </div>
                                <button type="submit" disabled={opsLoading} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Create Team Member</button>
                              </form>

                              {teamEditForm && (
                                <form onSubmit={submitUpdateTeamMember} className="rounded-3xl border-2 border-burgundy/50 dark:border-burgundy/30 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                                  <h4 className="text-xl font-black">Edit Team Member</h4>
                                  <input value={teamEditForm.fullName} onChange={(e) => setTeamEditForm(prev => prev ? { ...prev, fullName: e.target.value } : null)} placeholder="Full name" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                  <div className="grid grid-cols-2 gap-3">
                                    <input value={teamEditForm.position} onChange={(e) => setTeamEditForm(prev => prev ? { ...prev, position: e.target.value } : null)} placeholder="Position" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                    <input value={teamEditForm.department} onChange={(e) => setTeamEditForm(prev => prev ? { ...prev, department: e.target.value } : null)} placeholder="Department" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <input value={teamEditForm.email || ''} onChange={(e) => setTeamEditForm(prev => prev ? { ...prev, email: e.target.value } : null)} placeholder="Email" type="email" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                    <input value={teamEditForm.phone || ''} onChange={(e) => setTeamEditForm(prev => prev ? { ...prev, phone: e.target.value } : null)} placeholder="Phone" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" />
                                  </div>
                                  <textarea value={teamEditForm.bio || ''} onChange={(e) => setTeamEditForm(prev => prev ? { ...prev, bio: e.target.value } : null)} placeholder="Bio" rows={3} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none resize-none" />
                                  <div className="space-y-1">
                                    <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-500">Display Order</label>
                                    <input type="number" value={teamEditForm.displayOrder || 1} onChange={(e) => setTeamEditForm(prev => prev ? { ...prev, displayOrder: parseInt(e.target.value) || 1 } : null)} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" min="1" />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">Update Photo</label>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => void handleTeamEditPhotoUpload(e.target.files?.[0])}
                                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-burgundy file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                                    />
                                    {teamEditForm.photoUrl && (
                                      <img src={teamEditForm.photoUrl} alt="Team preview" className="h-20 w-20 rounded-xl object-cover border border-neutral-200 dark:border-white/10" />
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <button type="submit" disabled={opsLoading} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Save Changes</button>
                                    <button type="button" onClick={() => setTeamEditForm(null)} className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-[11px] font-black uppercase tracking-[0.16em]">Cancel</button>
                                  </div>
                                </form>
                              )}
                            </div>

                            <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
                              <h4 className="text-xl font-black mb-4">Team ({opsData.team.length})</h4>
                              <div className="space-y-3 max-h-[600px] overflow-auto pr-1">
                                {opsData.team.length === 0 ? (
                                  <p className="text-sm text-neutral-500 dark:text-neutral-400 py-4">No team members yet. Create one above.</p>
                                ) : (
                                  opsData.team.map((t: any, idx: number) => (
                                    <div key={t.id || idx} className="rounded-xl border border-neutral-200 dark:border-white/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <img src={t.photoUrl || '/hero.jpeg'} alt="" className="h-12 w-12 rounded-full object-cover border border-neutral-200 dark:border-white/10 shrink-0" />
                                        <div className="min-w-0">
                                          <p className="font-bold truncate">{t.fullName}</p>
                                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{t.position} • {t.department}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => setTeamEditForm({ ...t })}
                                          className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-600 text-[10px] font-bold uppercase hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => submitDeleteTeamMember(t.id)}
                                          disabled={opsLoading}
                                          className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {opsTab === 'menu' && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <form onSubmit={submitCreateMenu} className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                              <h4 className="text-xl font-black">Create Menu</h4>
                              <div className="w-full rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 text-sm">
                                Branch: <span className="font-bold">{activeBranch}</span>
                              </div>
                              <input value={menuCreateForm.name} onChange={(e) => setMenuCreateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Menu name" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                              <div className="space-y-2">
                                <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">Upload Menu (Image or PDF)</label>
                                <input type="file" accept="image/*,application/pdf" onChange={(e) => void handleMenuFileUpload(e.target.files?.[0])} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-burgundy file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" />
                                {menuCreateForm.menuUrl && (
                                  <p className="text-xs text-green-600 dark:text-green-400">File selected. {menuCreateForm.menuUrl.startsWith('data:image') ? 'Image ready.' : 'PDF ready.'}</p>
                                )}
                              </div>
                              <input value={menuCreateForm.effectiveDate} onChange={(e) => setMenuCreateForm(prev => ({ ...prev, effectiveDate: e.target.value }))} type="date" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                              <button type="submit" disabled={opsLoading} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Create Menu</button>
                            </form>

                            {menuEditForm && (
                              <form onSubmit={submitUpdateMenu} className="rounded-3xl border-2 border-burgundy/50 dark:border-burgundy/30 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                                <h4 className="text-xl font-black">Edit Menu</h4>
                                <input value={menuEditForm.name} onChange={(e) => setMenuEditForm(prev => prev ? { ...prev, name: e.target.value } : null)} placeholder="Menu name" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                <div className="space-y-2">
                                  <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">Update Menu File</label>
                                  <input type="file" accept="image/*,application/pdf" onChange={(e) => void handleMenuEditFileUpload(e.target.files?.[0])} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none file:mr-3 file:rounded-lg file:border-0 file:bg-burgundy file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" />
                                  {menuEditForm.menuUrl && (
                                    <p className="text-xs text-green-600 dark:text-green-400">File selected.</p>
                                  )}
                                </div>
                                <input value={menuEditForm.effectiveDate} onChange={(e) => setMenuEditForm(prev => prev ? { ...prev, effectiveDate: e.target.value } : null)} type="date" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                                <div className="flex gap-2">
                                  <button type="submit" disabled={opsLoading} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Save Changes</button>
                                  <button type="button" onClick={() => setMenuEditForm(null)} className="px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-[11px] font-black uppercase tracking-[0.16em]">Cancel</button>
                                </div>
                              </form>
                            )}
                            <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
                              <h4 className="text-xl font-black mb-4">Menus ({opsData.menu.length})</h4>
                              <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                                {opsData.menu.map((m: any, idx: number) => (
                                  <div key={m.id || idx} className="rounded-xl border border-neutral-200 dark:border-white/10 p-3">
                                    <p className="font-bold">{m.name}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{m.effectiveDate || m.createdAt}</p>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setMenuEditForm({
                                          id: m.id,
                                          name: m.name,
                                          menuUrl: m.menuUrl || '',
                                          effectiveDate: m.effectiveDate || '',
                                          description: m.description || '',
                                          branchId: activeBranchOption?.id || ''
                                        })}
                                        className="px-2 py-1 rounded border border-neutral-300 text-[10px] font-bold uppercase"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => submitDeleteMenu(m.id)}
                                        className="px-2 py-1 rounded border border-red-200 text-red-600 text-[10px] font-bold uppercase"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {opsTab === 'settings' && (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <form onSubmit={submitCreateSetting} className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6 space-y-3">
                              <h4 className="text-xl font-black">Create System Setting</h4>
                              <input value={settingCreateForm.key} onChange={(e) => setSettingCreateForm(prev => ({ ...prev, key: e.target.value }))} placeholder="Setting key" className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none" required />
                              <textarea value={settingCreateForm.valueJson} onChange={(e) => setSettingCreateForm(prev => ({ ...prev, valueJson: e.target.value }))} placeholder='{"example":"value"}' rows={5} className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm outline-none resize-none" required />
                              <button type="submit" disabled={opsLoading || adminRole !== 'Super Admin'} className="px-5 py-2.5 rounded-xl bg-burgundy text-white text-[11px] font-black uppercase tracking-[0.16em] disabled:opacity-60">Create Setting</button>
                            </form>
                            <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
                              <h4 className="text-xl font-black mb-4">Settings ({opsData.settings.length})</h4>
                              <div className="space-y-3 max-h-[420px] overflow-auto pr-1">
                                {opsData.settings.map((s: any, idx: number) => (
                                  <div key={s.id || s.key || idx} className="rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 p-3">
                                    <p className="font-bold text-sm">{s.key || `setting-${idx + 1}`}</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{s.description || 'No description'}</p>
                                    <p className="text-xs mt-2 font-mono break-all text-neutral-700 dark:text-neutral-300">
                                      {typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value ?? '')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {(['payments', 'audit'] as const).includes(opsTab as any) && (
                          <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
                            <h4 className="text-xl font-black mb-4 uppercase">{opsTab}</h4>
                            {(opsData as any)[opsTab]?.length ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                  <thead>
                                    <tr className="text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-white/10">
                                      <th className="py-3 pr-4">ID</th>
                                      <th className="py-3 pr-4">Type/Status</th>
                                      <th className="py-3 pr-4">Amount/Action</th>
                                      <th className="py-3">Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(opsData as any)[opsTab].slice(0, 50).map((row: any, idx: number) => (
                                      <tr key={row.id || row.key || idx} className="border-b border-neutral-100 dark:border-white/5">
                                        <td className="py-3 pr-4 font-medium">{row.id || row.paymentId || row.logId || `row-${idx + 1}`}</td>
                                        <td className="py-3 pr-4 text-neutral-600 dark:text-neutral-300">{row.status || row.action || row.entityType || '-'}</td>
                                        <td className="py-3 pr-4">{row.amount || row.totalAmount || row.entityId || '-'}</td>
                                        <td className="py-3 text-neutral-500 dark:text-neutral-400">{row.createdAt || row.timestamp || row.date || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : <p className="text-sm text-neutral-500 dark:text-neutral-400">No data available for this module.</p>}
                          </div>
                        )}

                        {opsTab === 'analytics' && (
                          <div className="rounded-3xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 p-6">
                            <h4 className="text-xl font-black mb-4">Revenue Analytics</h4>
                            {opsData.analytics ? (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Object.entries(opsData.analytics)
                                  .filter(([, v]) => ['number', 'string'].includes(typeof v))
                                  .slice(0, 6)
                                  .map(([k, v]) => (
                                    <div key={k} className="rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900 p-4">
                                      <p className="text-[10px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">{k}</p>
                                      <p className="text-xl font-black mt-1">{String(v)}</p>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <p className="text-sm text-neutral-500 dark:text-neutral-400">No analytics payload returned.</p>
                            )}
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {!isAdminWorkspace && (
        <footer className="relative border-t border-neutral-100 dark:border-neutral-900 py-28 px-6 md:px-10 mt-32 overflow-hidden">
          {/* Hero Image Background with Enhanced Dark Red Overlay */}
          <div className="absolute inset-0 z-0">
            <img src="/hero.jpeg" alt="Footer Background" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 bg-linear-to-t from-red-950 via-red-950/95 to-red-900/90 dark:from-black dark:via-black/95 dark:to-neutral-950/90"></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10 bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between items-center gap-14 md:gap-20">
              <div className="flex flex-col items-center md:items-start">
                <div className="mb-8" style={{ filter: 'brightness(0) invert(1)' }}>
                  <Logo className="scale-[2.0]" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white! opacity-90 max-w-sm text-center md:text-left leading-relaxed">GLADS APARTMENT HOTEL &bull; KIGALI, RWANDA</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white! opacity-80 max-w-sm text-center md:text-left leading-relaxed mt-2">One Brand &bull; Three Locations &bull; Ultimate Experience</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-14 text-[11px] font-black tracking-[0.34em] uppercase text-white!">
                <div className="space-y-6">
                  <p className="text-white! mb-8 text-sm font-black opacity-100">Quick Access</p>
                  <button onClick={() => openAdminArea('dashboard')} className="block text-white/90! hover:text-white! transition-all text-left text-xs font-bold hover:translate-x-1">Admin Dashboard</button>
                  <button onClick={() => openAdminArea('bookings')} className="block text-white/90! hover:text-white! transition-all text-left text-xs font-bold hover:translate-x-1">Booking Management</button>
                  <button onClick={() => openAdminArea('services')} className="block text-white/90! hover:text-white! transition-all text-left text-xs font-bold hover:translate-x-1">Service Management</button>
                  <button onClick={() => openAdminArea('operations')} className="block text-white/90! hover:text-white! transition-all text-left text-xs font-bold hover:translate-x-1">Operations Hub</button>
                  <button onClick={() => setShowLocationGuide(true)} className="block text-white/90! hover:text-white! transition-all text-left text-xs font-bold hover:translate-x-1">Location Guide</button>
                </div>
                <div className="space-y-6">
                  <p className="text-white! mb-8 text-sm font-black opacity-100">Branches</p>
                  <button onClick={() => handleBranchSwitch(Branch.NDERA)} className="block text-white/90! hover:text-white! transition-all uppercase text-left text-xs font-bold hover:translate-x-1">Ndera Flagship</button>
                  <button onClick={() => handleBranchSwitch(Branch.KANOMBE)} className="block text-white/90! hover:text-white! transition-all uppercase text-left text-xs font-bold hover:translate-x-1">Kanombe (KMH)</button>
                  <button onClick={() => handleBranchSwitch(Branch.KABEZA)} className="block text-white/90! hover:text-white! transition-all uppercase text-left text-xs font-bold hover:translate-x-1">Kabeza (Rubirizi)</button>
                </div>
                <div className="space-y-6">
                  <p className="text-white! mb-8 text-sm font-black opacity-100">Legal</p>
                  <button onClick={() => setLegalDoc('privacy')} className="block text-white/90! hover:text-white! transition-all text-xs font-bold hover:translate-x-1 text-left">Privacy Policy</button>
                  <button onClick={() => setLegalDoc('terms')} className="block text-white/90! hover:text-white! transition-all text-xs font-bold hover:translate-x-1 text-left">Terms of Service</button>
                  <button onClick={() => setLegalDoc('booking')} className="block text-white/90! hover:text-white! transition-all text-xs font-bold hover:translate-x-1 text-left">Booking Terms</button>
                  <button onClick={() => setCurrentTab('Feedback')} className="block text-white/90! hover:text-white! transition-all text-xs font-bold hover:translate-x-1 text-left">Feedback</button>
                </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/20 dark:border-neutral-900 text-[10px] font-black tracking-[0.5em] uppercase text-white/80! text-center md:text-left relative z-10">
            &copy; 2026 GLADS APARTMENT HOTEL. PREMIUM HOSPITALITY. RWANDA.
          </div>
        </footer>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-175 bg-black/75 backdrop-blur-xl flex items-center justify-center p-4 md:p-6" onClick={() => setShowAuthModal(false)}>
          <div className="relative w-full max-w-5xl rounded-4xl border border-white/20 bg-white dark:bg-neutral-900 shadow-[0_40px_120px_rgba(0,0,0,0.55)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowAuthModal(false)}
              aria-label="Close login modal"
              className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full border border-white/20 text-white bg-black/30 hover:bg-black/50 transition-colors"
            >
              X
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="relative min-h-[280px] lg:min-h-[540px] p-8 md:p-10 lg:p-12 text-white">
                <img src="/hero.jpeg" alt="GLADS Admin Access" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/65 to-burgundy/70" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <span className="inline-block text-[10px] font-black uppercase tracking-[0.28em] bg-white/15 border border-white/25 rounded-full px-4 py-2">
                      Staff Portal
                    </span>
                    <h3 className="mt-6 text-3xl md:text-4xl font-black leading-tight uppercase">Admin Access</h3>
                    <p className="mt-4 text-sm md:text-base text-white/85 max-w-md">
                      Secure sign-in for Super Admin, Branch Manager, and Receptionist accounts.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.18em]">
                      <span className="px-3 py-1.5 rounded-full border border-white/30 bg-white/10">Ndera</span>
                      <span className="px-3 py-1.5 rounded-full border border-white/30 bg-white/10">Kanombe</span>
                      <span className="px-3 py-1.5 rounded-full border border-white/30 bg-white/10">Kabeza</span>
                    </div>
                    <p className="text-xs text-white/75">One brand. One platform. Branch-aware operations.</p>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 lg:p-12 bg-white dark:bg-neutral-900">
                <div className="max-w-md">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-burgundy">Sign In</p>
                  <h4 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">Welcome Back</h4>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Use your staff credentials to continue.</p>

                  <form onSubmit={submitPasswordLogin} className="mt-7 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">Email</label>
                      <input
                        type="email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="staff@gladsapartment.rw"
                        className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3.5 text-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-600 dark:text-neutral-300">Password</label>
                      <input
                        type="password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3.5 text-sm outline-none focus:border-burgundy focus:ring-2 focus:ring-burgundy/20 transition-all"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-burgundy text-white py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.18em] hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                    >
                      {authLoading ? 'Signing In...' : 'Access Dashboard'}
                    </button>
                  </form>

                  {authError && (
                    <p className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl px-4 py-3">
                      {authError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legal Modal */}
      {legalDoc && (
        <div className="fixed inset-0 z-170 bg-black/70 backdrop-blur-lg flex items-center justify-center p-4" onClick={() => setLegalDoc(null)}>
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-4xl border border-white/15 bg-white dark:bg-neutral-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 md:px-8 py-5 border-b border-neutral-200 dark:border-white/10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">{LEGAL_CONTENT[legalDoc].title}</h3>
              <button
                onClick={() => setLegalDoc(null)}
                aria-label="Close legal document"
                className="w-10 h-10 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                ?
              </button>
            </div>
            <div className="px-6 md:px-8 py-6 md:py-7 space-y-6">
              {LEGAL_CONTENT[legalDoc].sections.map((section) => (
                <section key={section.heading} className="rounded-2xl border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/3 p-5">
                  <h4 className="text-sm md:text-base font-black uppercase tracking-[0.16em] text-burgundy mb-2">{section.heading}</h4>
                  <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">{section.body}</p>
                </section>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Branch Selector Modal */}
      {showBranchSelector && (
        <div className="fixed inset-0 z-160 bg-black/40 backdrop-blur-2xl flex items-center justify-center p-6 animate-fadeIn" onClick={() => { setShowBranchSelector(false); }}>
          <div className="bg-white/90 dark:bg-neutral-900/90 rounded-[4rem] p-12 max-w-5xl w-full shadow-[0_0_150px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/5 animate-in zoom-in-95 duration-700 font-sans" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-12">
              <h3 className="text-6xl font-black uppercase tracking-tighter mb-4">Where Can We Take You?</h3>
              <p className="text-neutral-500 text-lg">Select your preferred GLADS location</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.values(BRANCH_DATA).map((branchData) => (
                <button
                  key={branchData.id}
                  onClick={() => {
                    handleBranchSwitch(branchData.id);
                    setShowBranchSelector(false);
                  }}
                  className="group relative h-100 rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                >
                  <img
                    src={branchData.gallery[0]}
                    alt={branchData.fullName}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>

                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <div className="mb-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">{branchData.location.distance}</span>
                    </div>
                    <h4 className="text-3xl font-black uppercase text-white mb-2">{branchData.id}</h4>
                    <p className="text-sm text-white/80 mb-4">{branchData.tagline}</p>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                      <span>{branchData.location.address}</span>
                    </div>
                  </div>

                  {activeBranch === branchData.id && (
                    <div className="absolute top-6 right-6 bg-burgundy text-white px-4 py-2 rounded-full text-xs font-black">
                      CURRENT
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowBranchSelector(false)}
              className="mt-12 w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 py-4 rounded-4xl text-sm font-black uppercase tracking-wider hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
