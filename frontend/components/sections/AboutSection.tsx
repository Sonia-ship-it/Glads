import * as React from 'react';
import { COMPANY_PROFILE } from '../../constants';
import { Counter } from '../common/Counter';

interface AboutSectionProps {
    activeFeatureIndex: number;
    setActiveFeatureIndex: (val: number) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
    activeFeatureIndex,
    setActiveFeatureIndex
}) => {
    return (
        <div className="reveal">
            <section className="relative py-32 md:py-48 px-6 bg-white dark:bg-black transition-colors duration-700 overflow-hidden">
                <div className="max-w-7xl mx-auto relative">
                    <div className="absolute -top-24 -left-20 text-[20rem] font-black text-neutral-100 dark:text-neutral-900 pointer-events-none select-none z-0 hidden lg:block">GLADS</div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-7 relative h-[500px] md:h-[700px]">
                            <div className="absolute top-0 right-0 w-[85%] h-[85%] rounded-[3rem] overflow-hidden shadow-2xl z-10">
                                <img src="/about-story-1.jpg" alt="The Sanctuary" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-[3rem] border-8 border-white dark:border-black overflow-hidden shadow-2xl z-20 hidden md:block">
                                <img src="/about-story-2.jpg" alt="Detailed Living" className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="lg:col-span-5 relative z-30">
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <span className="text-burgundy font-black tracking-[0.5em] uppercase text-xs block">Since 2022</span>
                                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-neutral-900 dark:text-white">Our Story.</h2>
                                </div>
                                <p className="text-xl md:text-2xl font-light leading-relaxed text-neutral-600 dark:text-neutral-400 border-l-4 border-burgundy pl-8 italic">"{COMPANY_PROFILE.about}"</p>
                                <div className="grid grid-cols-2 gap-8 pt-8">
                                    <div>
                                        <h4 className="text-3xl font-sans italic text-burgundy mb-4">Our Mission</h4>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-500 font-bold">{COMPANY_PROFILE.mission}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-3xl font-sans italic text-burgundy mb-4">Our Vision</h4>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-500 font-bold">{COMPANY_PROFILE.vision}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-neutral-50 dark:bg-neutral-900 transition-colors duration-500 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16"><h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Core Values.</h2></div>
                    <div className="flex flex-col md:flex-row gap-4 h-[80vh] md:h-[600px] w-full">
                        {COMPANY_PROFILE.values.map((value, idx) => (
                            <div key={idx} className="group relative flex-1 hover:flex-[3] transition-all duration-700 ease-in-out overflow-hidden rounded-[2.5rem] bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 shadow-xl">
                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    <span className="text-4xl md:text-6xl font-black text-transparent stroke-neutral-200 dark:stroke-white/10" style={{ WebkitTextStrokeWidth: '1px' }}><Counter target={idx + 1} zeroPad /></span>
                                    <div className="relative z-10 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <h3 className="text-3xl md:text-4xl font-black uppercase mb-4 text-neutral-900 dark:text-white">{value.title}</h3>
                                        <p className="text-neutral-600 dark:text-neutral-400 font-light text-sm md:text-lg">{value.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
