import * as React from 'react';
import { Branch, Service } from '../../types';
import { SPORT_PRICES } from '../../constants';
import { Counter } from '../common/Counter';

interface ServicesSectionProps {
    data: any;
    activeBranch: Branch;
    serviceCategory: string;
    setServiceCategory: (cat: string) => void;
    onSelectService: (service: Service) => void;
    setCursorLabel: (label: string | null) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
    data,
    activeBranch,
    serviceCategory,
    setServiceCategory,
    onSelectService,
    setCursorLabel
}) => {
    if (activeBranch === Branch.KANOMBE) return null;

    return (
        <section className="reveal max-w-7xl mx-auto px-6 py-20">
            <div className="mb-24">
                <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Lifestyle Services</span>
                <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8]">Curated Experiences.</h2>
            </div>

            <div className="mb-12 flex flex-wrap gap-4 justify-center">
                <button onClick={() => setServiceCategory('all')} className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-wider transition-all \${serviceCategory === 'all' ? 'bg-burgundy text-white shadow-xl scale-105' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>All Services</button>
                {Array.from(new Set(data.services.map((s: any) => s.category))).map((category: any) => (
                    <button key={category} onClick={() => setServiceCategory(category)} className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-wider transition-all \${serviceCategory === category ? 'bg-burgundy text-white shadow-xl scale-105' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'}`}>{category}</button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {data.services.filter((s: any) => serviceCategory === 'all' || s.category === serviceCategory).map((service: any, i: number) => (
                    <div key={service.id} className="relative group h-[500px] rounded-[4rem] overflow-hidden shadow-2xl cursor-none" onClick={() => onSelectService(service)} onMouseEnter={() => setCursorLabel('Explore')} onMouseLeave={() => setCursorLabel(null)}>
                        <img src={service.icon} alt={service.name} className="absolute inset-0 w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-[2s]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-12 left-12 right-12 z-10 transition-transform duration-700 group-hover:-translate-y-4">
                            <span className="text-[10px] font-black tracking-[0.5em] uppercase text-white/50 mb-4 block"><Counter target={i + 1} zeroPad /> &bull; {service.category}</span>
                            <h4 className="text-4xl font-sans italic mb-6 text-white leading-tight">{service.name}</h4>
                            <p className="text-sm text-white/60 font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-700">{service.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-32">
                <div className="bg-neutral-50 dark:bg-neutral-900/40 rounded-[3rem] p-12 border border-neutral-100 dark:border-white/5 shadow-xl">
                    <div className="text-center mb-12"><h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Sport Prices.</h2></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {SPORT_PRICES.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between py-4 border-b border-neutral-200 dark:border-neutral-800">
                                <span className="font-bold text-lg">{item.product}</span>
                                <span className="text-burgundy font-black text-xl">{item.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
