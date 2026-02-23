import * as React from 'react';
import { Branch } from '../../types';
import { Logo } from '../Logo';

interface FooterProps {
    onBranchSwitch: (branch: Branch) => void;
    onTabSwitch: (tab: any) => void;
    onSectionSwitch?: (section: any) => void;
    onShowLocationGuide?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
    onBranchSwitch,
    onTabSwitch,
    onSectionSwitch,
    onShowLocationGuide
}) => {
    return (
        <footer className="relative border-t border-neutral-100 dark:border-neutral-900 py-32 px-10 mt-32 overflow-hidden">
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
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-24 text-[11px] font-black tracking-[0.4em] uppercase text-white">
                    <div className="space-y-6">
                        <p className="text-white mb-8 text-sm font-black opacity-100">Quick Access</p>
                        <button onClick={() => { onTabSwitch('Admin'); }} className="block opacity-80 hover:opacity-100 transition-opacity text-left text-xs font-bold">Admin Portal</button>
                        <button onClick={onShowLocationGuide} className="block opacity-80 hover:opacity-100 transition-opacity text-left text-xs font-bold">Location Guide</button>
                    </div>
                    <div className="space-y-6">
                        <p className="text-white mb-8 text-sm font-black opacity-100">Branches</p>
                        <button onClick={() => onBranchSwitch(Branch.NDERA)} className="block opacity-80 hover:opacity-100 transition-all uppercase text-left text-xs font-bold">Ndera Flagship</button>
                        <button onClick={() => onBranchSwitch(Branch.KANOMBE)} className="block opacity-80 hover:opacity-100 transition-all uppercase text-left text-xs font-bold">Kanombe (KMH)</button>
                        <button onClick={() => onBranchSwitch(Branch.KABEZA)} className="block opacity-80 hover:opacity-100 transition-all uppercase text-left text-xs font-bold">Kabeza (Rubirizi)</button>
                    </div>
                    <div className="space-y-6">
                        <p className="text-white mb-8 text-sm font-black opacity-100">Legal</p>
                        <a href="#" className="block opacity-80 hover:opacity-100 transition-opacity text-xs font-bold">Privacy Policy</a>
                        <a href="#" className="block opacity-80 hover:opacity-100 transition-opacity text-xs font-bold">Terms of Service</a>
                        <button onClick={() => { onTabSwitch('Feedback'); }} className="block opacity-80 hover:opacity-100 transition-opacity text-left text-xs font-bold">Feedback</button>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-white/20 dark:border-neutral-900 text-[10px] font-black tracking-[0.5em] uppercase text-white opacity-70 text-center md:text-left relative z-10">
                &copy; 2026 GLADS APARTMENT HOTEL. PREMIUM HOSPITALITY. RWANDA.
            </div>
        </footer>
    );
};
