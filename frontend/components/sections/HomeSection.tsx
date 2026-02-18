import * as React from 'react';
import { Counter } from '../common/Counter';

interface HomeSectionProps {
    data: any;
    stats: any;
    setStats: (val: any) => void;
    onTabSwitch: (tab: any) => void;
    onShowBranchSelector: () => void;
}

export const HomeSection: React.FC<HomeSectionProps> = ({
    data,
    stats,
    setStats,
    onTabSwitch,
    onShowBranchSelector
}) => {
    return (
        <div className="reveal">
            <section className="relative min-h-[85vh] flex items-center px-4 md:px-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-full lg:w-[65%] h-full -z-10 rounded-bl-[15rem] overflow-hidden group">
                    <video autoPlay muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[8s] ease-out">
                        <source src="/herovideo.mp4" type="video/mp4" />
                        <img src={data.gallery[0]} alt="Hero Fallback" className="w-full h-full object-cover" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-white dark:via-black/50 dark:to-black"></div>
                </div>
                <div className="max-w-7xl mx-auto w-full">
                    <div className="max-w-3xl space-y-12">
                        <div className="inline-block bg-neutral-100 dark:bg-neutral-900/80 px-8 py-3 rounded-full border border-neutral-200 dark:border-white/5">
                            <span className="text-[11px] font-black tracking-[0.5em] uppercase text-burgundy dark:text-neutral-200">{data.fullName}</span>
                        </div>
                        <h1 className="text-8xl md:text-[10rem] font-black uppercase tracking-tighter leading-[0.8] mb-8 text-burgundy">
                            <span className="inline-block overflow-hidden align-top"><span className="inline-block animate-reveal translate-y-[110%] [animation-fill-mode:forwards] text-burgundy" style={{ animationDelay: '0.2s' }}>Art of</span></span>
                            <br />
                            <span className="inline-block overflow-hidden align-top"><span className="text-burgundy inline-block animate-reveal translate-y-[110%] [animation-fill-mode:forwards]" style={{ animationDelay: '0.4s' }}>Living.</span></span>
                        </h1>
                        <p className="text-xl md:text-3xl text-neutral-500 dark:text-neutral-400 font-light leading-relaxed max-w-xl mb-12 animate-in fade-in slide-in-from-left duration-1000 delay-700">
                            {data.tagline}. Discover hospitality redefined through silence, space, and sophisticated materials.
                        </p>
                        <div className="flex flex-col md:flex-row flex-wrap gap-6 items-start md:items-center">
                            <button onClick={() => onTabSwitch('Rooms')} className="bg-burgundy hover:bg-burgundy/90 text-white px-12 py-5 rounded-full text-[11px] font-black tracking-[0.4em] uppercase hover:scale-105 transition-all shadow-2xl shadow-burgundy/30">The Residence</button>
                            <button onClick={() => onTabSwitch('Services')} className="group flex items-center gap-4 bg-white dark:bg-neutral-900 px-8 py-4 rounded-full border-2 border-neutral-900 dark:border-white hover:bg-neutral-900 dark:hover:bg-white hover:shadow-xl transition-all">
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-neutral-900 dark:text-white group-hover:text-white dark:group-hover:text-black transition-all">Experience</span>
                            </button>
                            <button onClick={onShowBranchSelector} className="group flex items-center gap-4 bg-white dark:bg-neutral-900 px-8 py-4 rounded-full border-2 border-neutral-900 dark:border-white hover:bg-neutral-900 dark:hover:bg-white hover:shadow-xl transition-all">
                                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-neutral-900 dark:text-white group-hover:text-white dark:group-hover:text-black transition-all">Locations</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section className="reveal max-w-7xl mx-auto px-6 py-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="text-center md:text-left group/stat">
                        <div className="text-5xl md:text-7xl font-black text-burgundy mb-2"><Counter target={3} initialValue={stats.locations} onUpdate={(v) => setStats((s: any) => ({ ...s, locations: v }))} /></div>
                        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">Locations</p>
                    </div>
                    <div className="text-center group/stat">
                        <div className="text-5xl md:text-7xl font-black text-burgundy mb-2"><Counter target={50} suffix="+" initialValue={stats.suites} onUpdate={(v) => setStats((s: any) => ({ ...s, suites: v }))} /></div>
                        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">Luxury Suites</p>
                    </div>
                    <div className="text-center group/stat">
                        <div className="text-5xl md:text-7xl font-black text-burgundy mb-2"><Counter target={94} suffix="%" initialValue={stats.satisfaction} onUpdate={(v) => setStats((s: any) => ({ ...s, satisfaction: v }))} /></div>
                        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">Satisfaction</p>
                    </div>
                    <div className="text-center"><p className="text-6xl md:text-7xl font-black text-burgundy mb-4">24/7</p><p className="text-sm uppercase tracking-[0.3em] text-neutral-500 font-bold">Concierge</p></div>
                </div>
            </section>
        </div>
    );
};
