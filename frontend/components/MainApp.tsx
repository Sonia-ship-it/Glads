'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Branch, RoomType, AdminRole, Service } from '../types';
import { BRANCH_DATA, COMPANY_PROFILE, SPORT_PRICES } from '../constants';

// Data & Mock Data
import {
  DUMMY_BOOKINGS,
  DUMMY_SERVICE_BOOKINGS,
  DUMMY_BRANCH_REVENUE,
  DUMMY_SERVICE_REVENUE
} from '../data/mockData';

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
import { ChatAssistant, ChatFloatingButton } from './ChatAssistant';
import ServiceMiniPage from './ServiceMiniPage';
import { Logo } from './Logo';
import { BranchSelector } from './BranchSelector';
import { ThemeToggle } from './ThemeToggle';
import { AdminDashboard } from './AdminDashboard';
import { BookingManagement } from './BookingManagement';
import { ServiceManagement } from './ServiceManagement';

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

  const [currentTab, setCurrentTab] = useState<'Home' | 'About' | 'Rooms' | 'Services' | 'Gallery' | 'Contact' | 'Admin'>('Home');
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
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorActive, setCursorActive] = useState(false);
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const [stats, setStats] = useState({ locations: 0, suites: 0, satisfaction: 0 });

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
    const tabs: ('Home' | 'About' | 'Rooms' | 'Services' | 'Gallery' | 'Contact' | 'Admin')[] = ['Home', 'About', 'Rooms', 'Services', 'Gallery', 'Contact'];
    if (activeBranch === Branch.KANOMBE) { // Kanombe is now the Residential one (no services)
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in slide-in-from-bottom duration-500">
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
                <button type="submit" className="w-full bg-burgundy text-white py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.02] transition-all">Continue to Payment</button>
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
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
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
      <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center pointer-events-none">
        <div className="w-full max-w-7xl glass-nav rounded-full px-6 md:px-10 h-20 md:h-24 flex items-center justify-between pointer-events-auto border border-neutral-200/50 dark:border-white/10 shadow-2xl transition-all duration-500">
          <div className="flex items-center gap-6 xl:gap-8">
            <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0" onClick={() => setCurrentTab('Home')}>
              <Logo className="scale-75 md:scale-90" />
            </div>
            <nav className="hidden xl:flex items-center space-x-4 2xl:space-x-8">
              {availableTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentTab(tab as any)}
                  className={`text-[10px] xl:text-[11px] font-black tracking-[0.3em] uppercase transition-all duration-500 relative py-2 ${currentTab === tab ? 'text-burgundy dark:text-white' : 'text-neutral-400 hover:text-black dark:hover:text-white'
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
                className="xl:hidden p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border border-neutral-200 dark:border-neutral-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
              </button>
              <button onClick={() => setCurrentTab('Rooms')} className="hidden md:block bg-burgundy text-white px-8 py-4 rounded-full text-[10px] font-black tracking-widest uppercase hover:brightness-125 transition-all shadow-lg active:scale-95">
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        <div className={`xl:hidden fixed inset-0 z-[100] bg-white/98 dark:bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center space-y-12 transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-10 right-10 text-neutral-400"
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
              className={`text-4xl font-black tracking-[0.1em] uppercase transition-colors ${currentTab === tab ? 'text-burgundy' : 'text-neutral-300 dark:text-neutral-700'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="pt-32 md:pt-44 min-h-screen transition-all duration-700 ease-in-out" key={currentTab}>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                    <h1 className="text-8xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] mb-8">
                      <span className="inline-block overflow-hidden align-top">
                        <span className="inline-block animate-reveal translate-y-[110%] [animation-fill-mode:forwards]" style={{ animationDelay: '0.2s' }}>Art of</span>
                      </span>
                      <br />
                      <span className="inline-block overflow-hidden align-top">
                        <span className="text-burgundy inline-block animate-reveal translate-y-[110%] [animation-fill-mode:forwards]" style={{ animationDelay: '0.4s' }}>Living.</span>
                      </span>
                    </h1>
                    <p className="text-xl md:text-3xl text-neutral-500 dark:text-neutral-400 font-light leading-relaxed max-w-xl mb-12 animate-in fade-in slide-in-from-left duration-1000 delay-700">
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
                          <svg className="w-5 h-5 text-white dark:text-black group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        </div>
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-neutral-900 dark:text-white group-hover:text-white dark:group-hover:text-black transition-all">Choose Your Experience</span>
                      </button>

                      <button
                        onClick={() => { setBookingRoom(null); setShowBranchSelector(true); }}
                        className="group flex items-center gap-4 bg-white dark:bg-neutral-900 px-8 py-4 rounded-full border-2 border-neutral-900 dark:border-white hover:bg-neutral-900 dark:hover:bg-white hover:shadow-xl transition-all"
                      >
                        <div className="w-10 h-10 rounded-full bg-neutral-900 dark:bg-white group-hover:bg-burgundy flex items-center justify-center transition-all">
                          <svg className="w-5 h-5 text-white dark:text-black group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                        </div>
                        <span className="text-[10px] font-black tracking-[0.3em] uppercase text-neutral-900 dark:text-white group-hover:text-white dark:group-hover:text-black transition-all">Where Can We Take You?</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="reveal max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="flex-1 text-center md:text-left group/stat">
                    <div className="text-5xl md:text-7xl font-black text-burgundy mb-2 transition-all duration-500 group-hover/stat:drop-shadow-[0_0_15px_rgba(128,0,32,0.4)]">
                      <Counter
                        target={3}
                        initialValue={stats.locations}
                        onUpdate={(v) => setStats(s => ({ ...s, locations: v }))}
                      />
                    </div>
                    <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">Locations</p>
                  </div>
                  <div className="text-center group/stat">
                    <div className="text-5xl md:text-7xl font-black text-burgundy mb-2 transition-all duration-500 group-hover/stat:drop-shadow-[0_0_15px_rgba(128,0,32,0.4)]">
                      <Counter
                        target={50}
                        suffix="+"
                        initialValue={stats.suites}
                        onUpdate={(v) => setStats(s => ({ ...s, suites: v }))}
                      />
                    </div>
                    <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">Luxury Suites</p>
                  </div>
                  <div className="text-center group/stat">
                    <div className="text-5xl md:text-7xl font-black text-burgundy mb-2 transition-all duration-500 group-hover/stat:drop-shadow-[0_0_15px_rgba(128,0,32,0.4)]">
                      <Counter
                        target={94}
                        suffix="%"
                        initialValue={stats.satisfaction}
                        onUpdate={(v) => setStats(s => ({ ...s, satisfaction: v }))}
                      />
                    </div>
                    <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">Satisfaction</p>
                  </div>
                  <div className="text-center">
                    <p className="text-6xl md:text-7xl font-black text-burgundy mb-4">
                      24/7
                    </p>
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
                        <svg key={i} className="w-5 h-5 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
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
                        <svg key={i} className="w-5 h-5 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
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
                        <svg key={i} className="w-5 h-5 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
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

          {currentTab === 'About' && (
            <div className="reveal">
              {/* Cinematic Narrative - Our Story */}
              <section className="relative py-32 md:py-48 px-6 bg-white dark:bg-black transition-colors duration-700 overflow-hidden">
                <div className="max-w-7xl mx-auto relative">
                  {/* Background Text Accent */}
                  <div className="absolute -top-24 -left-20 text-[20rem] font-black text-neutral-100 dark:text-neutral-900 pointer-events-none select-none z-0 hidden lg:block">GLADS</div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    {/* Left Column: Visual Storytelling */}
                    <div className="lg:col-span-7 relative h-[500px] md:h-[700px] reveal-left">
                      <div className="absolute top-0 right-0 w-[85%] h-[85%] rounded-[3rem] overflow-hidden shadow-2xl z-10">
                        <img src="/about-story-1.jpg" alt="The Sanctuary" className="w-full h-full object-cover hover:scale-110 transition-transform duration-[4s]" />
                      </div>
                      <div className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-[3rem] border-8 border-white dark:border-black overflow-hidden shadow-2xl z-20 hidden md:block">
                        <img src="/about-story-2.jpg" alt="Detailed Living" className="w-full h-full object-cover hover:scale-110 transition-transform duration-[4s]" />
                      </div>
                      {/* Floating Accent */}
                      <div className="absolute top-1/2 -left-10 w-40 h-40 bg-burgundy rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    </div>

                    {/* Right Column: Text Narrative */}
                    <div className="lg:col-span-5 relative z-30 reveal-right">
                      <div className="space-y-12">
                        <div className="space-y-4">
                          <span className="text-burgundy font-black tracking-[0.5em] uppercase text-xs block">Since 2022</span>
                          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-neutral-900 dark:text-white">
                            Our <br /> <span className="text-burgundy dark:text-neutral-600">Story.</span>
                          </h2>
                        </div>

                        <p className="text-xl md:text-2xl font-light leading-relaxed text-neutral-600 dark:text-neutral-400 border-l-4 border-burgundy pl-8 italic">
                          "{COMPANY_PROFILE.about}"
                        </p>

                        <div className="grid grid-cols-2 gap-8 pt-8">
                          <div>
                            <h4 className="text-3xl font-sans italic text-burgundy mb-4">Our Mission</h4>
                            <p className="text-sm text-neutral-500 dark:text-neutral-500 leading-relaxed font-bold">{COMPANY_PROFILE.mission}</p>
                          </div>
                          <div>
                            <h4 className="text-3xl font-sans italic text-burgundy mb-4">Our Vision</h4>
                            <p className="text-sm text-neutral-500 dark:text-neutral-500 leading-relaxed font-bold">{COMPANY_PROFILE.vision}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Core Values */}
              {/* Core Values - Horizontal Accordion */}
              <section className="py-20 px-6 bg-neutral-50 dark:bg-neutral-900 transition-colors duration-500 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Our DNA</span>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-neutral-900 dark:text-white transition-colors duration-500">Core Values.</h2>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 h-[80vh] md:h-[600px] w-full">
                    {COMPANY_PROFILE.values.map((value, idx) => (
                      <div
                        key={idx}
                        className="group relative flex-1 hover:flex-[3] transition-all duration-700 ease-in-out overflow-hidden rounded-[2.5rem] bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 shadow-xl hover:shadow-2xl cursor-default"
                      >
                        {/* Background Image/Gradient */}
                        <div
                          className="absolute inset-0 transition-transform duration-700 group-hover:scale-110 bg-cover bg-center opacity-0 group-hover:opacity-60 dark:group-hover:opacity-40"
                          style={{
                            backgroundImage: `url(${idx % 3 === 0 ? '/core-value-bg-1.jpeg' :
                              idx % 3 === 1 ? '/core-value-bg-2.jpeg' :
                                '/core-value-bg-3.jpg'
                              })`
                          }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div>

                        {/* Content Container */}
                        <div className="absolute inset-0 p-8 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <span className="text-4xl md:text-6xl font-black text-transparent stroke-neutral-200 dark:stroke-white/10 transition-all duration-500 group-hover:stroke-white/30" style={{ WebkitTextStrokeWidth: '1px' }}>
                              <Counter target={idx + 1} zeroPad />
                            </span>
                            <div className="w-10 h-10 rounded-full bg-burgundy text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100 delay-100">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </div>
                          </div>

                          {/* Vertical Text (Collapsed State - Desktop) */}
                          <div className="absolute bottom-8 left-8 md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:-rotate-90 origin-center whitespace-nowrap opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                            <h3 className="text-2xl font-black uppercase tracking-widest text-neutral-300 dark:text-neutral-700 hidden md:block">{value.title}</h3>
                          </div>

                          {/* Expanded Content */}
                          <div className="relative z-10 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                            <h3 className="text-3xl md:text-4xl font-black uppercase mb-4 text-white">{value.title}</h3>
                            <p className="text-neutral-200 font-light leading-relaxed text-sm md:text-lg max-w-md">{value.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Why Choose Us - New Dedicated Section */}
              {/* Why Choose Us - Enhanced Feature Cards */}
              {/* Why Choose Us - Interactive Feature Split */}
              <section className="py-32 px-6 bg-white dark:bg-black transition-colors duration-500">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col lg:flex-row gap-20">
                    {/* Left: Interactive List */}
                    <div className="lg:w-1/2 space-y-12">
                      <div>
                        <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">The Glads Difference</span>
                        <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 leading-tight text-neutral-900 dark:text-white transition-colors duration-500">Why Choose <br /> Glads Apartment?</h2>
                        <p className="text-lg text-neutral-500 font-light mb-12">We don't just offer a room; we offer a lifestyle. Explore the pillars of our excellence.</p>
                      </div>

                      <div className="space-y-4">
                        {COMPANY_PROFILE.whyChooseUs.map((reason, i) => (
                          <div
                            key={i}
                            className={`group p-8 rounded-[2rem] cursor-pointer transition-all duration-500 border border-transparent ${activeFeatureIndex === i
                              ? 'bg-neutral-50 dark:bg-white/5 border-neutral-200 dark:border-white/10 shadow-xl scale-105'
                              : 'hover:bg-neutral-50 dark:hover:bg-white/5 hover:pl-10'
                              }`}
                            onMouseEnter={() => setActiveFeatureIndex(i)}
                          >
                            <div className="flex items-center gap-6">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black transition-all duration-500 ${activeFeatureIndex === i ? 'bg-burgundy text-white' : 'bg-neutral-100 dark:bg-white/10 text-neutral-400 dark:text-neutral-500'
                                }`}>
                                <Counter target={i + 1} />
                              </div>
                              <h4 className={`text-xl font-bold transition-colors duration-500 ${activeFeatureIndex === i ? 'text-burgundy' : 'text-neutral-600 dark:text-neutral-400'
                                }`}>
                                {reason}
                              </h4>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Dynamic Visual */}
                    <div className="lg:w-1/2 relative lg:h-[800px] h-[500px] hidden md:block">
                      <div className="sticky top-10 h-full w-full rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700">
                        {/* We simulate different images/gradients based on index since we don't have separate images for each reason */}
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform scale-105"
                          style={{
                            backgroundImage: `url(${activeFeatureIndex % 2 === 0
                              ? '/about1-1.jpeg'
                              : 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2525&auto=format&fit=crop'
                              })`,
                            filter: activeFeatureIndex % 2 !== 0 ? 'hue-rotate(15deg)' : 'none'
                          }}
                        ></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                        {/* Dynamic Overlay Content */}
                        <div className="absolute bottom-12 left-12 right-12 z-10">
                          <div className="overflow-hidden">
                            <h3 key={activeFeatureIndex} className="text-4xl font-black text-white mb-4 animate-slideUp">
                              {COMPANY_PROFILE.whyChooseUs[activeFeatureIndex]}
                            </h3>
                          </div>
                          <p className="text-white/70 text-lg font-light">Experience the difference in every detail.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>


            </div>
          )}

          {currentTab === 'Rooms' && (
            <section className="reveal max-w-7xl mx-auto px-6 py-20">
              <div className="mb-24">
                <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Our Collection</span>
                <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8]">Master <br /> Suites.</h2>
                <p className="text-neutral-400 text-xl max-w-xl font-light">Hand-picked residences at {activeBranch}. Built for those who appreciate the finer details of spatial design.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {data.rooms.map((room) => (
                  <div key={room.id} className="group flex flex-col h-full bg-neutral-50 dark:bg-neutral-900/40 rounded-[3rem] p-8 border border-neutral-100 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-700">
                    <div
                      className="relative aspect-[1.2/1] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl cursor-none transition-transform duration-500 ease-out preserve-3d"
                      onMouseEnter={() => setCursorLabel('View Suite')}
                      onMouseLeave={(e) => {
                        setCursorLabel(null);
                        (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
                      }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;
                        const rotateX = (y - centerY) / 10;
                        const rotateY = (centerX - x) / 10;
                        (e.currentTarget as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                      }}
                    >
                      <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                      <div className="absolute top-6 left-6 bg-burgundy/90 backdrop-blur-xl text-white px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-xl animate-pulse-slow">${room.price} <span className="opacity-60">/ NT</span></div>
                    </div>
                    <h3 className="text-4xl font-sans italic mb-4 leading-none">{room.name}</h3>
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

          {currentTab === 'Services' && activeBranch !== Branch.KANOMBE && (
            <section className="reveal max-w-7xl mx-auto px-6 py-20">
              <div className="mb-24">
                <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Lifestyle Services</span>
                <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8]">Curated <br /> Experiences.</h2>
              </div>

              {/* Category Filter */}
              <div className="mb-12 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => setServiceCategory('all')}
                  className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-wider transition-all ${serviceCategory === 'all'
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
                    className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-wider transition-all ${serviceCategory === category
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
                      className="relative group h-[500px] rounded-[4rem] overflow-hidden shadow-2xl cursor-none hover:scale-105 transition-all duration-500"
                      onClick={() => setSelectedService(service)}
                      onMouseEnter={() => setCursorLabel('Explore Service')}
                      onMouseLeave={() => setCursorLabel(null)}
                    >
                      <img src={service.icon} alt={service.name} className="absolute inset-0 w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s]" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-12 left-12 right-12 z-10 transition-transform duration-700 group-hover:-translate-y-4">
                        <span className="text-[10px] font-black tracking-[0.5em] uppercase text-white/50 mb-4 block">
                          <Counter target={i + 1} zeroPad /> &bull; {service.category}
                        </span>
                        <h4 className="text-4xl font-sans italic mb-6 text-white leading-tight">{service.name}</h4>
                        <p className="text-sm text-white/60 font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700">{service.description}</p>
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
                        <span className="font-bold text-lg">{item.product}</span>
                        <span className="text-burgundy font-black text-xl">{item.price}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-neutral-400 text-sm mt-8 italic">* Prices are per person unless otherwise stated. Monthly memberships available.</p>
                </div>
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
              <div className="max-w-8xl mx-auto px-6">
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
                  {data.gallery.map((img, i) => (
                    <div
                      key={i}
                      className="break-inside-avoid relative rounded-[2.5rem] overflow-hidden group cursor-none shadow-xl transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5"
                      onClick={() => openImmersive(img, `${activeBranch} Gallery ${i + 1}`)}
                      onMouseEnter={() => setCursorLabel('Enlarge')}
                      onMouseLeave={() => setCursorLabel(null)}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${i + 1}`}
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
                            <div className="text-lg font-sans italic">
                              Perspective <Counter target={i + 1} />
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
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
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
                  ))}
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
                  <h3 className="text-3xl md:text-5xl font-sans italic mb-6">Experience Beyond Images</h3>
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
              <div className="text-center mb-24">
                <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Our Network</span>
                <h2 className="text-7xl md:text-[8rem] font-black uppercase tracking-tighter leading-[0.8] mb-8">Reach Out.</h2>
                <p className="text-xl text-neutral-500 font-light max-w-2xl mx-auto">From Ndera to Kanombe, our concierge team is ready to assist you across all our locations.</p>
              </div>

              {/* Branch Contacts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                {Object.values(BRANCH_DATA).map((branch) => (
                  <div key={branch.id} className="bg-neutral-50 dark:bg-neutral-900/40 p-12 rounded-[3.5rem] border border-neutral-100 dark:border-white/5 shadow-xl group hover:scale-[1.02] transition-all duration-500">
                    <div className="mb-8">
                      <span className="text-burgundy font-black tracking-[0.4em] uppercase text-[10px] block mb-2">{branch.id}</span>
                      <h3 className="text-2xl font-black uppercase tracking-tight">{branch.fullName.split('–')[1] || branch.fullName}</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Location</p>
                        <p className="text-sm font-light text-neutral-600 dark:text-neutral-400">{branch.contact.address}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Hotline</p>
                        <a href={`tel:${branch.contact.phone}`} className="text-lg font-bold hover:text-burgundy transition-colors">{branch.contact.phone}</a>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Email</p>
                        <a href={`mailto:${branch.contact.email}`} className="text-sm font-medium text-burgundy underline underline-offset-4">{branch.contact.email}</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
                <div className="lg:col-span-12 bg-neutral-50 dark:bg-neutral-900/40 p-12 md:p-24 rounded-[4rem] h-fit shadow-3xl border border-neutral-100 dark:border-white/5 relative overflow-hidden group">
                  <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                      <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Inquiry Form</h3>
                      <p className="text-neutral-500">Send a direct message to our central concierge desk</p>
                    </div>
                    <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Identity</label>
                          <input placeholder="Your Name" type="text" className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-4 outline-none focus:border-burgundy transition-all text-xl font-light" />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Contact</label>
                          <input placeholder="Your Email" type="email" className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-4 outline-none focus:border-burgundy transition-all text-xl font-light" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Message</label>
                        <textarea placeholder="How can we assist you today?" rows={1} className="w-full bg-transparent border-b border-neutral-200 dark:border-neutral-800 py-4 outline-none focus:border-burgundy transition-all text-xl font-light resize-none" />
                      </div>
                      <button type="submit" className="w-full bg-burgundy text-white py-8 rounded-[2rem] text-[11px] font-black tracking-[0.5em] uppercase hover:brightness-125 transition-all shadow-xl active:scale-[0.98]">Send Message</button>
                    </form>
                  </div>
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
        </div>
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
              <button onClick={() => handleBranchSwitch(Branch.NYARUGUNGA)} className="block opacity-80 hover:opacity-100 transition-all uppercase text-left text-xs font-bold">Lifestyle (Nyarugunga)</button>
              <button onClick={() => handleBranchSwitch(Branch.KANOMBE)} className="block opacity-80 hover:opacity-100 transition-all uppercase text-left text-xs font-bold">Residences (Kanombe)</button>
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
        <div className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-[40px] flex items-center justify-center p-6 animate-fadeIn" onClick={() => { setShowBranchSelector(false); }}>
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