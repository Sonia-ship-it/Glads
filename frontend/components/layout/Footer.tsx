import * as React from 'react';
import { Branch } from '../../types';
import { Logo } from '../Logo';

interface FooterProps {
    onAdminOpen: (section: 'dashboard' | 'bookings' | 'services' | 'operations' | 'profile') => void;
    onShowLocationGuide: () => void;
    onBranchSwitch: (branch: Branch) => void;
    onLegalOpen: (doc: 'privacy' | 'terms' | 'booking') => void;
    onFeedbackOpen: () => void;
}

export const Footer: React.FC<FooterProps> = ({
    onAdminOpen,
    onShowLocationGuide,
    onBranchSwitch,
    onLegalOpen,
    onFeedbackOpen,
}) => {
    return (
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
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white! opacity-90 max-w-sm text-center md:text-left leading-relaxed">
                            GLADS APARTMENT HOTEL &bull; KIGALI, RWANDA
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white! opacity-80 max-w-sm text-center md:text-left leading-relaxed mt-2">
                            One Brand &bull; Three Locations &bull; Ultimate Experience
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-14 text-[11px] font-black tracking-[0.34em] uppercase text-white!">
                        <div className="space-y-6">
                            <p className="text-white! mb-8 text-sm font-black opacity-100">Quick Access</p>
                            <button
                                onClick={() => onAdminOpen('dashboard')}
                                className="block text-white/90! hover:text-white! transition-all text-left text-xs font-bold hover:translate-x-1"
                            >
                                Admin Dashboard
                            </button>
                            <button
                                onClick={() => onAdminOpen('bookings')}
                                className="block text-white/90! hover:text-white! transition-all text-left text-xs font-bold hover:translate-x-1"
                            >
                                Booking Management
                            </button>
                            <button
                                onClick={() => onAdminOpen('services')}
                                className="block text-white/90! hover:text-white! transition-all text-left text-xs font-bold hover:translate-x-1"
                            >
                                Service Management
                            </button>
                            <button
                                onClick={() => onAdminOpen('operations')}
                                className="block text-white/90! hover:text-white! transition-all text-left text-xs font-bold hover:translate-x-1"
                            >
                                Operations Hub
                            </button>
                            <button
                                onClick={() => onShowLocationGuide()}
                                className="block text-white/90! hover:text-white! transition-all text-left text-xs font-bold hover:translate-x-1"
                            >
                                Location Guide
                            </button>
                        </div>
                        <div className="space-y-6">
                            <p className="text-white! mb-8 text-sm font-black opacity-100">Branches</p>
                            <button
                                onClick={() => onBranchSwitch(Branch.NDERA)}
                                className="block text-white/90! hover:text-white! transition-all uppercase text-left text-xs font-bold hover:translate-x-1"
                            >
                                Ndera Flagship
                            </button>
                            <button
                                onClick={() => onBranchSwitch(Branch.KANOMBE)}
                                className="block text-white/90! hover:text-white! transition-all uppercase text-left text-xs font-bold hover:translate-x-1"
                            >
                                Kanombe (KMH)
                            </button>
                            <button
                                onClick={() => onBranchSwitch(Branch.KABEZA)}
                                className="block text-white/90! hover:text-white! transition-all uppercase text-left text-xs font-bold hover:translate-x-1"
                            >
                                Kabeza (Rubirizi)
                            </button>
                        </div>
                        <div className="space-y-6">
                            <p className="text-white! mb-8 text-sm font-black opacity-100">Legal</p>
                            <button
                                onClick={() => onLegalOpen('privacy')}
                                className="block text-white/90! hover:text-white! transition-all text-xs font-bold hover:translate-x-1 text-left"
                            >
                                Privacy Policy
                            </button>
                            <button
                                onClick={() => onLegalOpen('terms')}
                                className="block text-white/90! hover:text-white! transition-all text-xs font-bold hover:translate-x-1 text-left"
                            >
                                Terms of Service
                            </button>
                            <button
                                onClick={() => onLegalOpen('booking')}
                                className="block text-white/90! hover:text-white! transition-all text-xs font-bold hover:translate-x-1 text-left"
                            >
                                Booking Terms
                            </button>
                            <button
                                onClick={() => onFeedbackOpen()}
                                className="block text-white/90! hover:text-white! transition-all text-xs font-bold hover:translate-x-1 text-left"
                            >
                                Feedback
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/20 dark:border-neutral-900 text-[10px] font-black tracking-[0.5em] uppercase text-white/80! text-center md:text-left relative z-10">
                &copy; 2026 GLADS APARTMENT HOTEL. PREMIUM HOSPITALITY. RWANDA.
            </div>
        </footer>
    );
};
