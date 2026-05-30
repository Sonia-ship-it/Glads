import { useState, useCallback, useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Branch, RoomType, AdminRole, Service, TeamMember } from '../types';
import { BRANCH_DATA } from '../constants';
import { subscribeToBranchChanges, setStoredBranch } from '@/lib/branchSelection';
import { LayoutDashboard, CalendarCheck2, Settings2, UserCircle2, Leaf, MessageSquareQuote } from 'lucide-react';

type Tab = 'Home' | 'About' | 'Rooms' | 'Services' | 'Gallery' | 'Contact' | 'Admin' | 'Feedback';
type LegalDoc = 'dashboard' | 'bookings' | 'services' | 'operations' | 'profile' | 'feedback';
type LegalDocKey = 'privacy' | 'terms' | 'booking';
type BranchOption = { id: string; name: string; code?: string; isActive?: boolean };
type AuthUser = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  branchId?: string;
};

const API_BASE = 'http://localhost:3001/api';
const TEMP_SUPER_ADMIN_EMAIL = 'admin@glads.com';
const TEMP_SUPER_ADMIN_PASSWORD = 'Glads@2026@';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const REQUEST_TIMEOUT_MS = 12000;

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
      branchId: parsed?.branch_id || parsed?.branchId || parsed?.user_metadata?.branch_id || parsed?.user_metadata?.branchId,
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
  '/receptionist': 'Admin',
  '/branchmanager': 'Admin',
  '/feedback': 'Feedback',
};


