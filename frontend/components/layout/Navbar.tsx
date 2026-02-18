import * as React from 'react';
import { Branch } from '../../types';
import { Logo } from '../Logo';
import { BranchSelector } from '../BranchSelector';
import { ThemeToggle } from '../ThemeToggle';

interface NavbarProps {
    activeBranch: Branch;
    currentTab: string;
    availableTabs: string[];
    isDark: boolean;
    isMobileMenuOpen: boolean;
    onTabSwitch: (tab: any) => void;
    onBranchSwitch: (branch: Branch) => void;
    onThemeToggle: () => void;
    onMobileMenuToggle: (isOpen: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    activeBranch,
    currentTab,
    availableTabs,
    isDark,
    isMobileMenuOpen,
    onTabSwitch,
    onBranchSwitch,
    onThemeToggle,
    onMobileMenuToggle
}) => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-center pointer-events-none font-sans font-[var(--font-outfit)]">
            <div className="w-full max-w-7xl glass-nav rounded-full px-4 md:px-7 h-20 md:h-22 flex items-center justify-between pointer-events-auto border border-neutral-200/70 dark:border-white/10 shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-6 xl:gap-8">
                    <div className="cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0" onClick={() => onTabSwitch('Home')}>
                        <Logo className="scale-75 md:scale-90" />
                    </div>
                    <nav className="hidden xl:flex items-center gap-1 2xl:gap-1.5" style={{ fontFamily: 'var(--font-outfit)' }}>
                        {availableTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => onTabSwitch(tab as any)}
                                className={`text-[8px] xl:text-[9px] font-black tracking-normal uppercase transition-all duration-300 relative py-1.5 px-2.5 rounded-full border ${currentTab === tab ? 'text-burgundy dark:text-white bg-white/90 dark:bg-white/20 border-neutral-200/80 dark:border-white/20 shadow-sm' : 'text-neutral-900 dark:text-neutral-100 border-transparent hover:text-burgundy dark:hover:text-burgundy hover:bg-white/65 dark:hover:bg-white/10'}`}
                            >
                                {tab}
                                <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] bg-burgundy transition-all duration-300 rounded-full ${currentTab === tab ? 'w-full' : 'w-0'}`}></span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-2 md:gap-6">
                    <div className="hidden sm:block">
                        <BranchSelector activeBranch={activeBranch} onSelect={onBranchSwitch} />
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
                        <button
                            onClick={() => onMobileMenuToggle(!isMobileMenuOpen)}
                            className="xl:hidden p-3 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
                        </button>
                        <button onClick={() => onTabSwitch('Rooms')} className="hidden md:block bg-burgundy text-white px-6 py-3 rounded-full text-[9px] font-black tracking-[0.1em] uppercase hover:brightness-110 transition-all shadow-lg active:scale-95 font-sans">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav Drawer */}
            <div className={`xl:hidden fixed inset-0 z-[100] bg-white/98 dark:bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center space-y-10 transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`}>
                <button onClick={() => onMobileMenuToggle(false)} className="absolute top-10 right-10 text-neutral-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                {availableTabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            onTabSwitch(tab as any);
                            onMobileMenuToggle(false);
                        }}
                        className={`text-[1.65rem] font-[900] tracking-[0.04em] uppercase transition-colors font-sans ${currentTab === tab ? 'text-burgundy' : 'text-neutral-900 dark:text-neutral-100'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </header>
    );
};
