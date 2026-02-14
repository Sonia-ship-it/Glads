import React, { useState, useEffect, useMemo } from 'react';
import { Branch, RoomType, ServiceBooking, ServiceRevenue, BranchRevenue, AdminRole, Service } from './types';
import { BRANCH_DATA } from './constants';
import { BranchSelector } from './components/BranchSelector';
import { ThemeToggle } from './components/ThemeToggle';
import { ImmersivePhotoViewer } from './components/ImmersivePhotoViewer';
import { Logo } from './components/Logo';
import { AdminDashboard } from './components/AdminDashboard';
import { ServiceManagement } from './components/ServiceManagement';
import { BookingManagement } from './components/BookingManagement';
import ServiceMiniPage from './components/ServiceMiniPage';
import { ChatAssistant, ChatFloatingButton } from './components/ChatAssistant';

// Comprehensive dummy data for Admin Section
const DUMMY_BOOKINGS = [
  { id: '1', branch: Branch.NDERA, amount: 550, customer: 'John Doe', status: 'Paid' },
  { id: '2', branch: Branch.NDERA, amount: 850, customer: 'Jane Smith', status: 'Pending' },
  { id: '3', branch: Branch.KANOMBE, amount: 1400, customer: 'Alice Wong', status: 'Paid' },
  { id: '4', branch: Branch.KABEZA, amount: 650, customer: 'Bob Marley', status: 'Confirmed' },
  { id: '5', branch: Branch.NDERA, amount: 1200, customer: 'Emma Davis', status: 'Confirmed' },
  { id: '6', branch: Branch.KANOMBE, amount: 750, customer: 'Michael Chen', status: 'Paid' },
  { id: '7', branch: Branch.KABEZA, amount: 920, customer: 'Sarah Johnson', status: 'Pending' },
];

const DUMMY_SERVICE_BOOKINGS: ServiceBooking[] = [
  { id: 'SB001', branchId: Branch.NDERA, serviceId: 'pool', serviceName: 'Infinity Swimming Pool', customerName: 'David Miller', customerEmail: 'david@email.com', customerPhone: '+250788123456', date: '2024-02-15', time: '10:00 AM', amount: 50, status: 'confirmed', notes: 'VIP guest', createdAt: '2024-02-10' },
  { id: 'SB002', branchId: Branch.NDERA, serviceId: 'gym', serviceName: 'Fitness Center', customerName: 'Lisa Anderson', customerEmail: 'lisa@email.com', customerPhone: '+250788234567', date: '2024-02-16', time: '6:00 AM', amount: 30, status: 'completed', createdAt: '2024-02-11' },
  { id: 'SB003', branchId: Branch.KANOMBE, serviceId: 'restaurant', serviceName: 'Fine Dining Restaurant', customerName: 'James Wilson', customerEmail: 'james@email.com', customerPhone: '+250788345678', date: '2024-02-17', time: '7:00 PM', amount: 120, status: 'pending', createdAt: '2024-02-12' },
  { id: 'SB004', branchId: Branch.NDERA, serviceId: 'spa', serviceName: 'Luxury Spa', customerName: 'Maria Garcia', customerEmail: 'maria@email.com', customerPhone: '+250788456789', date: '2024-02-18', time: '2:00 PM', amount: 150, status: 'confirmed', createdAt: '2024-02-13' },
  { id: 'SB005', branchId: Branch.KANOMBE, serviceId: 'meeting', serviceName: 'Conference Rooms', customerName: 'Robert Brown', customerEmail: 'robert@email.com', customerPhone: '+250788567890', date: '2024-02-19', time: '9:00 AM', amount: 200, status: 'confirmed', createdAt: '2024-02-14' },
  { id: 'SB006', branchId: Branch.NDERA, serviceId: 'bar', serviceName: 'Rooftop Bar', customerName: 'Emily Taylor', customerEmail: 'emily@email.com', customerPhone: '+250788678901', date: '2024-02-20', time: '8:00 PM', amount: 80, status: 'pending', createdAt: '2024-02-15' },
  { id: 'SB007', branchId: Branch.KANOMBE, serviceId: 'laundry', serviceName: 'Laundry Service', customerName: 'Chris Martin', customerEmail: 'chris@email.com', customerPhone: '+250788789012', date: '2024-02-21', time: '11:00 AM', amount: 25, status: 'completed', createdAt: '2024-02-16' },
];