export const useMainAppState = (initialTab: Tab = 'Home') => {
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
  const [adminSection, setAdminSection] = useState<LegalDoc>('dashboard');
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
  const [liveTestimonials, setLiveTestimonials] = useState<any[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [branchesLoaded, setBranchesLoaded] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '', profilePicture: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [opsTab, setOpsTab] = useState<'branches' | 'rooms' | 'users' | 'news' | 'testimonials' | 'team' | 'menu' | 'payments' | 'analytics' | 'settings' | 'audit'>('branches');
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
    feedback: [] as any[],
    testimonials: [] as any[],
    services: [] as any[],
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
  const [feedbackEditForm, setFeedbackEditForm] = useState<{
    id: string;
    status: string;
    response: string;
    fullName: string;
    email: string;
    message: string;
    subject: string;
  } | null>(null);

  const [testimonialCreateForm, setTestimonialCreateForm] = useState({
    guestName: '',
    guestRole: '',
    quote: '',
    rating: 5,
    source: 'direct',
    isFeatured: true,
  });

  const [testimonialEditForm, setTestimonialEditForm] = useState<{
    id: string;
    guestName: string;
    guestRole?: string;
    quote: string;
    rating?: number;
    source?: string;
    isFeatured?: boolean;
    isActive?: boolean;
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
        // setShowChatAssistant(true); // Feature not implemented yet
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
    () => {
      // 1. If we have a logged-in user with a specific branchId, that's the absolute truth
      if (authUser?.branchId) {
        const found = branchOptions.find((b) => b.id === authUser.branchId);
        if (found) return found;
      }
      // 2. Fallback to name matching with the activeBranch state (from public selector)
      const matches = branchOptions.filter((b) => mapNameToBranch(b.name) === activeBranch);
      if (matches.length === 0) return null;
      // Prefer active branch if multiple matches
      return matches.find(m => m.isActive) || matches[0];
    },
    [branchOptions, activeBranch, authUser?.branchId]
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
      // Force display of ONLY API data (do not use hardcoded local files)
      rooms: useApiData ? liveRooms : [],
      services: useApiData ? liveServices : [],
      teamMembers: useApiData ? liveTeamMembers : [],
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
  const testimonials = useMemo(() => {
    if (liveTestimonials.length > 0) {
      return liveTestimonials.map(t => ({
        quote: t.quote,
        initials: (t.guestName || 'G').substring(0, 2).toUpperCase(),
        name: t.guestName,
        role: t.guestRole || 'Guest'
      }));
    }
    return [
      { quote: 'An exceptional experience. The attention to detail and level of service exceeded all expectations.', initials: 'JD', name: 'James Davidson', role: 'Business Executive' },
      { quote: 'The perfect blend of luxury and comfort with impeccable hospitality from check-in to check-out.', initials: 'SM', name: 'Sarah Mitchell', role: 'Travel Blogger' },
      { quote: 'Outstanding location, elegant rooms, and a team that consistently goes above and beyond.', initials: 'MC', name: 'Michael Chen', role: 'Entrepreneur' },
    ];
  }, [liveTestimonials]);

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
    if (role === 'Branch Manager') return ['dashboard', 'bookings', 'services', 'operations', 'feedback', 'profile'];
    return ['dashboard', 'bookings', 'services', 'operations', 'feedback', 'profile'];
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

  const allOpsTabs: Array<'branches' | 'rooms' | 'users' | 'news' | 'testimonials' | 'team' | 'menu' | 'payments' | 'analytics' | 'settings' | 'audit'> = [
    'branches', 'rooms', 'users', 'news', 'testimonials', 'team', 'menu', 'payments', 'analytics', 'settings', 'audit',
  ];

  const allowedOpsTabs = useMemo(() => {
    if (adminRole === 'Super Admin') return allOpsTabs;
    if (adminRole === 'Branch Manager') return ['branches', 'rooms', 'news', 'testimonials', 'team', 'menu'] as Array<typeof allOpsTabs[number]>;
    return [] as Array<typeof allOpsTabs[number]>;
  }, [adminRole]);

  const formatAdminSectionLabel = (section: LegalDoc): string => {
    if (section === 'bookings') return 'Booking Desk';
    if (section === 'services') return 'Services';
    if (section === 'operations') return 'Operations';
    if (section === 'profile') return 'My Profile';
    if (section === 'feedback') return 'Feedback';
    return 'Dashboard';
  };

  const getAdminSectionIcon = (section: LegalDoc) => {
    if (section === 'dashboard') return LayoutDashboard;
    if (section === 'bookings') return CalendarCheck2;
    if (section === 'services') return Settings2;
    if (section === 'profile') return UserCircle2;
    if (section === 'feedback') return Leaf;
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
      rawBranchId: b?.branchId,
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
      rawBranchId: b?.branchId,
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
    // Normalize user object fields (snake_case from backend to camelCase for frontend)
    const normalizedUser: AuthUser = {
      ...user,
      id: user.id || (user as any).sub,
      role: (user as any).role || (user as any).user_metadata?.role,
      firstName: user.firstName || (user as any).first_name || (user as any).user_metadata?.first_name || (user as any).user_metadata?.firstName || '',
      lastName: user.lastName || (user as any).last_name || (user as any).user_metadata?.last_name || (user as any).user_metadata?.lastName || '',
      branchId: user.branchId || (user as any).branch_id || (user as any).user_metadata?.branch_id || (user as any).user_metadata?.branchId,
    };

    setAuthToken(token);
    setAuthUser(normalizedUser);
    const role = mapBackendRoleToAdminRole(normalizedUser.role);
    setAdminRole(role);
    localStorage.setItem('glads-auth-token', token);

    // After login/restoration, check if we need to redirect to the correct role-based dashboard
    if (pathname === '/admin' || pathname === '/receptionist' || pathname === '/branchmanager') {
      if (role === 'Reception' && pathname !== '/receptionist') router.push('/receptionist');
      else if (role === 'Branch Manager' && pathname !== '/branchmanager') router.push('/branchmanager');
      else if (role === 'Super Admin' && pathname !== '/admin') router.push('/admin');
    }
  };

  useEffect(() => {
    if (authHydrated && authUser && (pathname === '/admin' || pathname === '/receptionist' || pathname === '/branchmanager')) {
      const role = mapBackendRoleToAdminRole(authUser.role);
      if (role === 'Reception' && pathname !== '/receptionist') router.push('/receptionist');
      else if (role === 'Branch Manager' && pathname !== '/branchmanager') router.push('/branchmanager');
      else if (role === 'Super Admin' && pathname !== '/admin') router.push('/admin');
    }
  }, [authHydrated, authUser, pathname, router]);

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
          isActive: b.is_active === true || b.isActive === true
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
        const pRooms = fetch(`${API_BASE}/rooms?branchId=${encodeURIComponent(activeBranchOption.id)}`)
          .then(res => res.ok ? res.json() : [])
          .then(roomsRaw => setLiveRooms((Array.isArray(roomsRaw) ? roomsRaw : []).map(mapApiRoomToUiRoom)))
          .catch(console.error);

        const pServices = fetch(`${API_BASE}/services?branchId=${encodeURIComponent(activeBranchOption.id)}`)
          .then(res => res.ok ? res.json() : [])
          .then(servicesRaw => setLiveServices((Array.isArray(servicesRaw) ? servicesRaw : []).map(mapApiServiceToUiService)))
          .catch(console.error);

        const pTeam = fetch(`${API_BASE}/team?branchId=${encodeURIComponent(activeBranchOption.id)}`)
          .then(res => res.ok ? res.json() : [])
          .then(teamRaw => setLiveTeamMembers((Array.isArray(teamRaw) ? teamRaw : []).map(mapApiTeamToUiTeam)))
          .catch(console.error);

        await Promise.allSettled([pRooms, pServices, pTeam]);
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
    const loadTestimonials = async () => {
      try {
        const res = await fetch(`${API_BASE}/testimonials`);
        if (!res.ok) {
          setLiveTestimonials([]);
          return;
        }
        const raw = await res.json();
        setLiveTestimonials(Array.isArray(raw) ? raw : []);
      } catch {
        setLiveTestimonials([]);
      }
    };
    loadNews();
    loadTestimonials();
  }, []);

  useEffect(() => {
    if (!authToken) return;
    if (currentTab !== 'Admin') return;

    // Targeted fetch: drastically speeds up loading by only getting what is visible
    loadOperationsData(false);
  }, [authToken, currentTab, adminSection, opsTab, activeBranchOption?.id]);

  useEffect(() => {
    if (!authHydrated || authLoading) return;
    if (currentTab === 'Admin' && !authUser) {
      setCurrentTab('Home');
      setShowAuthModal(true);
    }
  }, [currentTab, authUser, authHydrated, authLoading]);

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

  const loadOperationsData = async (forceAll = false) => {
    if (!authToken) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      const canAccess = (tab: string) => allowedOpsTabs.includes(tab as any);
      const branchId = activeBranchOption?.id;
      const queryParams = branchId ? `?branchId=${encodeURIComponent(branchId)}` : '';

      const promises = [];

      const needsBranches = forceAll || (adminSection === 'operations' && opsTab === 'branches');
      const needsRooms = forceAll || (adminSection === 'operations' && opsTab === 'rooms');
      const needsUsers = forceAll || (adminSection === 'operations' && opsTab === 'users');
      const needsNews = forceAll || (adminSection === 'operations' && opsTab === 'news');
      const needsTeam = forceAll || (adminSection === 'operations' && opsTab === 'team');
      const needsMenu = forceAll || (adminSection === 'operations' && opsTab === 'menu');
      const needsPayments = forceAll || (adminSection === 'operations' && opsTab === 'payments');
      const needsSettings = forceAll || (adminSection === 'operations' && opsTab === 'settings');
      const needsAudit = forceAll || (adminSection === 'operations' && opsTab === 'audit');
      const needsTestimonials = forceAll || (adminSection === 'operations' && opsTab === 'testimonials');

      const needsFeedback = forceAll || adminSection === 'feedback';
      const needsServices = forceAll || adminSection === 'services';

      if (needsBranches && canAccess('branches')) {
        promises.push(apiRequest('/branches').then(d => setOpsData(p => ({ ...p, branches: Array.isArray(d) ? d : [] }))));
      }
      if (needsRooms && canAccess('rooms')) {
        promises.push(apiRequest(`/rooms${queryParams}`).then(d => {
          const rooms = Array.isArray(d) ? d : [];
          setOpsData(p => ({ ...p, rooms }));
          if (branchId) setLiveRooms(rooms.map(mapApiRoomToUiRoom));
        }));
        if (branchId) promises.push(apiRequest(`/rooms/${branchId}/stats`).then(d => setOpsData(p => ({ ...p, roomStats: d }))));
      }
      if (needsUsers && canAccess('users')) {
        promises.push(apiRequest('/users').then(d => setOpsData(p => ({ ...p, users: Array.isArray(d) ? d : [] }))));
      }
      if (needsNews && canAccess('news')) {
        promises.push(apiRequest(`/news${queryParams}`).then(d => setOpsData(p => ({ ...p, news: (Array.isArray(d) ? d : []).map(mapApiNewsToUiNews) }))));
      }
      if (needsTeam && canAccess('team')) {
        promises.push(apiRequest(`/team${queryParams}`).then(d => {
          const team = Array.isArray(d) ? d : [];
          setOpsData(p => ({ ...p, team: team.map(mapApiTeamToUiTeam) }));
          if (branchId) setLiveTeamMembers(team.map(mapApiTeamToUiTeam));
        }));
      }
      if (needsMenu && canAccess('menu')) {
        promises.push(apiRequest(`/menu${queryParams}`).then(d => setOpsData(p => ({ ...p, menu: Array.isArray(d) ? d : [] }))));
      }
      if (needsPayments && canAccess('payments')) {
        promises.push(apiRequest('/payments').then(d => setOpsData(p => ({ ...p, payments: Array.isArray(d) ? d : [] }))));
      }
      if (needsSettings && canAccess('settings')) {
        promises.push(apiRequest('/system-settings').then(d => setOpsData(p => ({ ...p, settings: Array.isArray(d) ? d : [] }))));
      }
      if (needsAudit && canAccess('audit')) {
        promises.push(apiRequest('/audit-logs').then(d => setOpsData(p => ({ ...p, audit: Array.isArray(d) ? d : [] }))));
      }
      if (needsFeedback && getAllowedAdminSections(adminRole).includes('feedback')) {
        promises.push(apiRequest(`/feedback${queryParams}`).then(d => setOpsData(p => ({ ...p, feedback: Array.isArray(d) ? d : [] }))));
      }
      if (needsTestimonials && canAccess('testimonials')) {
        promises.push(apiRequest(`/testimonials${queryParams}`).then(d => setOpsData(p => ({ ...p, testimonials: Array.isArray(d) ? d : [] }))));
      }
      if (needsServices && getAllowedAdminSections(adminRole).includes('services')) {
        promises.push(apiRequest(`/services${queryParams}`).then(d => {
          const services = Array.isArray(d) ? d : [];
          setOpsData(p => ({ ...p, services: services.map(mapApiServiceToUiService) }));
          if (branchId) setLiveServices(services.map(mapApiServiceToUiService));
        }));
      }

      await Promise.allSettled(promises);
    } catch (err: any) {
      setOpsMessage(`Error loading data: ${err.message}`);
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
          price: parseFloat(String(serviceCreateForm.pricing).replace(/[^0-9.]/g, '')) || 0,
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

  useEffect(() => {
    return subscribeToBranchChanges((branch) => {
      setActiveBranch(branch);
    });
  }, []);

  const submitUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceEditForm?.id) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/services/${serviceEditForm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: serviceEditForm.name,
          description: serviceEditForm.description,
          category: serviceEditForm.category,
          price: parseFloat(String(serviceEditForm.pricing).replace(/[^0-9.]/g, '')) || 0,
          billingType: 'one-time',
          images: serviceEditForm.icon ? [serviceEditForm.icon] : [],
          amenities: [],
        }),
      });
      setOpsMessage('Service updated successfully.');
      setServiceEditForm(null);
      await loadOperationsData();
      // Also refresh live data
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

  const submitUpdateFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackEditForm) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/feedback/${feedbackEditForm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: feedbackEditForm.status,
          response: feedbackEditForm.response,
        }),
      });
      setOpsMessage('Feedback updated successfully.');
      setFeedbackEditForm(null);
      await loadOperationsData();
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to update feedback.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitDeleteFeedback = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/feedback/${id}`, { method: 'DELETE' });
      setOpsMessage('Feedback deleted successfully.');
      await loadOperationsData();
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to delete feedback.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      const branchId = activeBranchOption?.id;
      if (!branchId) throw new Error('You must have a branch assigned to create testimonials.');

      await apiRequest(`/testimonials/${branchId}`, {
        method: 'POST',
        body: JSON.stringify({
          guestName: testimonialCreateForm.guestName,
          guestRole: testimonialCreateForm.guestRole,
          quote: testimonialCreateForm.quote,
          rating: testimonialCreateForm.rating,
          source: testimonialCreateForm.source,
          isFeatured: testimonialCreateForm.isFeatured,
        }),
      });
      setOpsMessage('Testimonial created successfully.');
      setTestimonialCreateForm({ guestName: '', guestRole: '', quote: '', rating: 5, source: 'direct', isFeatured: true });
      await loadOperationsData();
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to create testimonial.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitUpdateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testimonialEditForm) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/testimonials/${testimonialEditForm.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          guestName: testimonialEditForm.guestName,
          guestRole: testimonialEditForm.guestRole,
          quote: testimonialEditForm.quote,
          rating: testimonialEditForm.rating,
          source: testimonialEditForm.source,
          isFeatured: testimonialEditForm.isFeatured,
          isActive: testimonialEditForm.isActive,
        }),
      });
      setOpsMessage('Testimonial updated successfully.');
      setTestimonialEditForm(null);
      await loadOperationsData();
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to update testimonial.');
    } finally {
      setOpsLoading(false);
    }
  };

  const submitDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    setOpsLoading(true);
    setOpsMessage(null);
    try {
      await apiRequest(`/testimonials/${id}`, { method: 'DELETE' });
      setOpsMessage('Testimonial deleted successfully.');
      await loadOperationsData();
    } catch (err: any) {
      setOpsMessage(err?.message || 'Failed to delete testimonial.');
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

  return {
    router, pathname, activeBranch, setActiveBranch, isDark,
    setIsDark, isThemeReady, setIsThemeReady, currentTab,
    setCurrentTabState,
    selectedRoom,
    setSelectedRoom,
    selectedRoomImage,
    setSelectedRoomImage,
    bookingRoom,
    setBookingRoom,
    immersivePhoto,
    setImmersivePhoto,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    adminRole,
    setAdminRole,
    adminSection,
    setAdminSection,
    serviceCategory,
    setServiceCategory,
    showBranchSelector,
    setShowBranchSelector,
    bookingSuccess,
    setBookingSuccess,
    show3DView,
    setShow3DView,
    selectedService,
    setSelectedService,
    showLocationGuide,
    setShowLocationGuide,
    showBookingModal,
    setShowBookingModal,
    bookingService,
    setBookingService,
    checkoutStep,
    setCheckoutStep,
    paymentMethod,
    setPaymentMethod,
    roomCheckoutStep,
    setRoomCheckoutStep,
    roomPaymentMethod,
    setRoomPaymentMethod,
    rotation,
    setRotation,
    isRotating,
    setIsRotating,
    locationAnimation,
    setLocationAnimation,
    activeFeatureIndex,
    setActiveFeatureIndex,
    cursorPos,
    setCursorPos,
    cursorActive,
    setCursorActive,
    cursorLabel,
    setCursorLabel,
    stats,
    setStats,
    isNavCondensed,
    setIsNavCondensed,
    legalDoc,
    setLegalDoc,
    authUser,
    setAuthUser,
    authToken,
    setAuthToken,
    authHydrated,
    setAuthHydrated,
    isRestoringAuth,
    setIsRestoringAuth,
    showAuthModal,
    setShowAuthModal,
    authLoading,
    setAuthLoading,
    authError,
    setAuthError,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    registerLoading,
    setRegisterLoading,
    registerError,
    setRegisterError,
    registerSuccess,
    setRegisterSuccess,
    registerForm,
    setRegisterForm,
    branchOptions,
    setBranchOptions,
    liveRooms,
    setLiveRooms,
    liveServices,
    setLiveServices,
    liveTeamMembers,
    setLiveTeamMembers,
    liveRoomBookings,
    setLiveRoomBookings,
    liveServiceBookings,
    setLiveServiceBookings,
    liveNews,
    setLiveNews,
    apiLoading,
    setApiLoading,
    branchesLoaded,
    setBranchesLoaded,
    profileForm,
    setProfileForm,
    profileLoading,
    setProfileLoading,
    profileMessage,
    setProfileMessage,
    passwordForm,
    setPasswordForm,
    passwordLoading,
    setPasswordLoading,
    passwordMessage,
    setPasswordMessage,
    opsTab,
    setOpsTab,
    opsLoading,
    setOpsLoading,
    opsMessage,
    setOpsMessage,
    opsData,
    setOpsData,
    branchCreateForm,
    setBranchCreateForm,
    userCreateForm,
    setUserCreateForm,
    newsCreateForm,
    setNewsCreateForm,
    teamCreateForm,
    setTeamCreateForm,
    menuCreateForm,
    setMenuCreateForm,
    serviceCreateForm,
    setServiceCreateForm,
    roomCreateForm,
    setRoomCreateForm,
    roomSearchForm,
    setRoomSearchForm,
    roomSearchResults,
    setRoomSearchResults,
    roomSearchLoading,
    setRoomSearchLoading,
    roomEditForm,
    setRoomEditForm,
    teamEditForm,
    setTeamEditForm,
    newsEditForm,
    setNewsEditForm,
    serviceEditForm,
    setServiceEditForm,
    menuEditForm,
    setMenuEditForm,
    feedbackEditForm,
    setFeedbackEditForm,
    settingCreateForm,
    setSettingCreateForm,
    testimonialCreateForm,
    setTestimonialCreateForm,
    testimonialEditForm,
    setTestimonialEditForm,
    tabFromPath,
    setCurrentTab,
    activeBranchOption,
    data,
    mappedNews,
    allowedAdminSections,
    roleCapabilities,
    isAdminWorkspace,
    testimonials,
    availableTabs,
    mapBackendRoleToAdminRole,
    getAllowedAdminSections,
    getRoleCapabilities,
    uiRoleLabel,
    allOpsTabs,
    allowedOpsTabs,
    formatAdminSectionLabel,
    getAdminSectionIcon,
    mapBranchIdToEnum,
    adminRoomBookings,
    adminServiceBookings,
    adminBranchRevenue,
    adminServiceRevenue,
    fetchCurrentUser,
    applyAuthenticatedSession,
    openAdminArea,
    logoutAdmin,
    submitPasswordLogin,
    submitRegisterStaff,
    submitUpdateProfile,
    handleProfileImageUpload,
    toDataUrl,
    handleNewsImageUpload,
    handleNewsEditImageUpload,
    handleServiceIconUpload,
    handleServiceEditIconUpload,
    handleTeamPhotoUpload,
    handleTeamEditPhotoUpload,
    handleRoomImagesUpload,
    handleMenuFileUpload,
    handleMenuEditFileUpload,
    handleRoomEditImagesUpload,
    submitChangePassword,
    apiRequest,
    loadOperationsData,
    submitCreateBranch,
    parseList,
    submitCreateRoom,
    submitUpdateRoom,
    searchAvailableRooms,
    submitDeleteRoom,
    submitCreateUser,
    submitCreateNews,
    submitUpdateNews,
    submitDeleteNews,
    submitCreateTeamMember,
    submitUpdateTeamMember,
    submitDeleteTeamMember,
    submitCreateMenu,
    submitUpdateMenu,
    submitDeleteMenu,
    submitCreateService,
    submitUpdateService,
    submitDeleteService,
    submitUpdateFeedback,
    submitDeleteFeedback,
    submitCreateTestimonial,
    submitUpdateTestimonial,
    submitDeleteTestimonial,
    submitCreateSetting,
    handleBranchSwitch,
    openImmersive,
    handleBookingSubmit,
    openBooking,
    openRoomBooking,
    start360Rotation,
    startLocationAnimation
  };
};