const DUMMY_SERVICE_REVENUE: ServiceRevenue[] = [
  { serviceId: 'pool', serviceName: 'Infinity Swimming Pool', totalBookings: 145, totalRevenue: 7250, branchRevenue: { [Branch.NDERA]: 4500, [Branch.KANOMBE]: 2750, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 92 },
  { serviceId: 'spa', serviceName: 'Luxury Spa', totalBookings: 98, totalRevenue: 14700, branchRevenue: { [Branch.NDERA]: 9800, [Branch.KANOMBE]: 4900, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 88 },
  { serviceId: 'restaurant', serviceName: 'Fine Dining Restaurant', totalBookings: 312, totalRevenue: 37440, branchRevenue: { [Branch.NDERA]: 22000, [Branch.KANOMBE]: 15440, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 95 },
  { serviceId: 'gym', serviceName: 'Fitness Center', totalBookings: 234, totalRevenue: 7020, branchRevenue: { [Branch.NDERA]: 4200, [Branch.KANOMBE]: 2820, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 78 },
  { serviceId: 'meeting', serviceName: 'Conference Rooms', totalBookings: 67, totalRevenue: 13400, branchRevenue: { [Branch.NDERA]: 8000, [Branch.KANOMBE]: 5400, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 71 },
  { serviceId: 'bar', serviceName: 'Rooftop Bar', totalBookings: 189, totalRevenue: 15120, branchRevenue: { [Branch.NDERA]: 9500, [Branch.KANOMBE]: 5620, [Branch.KABEZA]: 0 }, monthlyRevenue: [], popularityScore: 85 },
];

const DUMMY_BRANCH_REVENUE: BranchRevenue[] = [
  { branchId: Branch.NDERA, roomRevenue: 45000, serviceRevenue: 58000, totalRevenue: 103000, bookingCount: 287, occupancyRate: 94, averageBookingValue: 359 },
  { branchId: Branch.KANOMBE, roomRevenue: 38000, serviceRevenue: 37430, totalRevenue: 75430, bookingCount: 198, occupancyRate: 87, averageBookingValue: 381 },
  { branchId: Branch.KABEZA, roomRevenue: 28000, serviceRevenue: 0, totalRevenue: 28000, bookingCount: 124, occupancyRate: 76, averageBookingValue: 226 },
];

type Role = 'Customer' | 'HQ Admin' | 'Branch Admin';

const App: React.FC = () => {
  const [activeBranch, setActiveBranch] = useState<Branch>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('glads-selected-branch');
      return (saved as Branch) || Branch.NDERA;
    }
    return Branch.NDERA;
  });

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('glads-theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [currentTab, setCurrentTab] = useState<'Home' | 'Rooms' | 'Services' | 'Gallery' | 'Contact' | 'Admin'>('Home');
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [selectedRoomImage, setSelectedRoomImage] = useState<string | null>(null);
  const [bookingRoom, setBookingRoom] = useState<RoomType | null>(null);
  const [immersivePhoto, setImmersivePhoto] = useState<{ src: string; title: string } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<AdminRole>('Super Admin');
  const [adminSection, setAdminSection] = useState<'dashboard' | 'bookings' | 'services' | 'reports'>('dashboard');
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
  const [showChatAssistant, setShowChatAssistant] = useState(false);
  const [locationAnimation, setLocationAnimation] = useState({
    isAnimating: false,
    startPoint: '',
    destination: '',
    progress: 0
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('glads-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('glads-theme', 'light');
    }
  }, [isDark]);

  const data = useMemo(() => BRANCH_DATA[activeBranch], [activeBranch]);

  const availableTabs = useMemo(() => {
    const tabs: ('Home' | 'Rooms' | 'Services' | 'Gallery' | 'Contact' | 'Admin')[] = ['Home', 'Rooms', 'Services', 'Gallery', 'Contact'];
    if (activeBranch === Branch.KABEZA) {
      return tabs.filter(t => t !== 'Services');
    }
    return tabs;
  }, [activeBranch]);

  useEffect(() => {
    if (currentTab !== 'Admin' && !availableTabs.includes(currentTab as any)) {
      setCurrentTab('Home');
    }
  }, [activeBranch, availableTabs, currentTab]);

  const handleBranchSwitch = (branch: Branch) => {
    setActiveBranch(branch);
    setIsMobileMenuOpen(false);
    localStorage.setItem('glads-selected-branch', branch);
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

  return (
    <div className="min-h-screen transition-all duration-700 bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 font-sans selection:bg-burgundy selection:text-white overflow-x-hidden">
      <ImmersivePhotoViewer 
        isOpen={!!immersivePhoto}
        src={immersivePhoto?.src || ''}
        title={immersivePhoto?.title || ''}
        onClose={() => setImmersivePhoto(null)}
      />

      {/* Enhanced 3D Room View Modal with 360° Rotation */}
      {show3DView && selectedRoom && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-7xl h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl relative">
            <button onClick={() => {setShow3DView(false); setRotation(0);}} className="absolute top-6 right-6 text-neutral-400 hover:text-black dark:hover:text-white z-10 bg-white/10 rounded-full p-2 backdrop-blur-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                <h3 className="text-2xl font-serif italic">{selectedRoom.name} - 360° Virtual Experience</h3>
                <p className="text-sm text-neutral-500 mt-2">Use controls below to explore the room</p>
              </div>

              {/* 360° Image View */}
              <div className="flex-1 relative bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-8">
                  <div 
                    className="relative w-full h-full max-w-5xl max-h-full transition-transform duration-100 ease-out"
                    style={{ 
                      transform: `perspective(2000px) rotateY(${rotation}deg) scale(${isRotating ? 0.95 : 1})`,
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Multiple Image Layers for Parallax Effect */}
                    <img 
                      src={data.gallery[Math.floor((rotation % 360) / 30) % data.gallery.length]} 
                      alt={`${selectedRoom.name} - 360° View`}
                      className="w-full h-full object-cover rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.3)] transition-all duration-200"
                      style={{ 
                        filter: `brightness(${0.9 + Math.abs(Math.cos(rotation * Math.PI / 180)) * 0.3}) contrast(${1.1 + Math.abs(Math.sin(rotation * Math.PI / 180)) * 0.2}) saturate(${1 + Math.abs(Math.sin(rotation * Math.PI / 180)) * 0.3})`,
                        transform: `translateZ(100px) scale(${1 + Math.abs(Math.sin(rotation * Math.PI / 180)) * 0.05})`,
                        opacity: isRotating ? 0.95 : 1
                      }}
                    />
                    
                    {/* Reflection Effect */}
                    <div className="absolute inset-0 rounded-3xl" style={{
                      background: `linear-gradient(${rotation}deg, rgba(255,255,255,0.1), transparent, rgba(0,0,0,0.2))`,
                      opacity: 0.3
                    }}></div>
                    
                    {/* Overlay effects for 3D feel */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" style={{
                      opacity: Math.abs(Math.sin(rotation * Math.PI / 180)) * 0.3
                    }}></div>
                  </div>
                </div>

                {/* Rotation Indicator */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                  {Math.round(rotation)}°
                </div>
              </div>

              {/* Controls */}
              <div className="p-6 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-center gap-6">
                  <button 
                    onClick={() => setRotation(prev => prev - 15)}
                    className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 p-4 rounded-full transition-all"
                    disabled={isRotating}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z"/>
                    </svg>
                  </button>
                  
                  <button 
                    onClick={start360Rotation}
                    disabled={isRotating}
                    className={`${isRotating ? 'bg-burgundy/50' : 'bg-burgundy hover:bg-burgundy/90'} text-white px-8 py-4 rounded-full font-bold transition-all flex items-center gap-3`}
                  >
                    <svg className={`w-5 h-5 ${isRotating ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                    </svg>
                    {isRotating ? 'Rotating...' : 'Full 360° View'}
                  </button>
                  
                  <button 
                    onClick={() => setRotation(prev => prev + 15)}
                    className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 p-4 rounded-full transition-all"
                    disabled={isRotating}
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.89 15.47L18.3 16.89c.9-1.16 1.46-2.5 1.63-3.89h-2.02c-.14.87-.49 1.72-1.02 2.47zm1.01-8.32c-1.16-.9-2.51-1.44-3.9-1.61V7.1c.87.15 1.71.49 2.46 1.03l1.44-1.45zm-1.01 2.85h2.02c-.17-1.39-.72-2.73-1.62-3.89L16.89 7.53c.52.75.87 1.59 1.01 2.47zM11 19.93v2.02c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93V4.07L15.55 8.55 11 13v-3.09c-2.84.48-5 2.94-5 5.91s2.16 5.43 5 5.91z"/>
                    </svg>
                  </button>
                </div>
                
                <div className="text-center mt-4 text-sm text-neutral-500">
                  <div className="flex items-center justify-center gap-6">
                    <span>← Rotate Left</span>
                    <span className="text-burgundy font-bold">360° Virtual Tour</span>
                    <span>Rotate Right →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Professional Map-Style Location Guide */}
      {showLocationGuide && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-[95vw] h-[95vh] rounded-3xl overflow-hidden shadow-2xl relative">
            <button onClick={() => {
              setShowLocationGuide(false);
              setLocationAnimation({isAnimating: false, startPoint: '', destination: '', progress: 0});
            }} className="absolute top-6 right-6 text-neutral-400 hover:text-black dark:hover:text-white z-50 bg-white dark:bg-neutral-800 rounded-full p-3 shadow-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-700">
                <h3 className="text-4xl font-serif italic text-burgundy mb-2">Location Guide</h3>
                <p className="text-neutral-500 dark:text-neutral-400">Discover our three premium locations across Kigali</p>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-96 bg-neutral-50 dark:bg-neutral-800 p-6 overflow-y-auto border-r border-neutral-200 dark:border-neutral-700">
                  <h4 className="text-sm font-black uppercase tracking-wider mb-6 text-burgundy">Select Location</h4>
                  <div className="space-y-3">
                    {Object.values(BRANCH_DATA).map(branch => (
                      <button
                        key={branch.id}
                        onClick={() => handleBranchSwitch(branch.id)}
                        className={`w-full text-left p-4 rounded-xl transition-all ${
                          activeBranch === branch.id 
                            ? 'bg-burgundy text-white shadow-lg' 
                            : 'bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-600'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activeBranch === branch.id ? 'bg-white/20' : 'bg-burgundy/10'
                          }`}>
                            <svg className={`w-5 h-5 ${activeBranch === branch.id ? 'text-white' : 'text-burgundy'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-sm mb-1">{branch.fullName}</div>
                            <div className={`text-xs ${activeBranch === branch.id ? 'text-white/80' : 'text-neutral-500'}`}>
                              {branch.location.address}
                            </div>
                          </div>
                          {activeBranch === branch.id && (
                            <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Quick Info */}
                  <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                      <div className="text-sm">
                        <p className="font-bold text-blue-900 dark:text-blue-300 mb-1">Getting Here</p>
                        <p className="text-blue-700 dark:text-blue-400 text-xs">All locations are easily accessible via taxi, motorcycle taxi, or private vehicle. Click 'Get Directions' for navigation.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content - Location Details */}
                <div className="flex-1 overflow-y-auto p-8">
                  {BRANCH_DATA[activeBranch] && (
                    <div className="max-w-4xl mx-auto space-y-8">
                      {/* Hero Image */}
                      <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                        <img 
                          src={BRANCH_DATA[activeBranch].gallery[0]} 
                          alt={BRANCH_DATA[activeBranch].fullName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 text-white">
                          <h2 className="text-5xl font-serif italic mb-2">{BRANCH_DATA[activeBranch].fullName}</h2>
                          <p className="text-lg opacity-90">{BRANCH_DATA[activeBranch].location.address}</p>
                        </div>
                      </div>

                      {/* Location Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Address Card */}
                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            </div>
                            <div>
                              <h4 className="font-bold text-burgundy mb-2">Address</h4>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">{BRANCH_DATA[activeBranch].location.address}</p>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">Kigali, Rwanda</p>
                            </div>
                          </div>
                        </div>

                        {/* Coordinates Card */}
                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            </div>
                            <div>
                              <h4 className="font-bold text-burgundy mb-2">Coordinates</h4>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                                {BRANCH_DATA[activeBranch].location.lat}, {BRANCH_DATA[activeBranch].location.lng}
                              </p>
                              <button 
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${BRANCH_DATA[activeBranch].location.lat},${BRANCH_DATA[activeBranch].location.lng}`, '_blank')}
                                className="text-xs text-burgundy hover:underline mt-2 font-bold"
                              >
                                View on Google Maps →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Map Embed */}
                      <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
                        <h4 className="font-bold text-burgundy mb-4">Interactive Map</h4>
                        <div className="w-full h-96 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                          <iframe
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${BRANCH_DATA[activeBranch].location.lat},${BRANCH_DATA[activeBranch].location.lng}&zoom=15`}
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>

                      {/* How to Get There */}
                      <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
                        <h4 className="font-bold text-burgundy mb-4">How to Get There</h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-bold text-sm mb-1">By Taxi or Ride-Hailing</h5>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">Use Yego, Move, or traditional taxi services. Simply provide the driver with our address: {BRANCH_DATA[activeBranch].location.address}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-bold text-sm mb-1">By Motorcycle Taxi (Moto)</h5>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">Quick and convenient. Available at most intersections. Estimated time from city center: 15-20 minutes</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-bold text-sm mb-1">From Kigali International Airport</h5>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">Approximately 20-30 minutes by car. We can arrange airport pickup - contact us in advance.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <button 
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${BRANCH_DATA[activeBranch].location.lat},${BRANCH_DATA[activeBranch].location.lng}`, '_blank')}
                          className="flex-1 bg-burgundy text-white py-4 px-6 rounded-full font-bold hover:brightness-125 transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/></svg>
                          Get Directions
                        </button>
                        <button 
                          onClick={() => {
                            handleBranchSwitch(activeBranch);
                            setShowLocationGuide(false);
                            setCurrentTab('Rooms');
                          }}
                          className="flex-1 border-2 border-burgundy text-burgundy py-4 px-6 rounded-full font-bold hover:bg-burgundy hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                          Book This Location
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Detail Modal */}
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

      {/* Real Booking Modal */}
      {showBookingModal && bookingService && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-2xl max-h-[90vh] rounded-[2rem] shadow-2xl relative overflow-y-auto">
            <button onClick={() => { setShowBookingModal(false); setCheckoutStep('details'); setPaymentMethod(null); }} className="absolute top-6 right-6 text-neutral-400 hover:text-black dark:hover:text-white z-10 bg-white/10 rounded-full p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            
            <div className="p-8">
              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className={`flex items-center gap-2 ${checkoutStep === 'details' ? 'text-burgundy' : 'text-neutral-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${checkoutStep === 'details' ? 'bg-burgundy text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>1</div>
                  <span className="text-xs font-bold hidden md:inline">Details</span>
                </div>
                <div className="w-12 h-0.5 bg-neutral-200 dark:bg-neutral-700"></div>
                <div className={`flex items-center gap-2 ${checkoutStep === 'payment' ? 'text-burgundy' : 'text-neutral-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${checkoutStep === 'payment' ? 'bg-burgundy text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>2</div>
                  <span className="text-xs font-bold hidden md:inline">Payment</span>
                </div>
                <div className="w-12 h-0.5 bg-neutral-200 dark:bg-neutral-700"></div>
                <div className={`flex items-center gap-2 ${checkoutStep === 'confirmation' ? 'text-burgundy' : 'text-neutral-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${checkoutStep === 'confirmation' ? 'bg-burgundy text-white' : 'bg-neutral-200 dark:bg-neutral-700'}`}>3</div>
                  <span className="text-xs font-bold hidden md:inline">Confirm</span>
                </div>
              </div>

              {/* Step 1: Booking Details */}
              {checkoutStep === 'details' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setCheckoutStep('payment');
                }} className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-burgundy/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>
                    </div>
                    <h3 className="text-2xl font-serif italic mb-2">Book {bookingService.name}</h3>
                    <p className="text-neutral-500 text-sm">{activeBranch} • {bookingService.category}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-burgundy">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-burgundy">Phone Number</label>
                      <input 
                        type="tel" 
                        required 
                        className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all"
                        placeholder="+250 xxx xxx xxx"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-burgundy">Preferred Date</label>
                      <input 
                        type="date" 
                        required 
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-burgundy">Preferred Time</label>
                      <select 
                        required 
                        className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all"
                      >
                        <option value="">Select time</option>
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="17:00">5:00 PM</option>
                        <option value="18:00">6:00 PM</option>
                      </select>
                    </div>
                  </div>

                  {bookingService.pricing && (
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-burgundy">Service Pricing</span>
                        <span className="text-lg font-bold">{bookingService.pricing}</span>
                      </div>
                      <p className="text-sm text-neutral-500">Final price may vary based on specific requirements</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold mb-2 text-burgundy">Special Requests</label>
                    <textarea 
                      rows={3}
                      className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all"
                      placeholder="Any special requests or preferences..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => { setShowBookingModal(false); setCheckoutStep('details'); }}
                      className="flex-1 border border-neutral-300 dark:border-neutral-700 py-4 px-6 rounded-full font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 bg-burgundy text-white py-4 px-6 rounded-full font-bold hover:brightness-125 transition-all flex items-center justify-center gap-2"
                    >
                      Continue to Payment
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: Payment Method */}
              {checkoutStep === 'payment' && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-serif italic mb-2">Choose Payment Method</h3>
                    <p className="text-neutral-500 text-sm">Secure payment via card or mobile money</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card Payment */}
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                        paymentMethod === 'card' 
                          ? 'border-burgundy bg-burgundy/5' 
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-burgundy/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          paymentMethod === 'card' ? 'bg-burgundy text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                        }`}>
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/><path strokeLinecap="round" strokeWidth="2" d="M2 10h20"/></svg>
                        </div>
                        <div className="text-center">
                          <p className="font-bold mb-1">Card Payment</p>
                          <p className="text-xs text-neutral-500">Visa, Mastercard, Amex</p>
                        </div>
                        {paymentMethod === 'card' && (
                          <div className="w-6 h-6 bg-burgundy rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                          </div>
                        )}
                      </div>
                    </button>

                    {/* Mobile Money */}
                    <button
                      onClick={() => setPaymentMethod('momo')}
                      className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                        paymentMethod === 'momo' 
                          ? 'border-burgundy bg-burgundy/5' 
                          : 'border-neutral-200 dark:border-neutral-700 hover:border-burgundy/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          paymentMethod === 'momo' ? 'bg-burgundy text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                        }`}>
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                        </div>
                        <div className="text-center">
                          <p className="font-bold mb-1">Mobile Money</p>
                          <p className="text-xs text-neutral-500">MTN, Airtel Money</p>
                        </div>
                        {paymentMethod === 'momo' && (
                          <div className="w-6 h-6 bg-burgundy rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Payment Form */}
                  {paymentMethod === 'card' && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      setCheckoutStep('confirmation');
                    }} className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
                      <div>
                        <label className="block text-sm font-bold mb-2 text-burgundy">Card Number</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold mb-2 text-burgundy">Expiry Date</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="MM/YY"
                            maxLength={5}
                            className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2 text-burgundy">CVV</label>
                          <input 
                            type="text" 
                            required 
                            placeholder="123"
                            maxLength={3}
                            className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 text-burgundy">Cardholder Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Name on card"
                          className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all"
                        />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => { setCheckoutStep('details'); setPaymentMethod(null); }}
                          className="flex-1 border border-neutral-300 dark:border-neutral-700 py-4 px-6 rounded-full font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                        >
                          Back
                        </button>
                        <button 
                          type="submit" 
                          className="flex-1 bg-burgundy text-white py-4 px-6 rounded-full font-bold hover:brightness-125 transition-all flex items-center justify-center gap-2"
                        >
                          Proceed
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        </button>
                      </div>
                    </form>
                  )}

                  {paymentMethod === 'momo' && (
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      setCheckoutStep('confirmation');
                    }} className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
                      <div>
                        <label className="block text-sm font-bold mb-2 text-burgundy">Mobile Money Provider</label>
                        <select 
                          required 
                          className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all"
                        >
                          <option value="">Select provider</option>
                          <option value="mtn">MTN Mobile Money</option>
                          <option value="airtel">Airtel Money</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2 text-burgundy">Phone Number</label>
                        <input 
                          type="tel" 
                          required 
                          placeholder="+250 7XX XXX XXX"
                          className="w-full p-3 border border-neutral-300 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 focus:border-burgundy focus:outline-none transition-all"
                        />
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl">
                        <div className="flex gap-3">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                          <div className="text-sm">
                            <p className="font-bold text-blue-900 dark:text-blue-300 mb-1">Payment Instructions</p>
                            <p className="text-blue-700 dark:text-blue-400">You will receive a prompt on your phone to authorize the payment. Please approve it to complete the booking.</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button 
                          type="button"
                          onClick={() => { setCheckoutStep('details'); setPaymentMethod(null); }}
                          className="flex-1 border border-neutral-300 dark:border-neutral-700 py-4 px-6 rounded-full font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                        >
                          Back
                        </button>
                        <button 
                          type="submit" 
                          className="flex-1 bg-burgundy text-white py-4 px-6 rounded-full font-bold hover:brightness-125 transition-all flex items-center justify-center gap-2"
                        >
                          Send Payment Request
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                        </button>
                      </div>
                    </form>
                  )}

                  {!paymentMethod && (
                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setCheckoutStep('details')}
                        className="flex-1 border border-neutral-300 dark:border-neutral-700 py-4 px-6 rounded-full font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all"
                      >
                        Back
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Confirmation */}
              {checkoutStep === 'confirmation' && (
                <div className="text-center py-12 space-y-6">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-500">
                    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-serif italic mb-2">Booking Confirmed!</h3>
                    <p className="text-neutral-500">Your {bookingService.name} reservation is confirmed</p>
                  </div>
                  <div className="bg-neutral-100 dark:bg-neutral-800 p-6 rounded-2xl space-y-3 text-left max-w-sm mx-auto">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Service</span>
                      <span className="font-bold">{bookingService.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Location</span>
                      <span className="font-bold">{activeBranch}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Payment</span>
                      <span className="font-bold">{paymentMethod === 'card' ? 'Card Payment' : 'Mobile Money'}</span>
                    </div>
                    {bookingService.pricing && (
                      <div className="flex justify-between text-sm pt-3 border-t border-neutral-200 dark:border-neutral-700">
                        <span className="text-neutral-500">Amount</span>
                        <span className="font-bold text-burgundy">{bookingService.pricing}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 max-w-md mx-auto">A confirmation email has been sent to your email address. Our team will contact you shortly.</p>
                  <button 
                    onClick={() => { 
                      setShowBookingModal(false); 
                      setCheckoutStep('details'); 
                      setPaymentMethod(null);
                      setBookingSuccess(true);
                      setTimeout(() => setBookingSuccess(false), 3000);
                    }}
                    className="bg-burgundy text-white py-4 px-8 rounded-full font-bold hover:brightness-125 transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Room Details Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative">
            <button onClick={() => { setSelectedRoom(null); setSelectedRoomImage(null); }} className="absolute top-8 right-8 text-neutral-400 hover:text-black dark:hover:text-white z-10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
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
                  <h3 className="text-5xl font-serif italic mb-6 leading-none">{selectedRoom.name}</h3>
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom duration-500">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-xl rounded-[3rem] p-12 shadow-3xl border border-white/5 relative overflow-y-auto max-h-[90vh]">
             <button onClick={() => { setBookingRoom(null); setRoomCheckoutStep('details'); setRoomPaymentMethod(null); }} className="absolute top-8 right-8 text-neutral-400 hover:text-black dark:hover:text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
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
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h3 className="text-4xl font-serif italic mb-4">Reservation Placed</h3>
                <p className="text-neutral-400">Your request for {bookingRoom.name} at {activeBranch} has been sent to our concierge.</p>
              </div>
            ) : roomCheckoutStep === 'details' ? (
              <form onSubmit={(e) => { e.preventDefault(); setRoomCheckoutStep('payment'); }} className="space-y-10">
                <div className="text-center mb-10">
                   <span className="text-burgundy font-black tracking-widest uppercase text-[10px] mb-4 block">Secure Booking</span>
                   <h3 className="text-4xl font-serif italic mb-2">Reserve {bookingRoom.name}</h3>
                   <p className="text-neutral-400 text-sm italic">{activeBranch} Branch ID: GLAD-{activeBranch.toUpperCase().substring(0,3)}</p>
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
                <button type="submit" className="w-full bg-burgundy text-white py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] transition-all">Continue to Payment</button>
              </form>
            ) : roomCheckoutStep === 'payment' ? (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-serif italic mb-2">Choose Payment Method</h3>
                  <p className="text-neutral-500 text-sm">Secure payment via card or mobile money</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setRoomPaymentMethod('card')}
                    className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                      roomPaymentMethod === 'card' 
                        ? 'border-burgundy bg-burgundy/5' 
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-burgundy/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        roomPaymentMethod === 'card' ? 'bg-burgundy text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                      }`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="2"/><path strokeLinecap="round" strokeWidth="2" d="M2 10h20"/></svg>
                      </div>
                      <div className="text-center">
                        <p className="font-bold mb-1">Card Payment</p>
                        <p className="text-xs text-neutral-500">Visa, Mastercard, Amex</p>
                      </div>
                      {roomPaymentMethod === 'card' && (
                        <div className="w-6 h-6 bg-burgundy rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setRoomPaymentMethod('momo')}
                    className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                      roomPaymentMethod === 'momo' 
                        ? 'border-burgundy bg-burgundy/5' 
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-burgundy/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        roomPaymentMethod === 'momo' ? 'bg-burgundy text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600'
                      }`}>
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                      </div>
                      <div className="text-center">
                        <p className="font-bold mb-1">Mobile Money</p>
                        <p className="text-xs text-neutral-500">MTN, Airtel Money</p>
                      </div>
                      {roomPaymentMethod === 'momo' && (
                        <div className="w-6 h-6 bg-burgundy rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
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
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
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
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <h3 className="text-3xl font-serif italic mb-2">Booking Confirmed!</h3>
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
      <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center pointer-events-none">
        <div className="w-full max-w-7xl glass-nav rounded-full px-6 md:px-10 h-20 md:h-24 flex items-center justify-between pointer-events-auto border border-neutral-200/50 dark:border-white/10 shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-12">
            <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0" onClick={() => setCurrentTab('Home')}>
              <Logo className="scale-75 md:scale-90" />
            </div>
            <nav className="hidden lg:flex items-center space-x-8 xl:space-x-10">
              {availableTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab as any)}
                  className={`text-[10px] xl:text-[11px] font-black tracking-[0.3em] uppercase transition-all duration-500 relative py-2 ${
                    currentTab === tab ? 'text-burgundy dark:text-white' : 'text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {tab}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] bg-burgundy dark:bg-white transition-all duration-500 rounded-full ${currentTab === tab ? 'w-full' : 'w-0'}`}></span>
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
                 className="lg:hidden p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border border-neutral-200 dark:border-neutral-800"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}/></svg>
               </button>
               <button onClick={() => setCurrentTab('Rooms')} className="hidden md:block bg-burgundy text-white px-8 py-4 rounded-full text-[10px] font-black tracking-widest uppercase hover:brightness-125 transition-all shadow-lg active:scale-95">
                 Book Now
               </button>
             </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        <div className={`lg:hidden fixed inset-0 z-[100] bg-white/98 dark:bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center space-y-12 transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-10 right-10 text-neutral-400"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
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
              className={`text-4xl font-black tracking-[0.1em] uppercase transition-colors ${
                currentTab === tab ? 'text-burgundy' : 'text-neutral-300 dark:text-neutral-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="pt-32 md:pt-44 min-h-screen">
        {currentTab === 'Home' && (
          <div className="reveal">
            <section className="relative min-h-[85vh] flex items-center px-4 md:px-16 overflow-hidden">
               <div className="absolute top-0 right-0 w-full lg:w-[65%] h-full -z-10 rounded-bl-[15rem] overflow-hidden group">
                 <video 
                   autoPlay 
                   muted 
                   loop 
                   playsInline
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[8s] ease-out"
                 >
                   <source src="/herovideo.mp4" type="video/mp4" />
                   <img src={data.gallery[0]} alt="Hero Fallback" className="w-full h-full object-cover" />
                 </video>
                 <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-white dark:via-black/50 dark:to-black"></div>
               </div>
               <div className="max-w-7xl mx-auto w-full">
                  <div className="max-w-3xl space-y-12">
                    <div className="inline-block bg-neutral-100 dark:bg-neutral-900/80 px-8 py-3 rounded-full border border-neutral-200 dark:border-white/5">
                       <span className="text-[11px] font-black tracking-[0.5em] uppercase text-burgundy dark:text-neutral-200">
                         {data.fullName}
                       </span>
                    </div>
                    <h2 className="text-6xl md:text-[10rem] font-black tracking-tighter leading-[0.85] uppercase text-neutral-900 dark:text-white">
                      Art of <br/> <span className="text-burgundy dark:text-neutral-600">Living.</span>
                    </h2>
                    <p className="text-xl md:text-3xl text-neutral-500 dark:text-neutral-400 font-light leading-relaxed max-w-xl">
                      {data.tagline}. Discover hospitality redefined through silence, space, and sophisticated materials.
                    </p>
                    <div className="flex flex-col md:flex-row flex-wrap gap-6 items-start md:items-center">
                      {/* Primary CTA */}
                      <button 
                        onClick={() => setCurrentTab('Rooms')} 
                        className="bg-burgundy hover:bg-burgundy/90 text-white px-12 py-5 rounded-full text-[11px] font-black tracking-[0.4em] uppercase hover:scale-105 transition-all shadow-2xl shadow-burgundy/30"
                      >
                        The Residence
                      </button>
                      
                      {/* Secondary CTAs with solid backgrounds for better contrast */}
                      <button 
                        onClick={() => { setCurrentTab('Services'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="group flex items-center gap-4 bg-white dark:bg-neutral-900 px-8 py-4 rounded-full border-2 border-neutral-900 dark:border-white hover:bg-neutral-900 dark:hover:bg-white hover:shadow-xl transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white group-hover:bg-burgundy flex items-center justify-center transition-all">
                          <svg className="w-5 h-5 text-white dark:text-black group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-neutral-900 dark:text-white group-hover:text-white dark:group-hover:text-black transition-all">Choose Your Experience</span>
                      </button>
                      
                      <button 
                        onClick={() => { setBookingRoom(null); setShowBranchSelector(true); }}
                        className="group flex items-center gap-4 bg-white dark:bg-neutral-900 px-8 py-4 rounded-full border-2 border-neutral-900 dark:border-white hover:bg-neutral-900 dark:hover:bg-white hover:shadow-xl transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white group-hover:bg-burgundy flex items-center justify-center transition-all">
                          <svg className="w-5 h-5 text-white dark:text-black group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        </div>
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-neutral-900 dark:text-white group-hover:text-white dark:group-hover:text-black transition-all">Where Can We Take You?</span>
                      </button>
                    </div>
                  </div>
               </div>
            </section>

            {/* Key Stats Section */}
            <section className="reveal max-w-7xl mx-auto px-6 py-20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <p className="text-6xl md:text-7xl font-black text-burgundy mb-4">3</p>
                  <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">Locations</p>
                </div>
                <div className="text-center">
                  <p className="text-6xl md:text-7xl font-black text-burgundy mb-4">50+</p>
                  <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">Luxury Suites</p>
                </div>
                <div className="text-center">
                  <p className="text-6xl md:text-7xl font-black text-burgundy mb-4">94%</p>
                  <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">Satisfaction</p>
                </div>
                <div className="text-center">
                  <p className="text-6xl md:text-7xl font-black text-burgundy mb-4">24/7</p>
                  <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">Concierge</p>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section className="reveal max-w-7xl mx-auto px-6 py-20">
              <div className="text-center mb-16">
                <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Guest Experiences</span>
                <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">What They Say.</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-[3rem] p-10 border border-neutral-100 dark:border-white/5">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 font-light mb-8 leading-relaxed">
                    "An exceptional experience. The attention to detail and level of service exceeded all expectations. Truly a home away from home."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                      <span className="font-black text-burgundy">JD</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">James Davidson</p>
                      <p className="text-xs text-neutral-500">Business Executive</p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-[3rem] p-10 border border-neutral-100 dark:border-white/5">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 font-light mb-8 leading-relaxed">
                    "The perfect blend of luxury and comfort. Every amenity you could wish for, combined with impeccable hospitality. Highly recommend!"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                      <span className="font-black text-burgundy">SM</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">Sarah Mitchell</p>
                      <p className="text-xs text-neutral-500">Travel Blogger</p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-[3rem] p-10 border border-neutral-100 dark:border-white/5">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ))}
                  </div>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 font-light mb-8 leading-relaxed">
                    "Outstanding location, stunning views, and world-class facilities. The staff went above and beyond to make our stay memorable."
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center">
                      <span className="font-black text-burgundy">MC</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">Michael Chen</p>
                      <p className="text-xs text-neutral-500">Entrepreneur</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Contact CTA */}
            <section className="reveal max-w-5xl mx-auto px-6 py-20">
              <div className="bg-gradient-to-br from-burgundy to-red-800 rounded-[4rem] p-16 text-center text-white shadow-2xl">
                <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6">Ready to Experience GLADS?</h3>
                <p className="text-lg opacity-90 mb-10 max-w-2xl mx-auto">Book your stay today and discover why discerning travelers choose GLADS Apartment Hotel.</p>
                <div className="flex flex-wrap gap-6 justify-center">
                  <button onClick={() => setCurrentTab('Contact')} className="bg-white text-burgundy px-12 py-5 rounded-full text-sm font-black uppercase tracking-wider hover:scale-105 transition-all shadow-xl">
                    Contact Us
                  </button>
                  <button onClick={() => setCurrentTab('Rooms')} className="border-2 border-white text-white px-12 py-5 rounded-full text-sm font-black uppercase tracking-wider hover:bg-white hover:text-burgundy transition-all">
                    View Suites
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentTab === 'Home' && (
          <>
            <ChatFloatingButton onClick={() => setShowChatAssistant(true)} />
            <ChatAssistant
              visible={showChatAssistant}
              onClose={() => setShowChatAssistant(false)}
              activeBranch={activeBranch}
              branches={Object.values(BRANCH_DATA).map(b => ({ id: b.id, fullName: b.fullName, tagline: b.tagline }))}
              branchData={BRANCH_DATA[activeBranch]}
              onSelectBranch={handleBranchSwitch}
            />
          </>
        )}

        {currentTab === 'Rooms' && (
          <section className="reveal max-w-7xl mx-auto px-6 py-20">
            <div className="mb-24">
              <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Our Collection</span>
              <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8]">Master <br/> Suites.</h2>
              <p className="text-neutral-400 text-xl max-w-xl font-light">Hand-picked residences at {activeBranch}. Built for those who appreciate the finer details of spatial design.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {data.rooms.map((room) => (
                <div key={room.id} className="group flex flex-col h-full bg-neutral-50 dark:bg-neutral-900/40 rounded-[3rem] p-8 border border-neutral-100 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-700">
                  <div className="relative aspect-[1.2/1] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl">
                    <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                    <div className="absolute top-6 left-6 bg-burgundy/90 backdrop-blur-xl text-white px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-xl">${room.price} <span className="opacity-60">/ NT</span></div>
                  </div>
                  <h3 className="text-4xl font-serif italic mb-4 leading-none">{room.name}</h3>
                  <p className="text-base text-neutral-400 font-light mb-8 flex-grow leading-relaxed">{room.description}</p>
                  <div className="flex flex-wrap gap-2 mb-8">
                     {room.features.map(f => <span key={f} className="text-[9px] uppercase tracking-widest bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-lg text-neutral-500 font-bold border border-neutral-100 dark:border-white/5">{f}</span>)}
                  </div>
                  <div className="flex gap-4">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedRoomImage(null); setSelectedRoom(room); }} className="flex-1 py-4 rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">View Details</button>
                    <button 
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        e.preventDefault();
                        openRoomBooking(room);
                      }} 
                      className="flex-1 py-4 rounded-[1.5rem] bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:bg-burgundy dark:hover:bg-burgundy dark:hover:text-white transition-all shadow-xl"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {currentTab === 'Services' && activeBranch !== Branch.KABEZA && (
          <section className="reveal max-w-7xl mx-auto px-6 py-20">
            <div className="mb-24">
              <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Lifestyle Services</span>
              <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8]">Curated <br/> Experiences.</h2>
            </div>

            {/* Category Filter */}
            <div className="mb-12 flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setServiceCategory('all')}
                className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-wider transition-all ${
                  serviceCategory === 'all'
                    ? 'bg-burgundy text-white shadow-xl scale-105'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                All Services
              </button>
              {Array.from(new Set(data.services.map(s => s.category))).map(category => (
                <button
                  key={category}
                  onClick={() => setServiceCategory(category)}
                  className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-wider transition-all ${
                    serviceCategory === category
                      ? 'bg-burgundy text-white shadow-xl scale-105'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {data.services
                .filter(service => serviceCategory === 'all' || service.category === serviceCategory)
                .map((service, i) => (
                <div 
                  key={service.id} 
                  className="relative group h-[500px] rounded-[4rem] overflow-hidden shadow-2xl cursor-pointer hover:scale-105 transition-all duration-500"
                  onClick={() => setSelectedService(service)}
                >
                  <img src={service.icon} alt={service.name} className="absolute inset-0 w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-12 left-12 right-12 z-10 transition-transform duration-700 group-hover:-translate-y-4">
                    <span className="text-[10px] font-black tracking-[0.5em] uppercase text-white/50 mb-4 block">0{i+1} &bull; {service.category}</span>
                    <h4 className="text-4xl font-serif italic mb-6 text-white leading-tight">{service.name}</h4>
                    <p className="text-sm text-white/60 font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700">{service.description}</p>
                  </div>
                  <div className="absolute top-6 right-6 bg-burgundy/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {currentTab === 'Gallery' && (
          <section className="reveal max-w-full px-6 py-20">
            <div className="max-w-7xl mx-auto mb-24 text-center">
              <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">{data.fullName} Collection</span>
              <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8] bg-gradient-to-r from-burgundy to-neutral-600 bg-clip-text text-transparent">Visual.</h2>
              <p className="text-neutral-500 text-xl max-w-2xl mx-auto leading-relaxed">Every space tells a story. Explore our curated collection of moments, spaces, and experiences.</p>
            </div>

            {/* Enhanced Gallery Grid */}
            <div className="max-w-8xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 auto-rows-[250px]">
                {data.gallery.map((img, i) => {
                  // Create different sizes for masonry effect
                  const getGridClass = (index: number) => {
                    const patterns = [
                      'md:col-span-2 md:row-span-2', // Large
                      'md:col-span-1 md:row-span-1', // Small
                      'md:col-span-1 md:row-span-2', // Tall
                      'md:col-span-2 md:row-span-1', // Wide
                      'md:col-span-1 md:row-span-1', // Small
                      'md:col-span-1 md:row-span-1', // Small
                      'md:col-span-2 md:row-span-1', // Wide
                      'md:col-span-1 md:row-span-2', // Tall
                      'md:col-span-1 md:row-span-1', // Small
                      'md:col-span-2 md:row-span-2', // Large
                      'md:col-span-1 md:row-span-1', // Small
                      'md:col-span-1 md:row-span-1', // Small
                    ];
                    return patterns[index % patterns.length];
                  };
                  
                  return (
                    <div 
                      key={i} 
                      className={`${getGridClass(i)} relative rounded-[2rem] overflow-hidden group cursor-pointer shadow-xl transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900`}
                      onClick={() => openImmersive(img, `${activeBranch} Gallery ${i+1}`)}
                    >
                      <img 
                        src={img} 
                        alt={`Gallery ${i+1}`} 
                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-[1.2s] group-hover:scale-110" 
                        loading="lazy"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <div className="text-white space-y-2">
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
                              {activeBranch} Collection
                            </div>
                            <div className="text-lg font-serif italic">
                              Perspective {i + 1}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-burgundy/20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[1px]">
                        <div className="transform scale-75 group-hover:scale-100 transition-all duration-300">
                          <div className="text-white text-center">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                              </svg>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] border border-white/30 px-4 py-2 rounded-full backdrop-blur-sm">
                              View Full
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Corner Badge */}
                      <div className="absolute top-4 right-4 bg-burgundy/90 text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                        #{String(i + 1).padStart(2, '0')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gallery Stats */}
            <div className="max-w-4xl mx-auto mt-24 text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="group hover:scale-105 transition-all duration-300">
                  <div className="text-4xl md:text-6xl font-black text-burgundy mb-4">{data.gallery.length}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Curated Images</div>
                </div>
                <div className="group hover:scale-105 transition-all duration-300">
                  <div className="text-4xl md:text-6xl font-black text-burgundy mb-4">{data.services.length}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Premium Services</div>
                </div>
                <div className="group hover:scale-105 transition-all duration-300">
                  <div className="text-4xl md:text-6xl font-black text-burgundy mb-4">{data.rooms.length}</div>
                  <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Exclusive Suites</div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="max-w-4xl mx-auto mt-24 text-center">
              <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 p-12 rounded-[3rem] border border-neutral-200 dark:border-neutral-700">
                <h3 className="text-3xl md:text-5xl font-serif italic mb-6">Experience Beyond Images</h3>
                <p className="text-neutral-500 text-lg mb-8 max-w-2xl mx-auto">
                  Every photograph captures a moment, but nothing compares to experiencing {activeBranch} in person.
                </p>
                <div className="flex flex-wrap gap-6 justify-center">
                  <button 
                    onClick={() => setCurrentTab('Rooms')} 
                    className="bg-burgundy text-white px-8 py-4 rounded-full text-sm font-bold hover:scale-105 transition-all shadow-lg hover:shadow-xl"
                  >
                    Explore Suites
                  </button>
                  <button 
                    onClick={() => setCurrentTab('Services')} 
                    className="border border-burgundy text-burgundy px-8 py-4 rounded-full text-sm font-bold hover:bg-burgundy hover:text-white transition-all"
                  >
                    Discover Services
                  </button>
                  <button 
                    onClick={() => setCurrentTab('Contact')} 
                    className="bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 px-8 py-4 rounded-full text-sm font-bold hover:scale-105 transition-all"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {currentTab === 'Contact' && (
          <section className="reveal max-w-7xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
              <div className="lg:col-span-5 space-y-24">
                <div>
                  <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Concierge Desk</span>
                  <h2 className="text-7xl md:text-[8rem] font-black uppercase tracking-tighter mb-10 leading-[0.8]">Begin Your <br/> Journey.</h2>
                </div>
                <div className="space-y-16">
                  <div className="group cursor-default">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-burgundy mb-6">Flagship Address</p>
                    <p className="text-3xl font-light leading-tight">{data.contact.address}</p>
                  </div>
                  <div className="group cursor-default">
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-burgundy mb-6">Global Communications</p>
                    <a href={`tel:${data.contact.phone}`} className="block text-3xl font-light hover:translate-x-2 transition-transform duration-500 mb-4">{data.contact.phone}</a>
                    <a href={`mailto:${data.contact.email}`} className="block text-3xl font-light hover:translate-x-2 transition-transform duration-500 text-neutral-400 underline decoration-neutral-200 decoration-1 underline-offset-8">{data.contact.email}</a>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 bg-neutral-50 dark:bg-neutral-900/40 p-12 md:p-24 rounded-[5rem] h-fit shadow-3xl border border-neutral-100 dark:border-white/5 relative overflow-hidden group">
                <form className="space-y-16 relative z-10" onSubmit={(e) => e.preventDefault()}>
                  <div className="space-y-6">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] opacity-30">Full Identity</label>
                    <input placeholder="Ex. James Sterling" type="text" className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-6 outline-none focus:border-burgundy transition-all text-2xl font-light" />
                  </div>
                  <div className="space-y-6">
                    <label className="text-[11px] font-black uppercase tracking-[0.4em] opacity-30">Digital Channel</label>
                    <input placeholder="Ex. contact@sterling.com" type="email" className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-6 outline-none focus:border-burgundy transition-all text-2xl font-light" />
                  </div>
                  <button type="submit" className="w-full bg-burgundy text-white py-10 rounded-[2.5rem] text-[12px] font-black tracking-[0.6em] uppercase hover:brightness-125 transition-all shadow-2xl active:scale-[0.98]">Dispatch To Concierge</button>
                </form>
              </div>
            </div>
          </section>
        )}

        {currentTab === 'Admin' && (
          <section className="reveal max-w-7xl mx-auto px-6 py-20">
             <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
               <div>
                  <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Corporate Access Portal</span>
                  <h2 className="text-7xl font-black uppercase tracking-tighter">Management.</h2>
               </div>
               <div className="flex flex-col sm:flex-row gap-4">
                 {/* Role Selector */}
                 <div className="flex bg-neutral-100 dark:bg-neutral-800 p-2 rounded-2xl gap-2">
                   {(['Super Admin', 'Branch Manager', 'Reception'] as AdminRole[]).map(role => (
                     <button 
                      key={role} 
                      onClick={() => setAdminRole(role)}
                      className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${adminRole === role ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-lg' : 'opacity-40'}`}
                     >
                       {role}
                     </button>
                   ))}
                 </div>
                 
                 {/* Section Selector */}
                 <div className="flex bg-neutral-100 dark:bg-neutral-800 p-2 rounded-2xl gap-2">
                   {(['dashboard', 'bookings', 'services'] as const).map(section => (
                     <button 
                      key={section} 
                      onClick={() => setAdminSection(section)}
                      className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${adminSection === section ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow-lg' : 'opacity-40'}`}
                     >
                       {section}
                     </button>
                   ))}
                 </div>
               </div>
             </div>

             {/* Admin Content */}
             {adminSection === 'dashboard' && (
               <AdminDashboard
                 role={adminRole}
                 branch={activeBranch}
                 branchRevenues={DUMMY_BRANCH_REVENUE}
                 roomBookings={DUMMY_BOOKINGS}
                 serviceBookings={DUMMY_SERVICE_BOOKINGS}
               />
             )}

             {adminSection === 'bookings' && (
               <BookingManagement
                 role={adminRole}
                 branch={activeBranch}
                 roomBookings={DUMMY_BOOKINGS}
                 serviceBookings={DUMMY_SERVICE_BOOKINGS}
               />
             )}

             {adminSection === 'services' && (
               <ServiceManagement
                 branch={activeBranch}
                 services={data.services}
                 isSuperAdmin={adminRole === 'Super Admin'}
                 bookings={DUMMY_SERVICE_BOOKINGS}
                 revenue={DUMMY_SERVICE_REVENUE}
               />
             )}
          </section>
        )}
      </main>

      <footer className="relative border-t border-neutral-100 dark:border-neutral-900 py-32 px-10 mt-32 overflow-hidden">
        {/* Hero Image Background with Enhanced Dark Red Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/hero.jpeg" alt="Footer Background" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-red-950 via-red-950/95 to-red-900/90 dark:from-black dark:via-black/95 dark:to-neutral-950/90"></div>
        </div>
        
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-24 relative z-10">
          <div className="flex flex-col items-center md:items-start">
            <div className="mb-8" style={{ filter: 'brightness(0) invert(1)' }}>
              <Logo className="scale-[2.0]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white opacity-90 max-w-sm text-center md:text-left leading-relaxed">GLADS APARTMENT HOTEL &bull; KIGALI, RWANDA</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white opacity-75 max-w-sm text-center md:text-left leading-relaxed mt-2">One Brand &bull; Three Locations &bull; Ultimate Experience</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-24 text-[11px] font-black tracking-[0.4em] uppercase text-white">
            <div className="space-y-6">
              <p className="text-white mb-8 text-sm font-black opacity-100">Quick Access</p>
              <button onClick={() => { setAdminRole('Super Admin'); setAdminSection('dashboard'); setCurrentTab('Admin'); }} className="block opacity-80 hover:opacity-100 transition-opacity text-left text-xs font-bold">Admin Dashboard</button>
              <button onClick={() => { setAdminRole('Super Admin'); setAdminSection('bookings'); setCurrentTab('Admin'); }} className="block opacity-80 hover:opacity-100 transition-opacity text-left text-xs font-bold">Booking Management</button>
              <button onClick={() => { setAdminRole('Super Admin'); setAdminSection('services'); setCurrentTab('Admin'); }} className="block opacity-80 hover:opacity-100 transition-opacity text-left text-xs font-bold">Service Management</button>
              <button onClick={() => setShowLocationGuide(true)} className="block opacity-80 hover:opacity-100 transition-opacity text-left text-xs font-bold">Location Guide</button>
            </div>
            <div className="space-y-6">
              <p className="text-white mb-8 text-sm font-black opacity-100">Branches</p>
              <button onClick={() => handleBranchSwitch(Branch.NDERA)} className="block opacity-80 hover:opacity-100 transition-all uppercase text-left text-xs font-bold">Ndera Flagship</button>
              <button onClick={() => handleBranchSwitch(Branch.KANOMBE)} className="block opacity-80 hover:opacity-100 transition-all uppercase text-left text-xs font-bold">Kanombe Lifestyle</button>
              <button onClick={() => handleBranchSwitch(Branch.KABEZA)} className="block opacity-80 hover:opacity-100 transition-all uppercase text-left text-xs font-bold">Kabeza Residencies</button>
            </div>
            <div className="space-y-6">
              <p className="text-white mb-8 text-sm font-black opacity-100">Legal</p>
              <a href="#" className="block opacity-80 hover:opacity-100 transition-opacity text-xs font-bold">Privacy Policy</a>
              <a href="#" className="block opacity-80 hover:opacity-100 transition-opacity text-xs font-bold">Terms of Service</a>
              <a href="#" className="block opacity-80 hover:opacity-100 transition-opacity text-xs font-bold">Booking Terms</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/20 dark:border-neutral-900 text-[10px] font-black tracking-[0.5em] uppercase text-white opacity-70 text-center md:text-left relative z-10">
          &copy; 2026 GLADS APARTMENT HOTEL. PREMIUM HOSPITALITY. RWANDA.
        </div>
      </footer>

      {/* Branch Selector Modal */}
      {showBranchSelector && (
        <div className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fadeIn" onClick={() => { setShowBranchSelector(false); }}>
          <div className="bg-white dark:bg-neutral-900 rounded-[4rem] p-12 max-w-4xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
                  className="group relative h-[400px] rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                >
                  <img 
                    src={branchData.gallery[0]} 
                    alt={branchData.fullName} 
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <div className="mb-4">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">{branchData.location.distance}</span>
                    </div>
                    <h4 className="text-3xl font-black uppercase text-white mb-2">{branchData.id}</h4>
                    <p className="text-sm text-white/80 mb-4">{branchData.tagline}</p>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
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
              className="mt-12 w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 py-4 rounded-[2rem] text-sm font-black uppercase tracking-wider hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;