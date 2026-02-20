import * as React from 'react';
import { COMPANY_PROFILE } from '../../constants';
import { Branch } from '../../types';
import { Counter } from '../common/Counter';

interface AboutSectionProps {
    activeBranch: Branch;
    activeFeatureIndex: number;
    setActiveFeatureIndex: (val: number) => void;
}

const BRANCH_TEAMS: Record<Branch, {
    branch: string;
    location: string;
    phone: string;
    color: string;
    borderColor: string;
    members: { name: string; role: string; image: string }[];
}> = {
    [Branch.NDERA]: {
        branch: 'Ndera (Flagship)',
        location: 'Near 15 Road, Ndera, Gasabo',
        phone: '+250 788 300 269',
        color: 'from-burgundy/20 to-red-900/10',
        borderColor: 'border-burgundy/30',
        members: [
            { name: 'Uwase Claudine', role: 'Branch Manager', image: '/about-story-1.jpg' },
            { name: 'Habimana Eric', role: 'Head of Hospitality', image: '/hero.jpeg' },
            { name: 'Mukamana Diane', role: 'Front Desk Lead', image: '/about-story-2.jpg' },
            { name: 'Niyonzima Jean', role: 'Wellness & Spa Supervisor', image: '/food.jpeg' },
            { name: 'Ingabire Solange', role: 'Restaurant Manager', image: '/OKK_5838-1-scaled.jpg.jpeg' },
        ],
    },
    [Branch.KANOMBE]: {
        branch: 'Kanombe (KMH)',
        location: 'Kanombe, Kicukiro, Rwanda',
        phone: '+250 788 300 269',
        color: 'from-neutral-800/20 to-neutral-900/10',
        borderColor: 'border-neutral-300/30 dark:border-white/10',
        members: [
            { name: 'Nsengimana Patrick', role: 'Branch Manager', image: '/OKK_5908-1-720x520.jpg.jpeg' },
            { name: 'Uwimana Grace', role: 'Guest Relations Lead', image: '/hero.jpeg' },
            { name: 'Bizimana Thierry', role: 'Facilities Supervisor', image: '/DSC_0996-1-720x470.jpg.jpeg' },
            { name: 'Mukagasana Ange', role: 'Food & Beverage Lead', image: '/food.jpeg' },
        ],
    },
    [Branch.KABEZA]: {
        branch: 'Kabeza (Rubirizi)',
        location: 'Kabeza, Kicukiro, Rwanda',
        phone: '+250 788 300 269',
        color: 'from-stone-700/20 to-stone-900/10',
        borderColor: 'border-stone-300/30 dark:border-white/10',
        members: [
            { name: 'Kayitesi Aline', role: 'Branch Coordinator', image: '/DSC_0996-1-720x470.jpg.jpeg' },
            { name: 'Nkurunziza Alain', role: 'Maintenance Lead', image: '/about-story-2.jpg' },
            { name: 'Uwera Beatrice', role: 'Resident Services', image: '/hero.jpeg' },
        ],
    },
};

export const AboutSection: React.FC<AboutSectionProps> = ({
    activeBranch,
}) => {
    const selectedTeam = BRANCH_TEAMS[activeBranch];

    return (
        <div className="reveal">
            <section className="relative pt-6 md:pt-14 pb-20 md:pb-24 px-6 bg-white dark:bg-black transition-colors duration-700 overflow-hidden">
                <div className="max-w-7xl mx-auto relative">
                    <div className="absolute -top-24 -left-20 text-[20rem] font-black text-neutral-100 dark:text-neutral-900 pointer-events-none select-none z-0 hidden lg:block">GLADS</div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div className="lg:col-span-7 relative h-[500px] md:h-[700px]">
                            <div className="absolute top-0 right-0 w-[85%] h-[85%] rounded-[3rem] overflow-hidden shadow-2xl z-10">
                                <img src="/about-story-1.jpg" alt="The Sanctuary" className="w-full h-full object-cover hover:scale-110 transition-transform duration-[4s]" />
                            </div>
                            <div className="absolute bottom-0 left-0 w-[60%] h-[60%] rounded-[3rem] border-8 border-white dark:border-black overflow-hidden shadow-2xl z-20 hidden md:block">
                                <img src="/about-story-2.jpg" alt="Detailed Living" className="w-full h-full object-cover hover:scale-110 transition-transform duration-[4s]" />
                            </div>
                            <div className="absolute top-1/2 -left-10 w-40 h-40 bg-burgundy rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                        </div>
                        <div className="lg:col-span-5 relative z-30">
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <span className="text-burgundy font-black tracking-[0.5em] uppercase text-xs block">Since 2022</span>
                                    <h2 className="font-display text-6xl md:text-8xl font-bold tracking-tight leading-[0.85] text-neutral-900 dark:text-white">
                                        Our <br /> <span className="text-burgundy">Story.</span>
                                    </h2>
                                </div>
                                <p className="text-xl md:text-2xl font-light leading-relaxed text-neutral-600 dark:text-neutral-400 border-l-4 border-burgundy pl-8 italic">
                                    "{COMPANY_PROFILE.about}"
                                </p>
                                <div className="grid grid-cols-2 gap-8 pt-8">
                                    <div>
                                        <h4 className="font-heading text-2xl italic text-burgundy mb-4">Our Mission</h4>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{COMPANY_PROFILE.mission}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-heading text-2xl italic text-burgundy mb-4">Our Vision</h4>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{COMPANY_PROFILE.vision}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6 bg-neutral-50 dark:bg-neutral-900 transition-colors duration-500 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Our DNA</span>
                        <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white">Core Values.</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 h-[80vh] md:h-[600px] w-full">
                        {COMPANY_PROFILE.values.map((value, idx) => (
                            <div
                                key={idx}
                                className="group relative flex-1 hover:flex-[2.3] transition-all duration-700 ease-in-out overflow-hidden rounded-[2.5rem] bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 shadow-xl hover:shadow-2xl cursor-default text-white"
                            >
                                <div
                                    className="absolute inset-0 transition-transform duration-700 group-hover:scale-110 bg-cover bg-center opacity-0 group-hover:opacity-55 dark:group-hover:opacity-35"
                                    style={{
                                        backgroundImage: `url(${idx % 3 === 0 ? '/core-value-bg-1.jpeg' : idx % 3 === 1 ? '/core-value-bg-2.jpeg' : '/core-value-bg-3.jpg'})`
                                    }}
                                ></div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500"></div>

                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <span className="text-4xl md:text-6xl font-black text-transparent stroke-neutral-200 dark:stroke-white/10 transition-all duration-500 group-hover:stroke-white/30" style={{ WebkitTextStrokeWidth: '1px' }}>
                                            <Counter target={idx + 1} zeroPad />
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-burgundy text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100 delay-100">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-8 left-8 md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:-rotate-90 origin-center whitespace-nowrap opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                                        <h3 className="text-2xl font-black uppercase tracking-widest text-neutral-700 dark:text-neutral-300 group-hover:!text-white hidden md:block">{value.title}</h3>
                                    </div>

                                    <div className="relative z-10 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                        <h3 className="text-3xl md:text-4xl font-black uppercase mb-4 text-white">{value.title}</h3>
                                        <p className="!text-white font-normal leading-relaxed text-sm md:text-lg max-w-md">{value.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative py-24 px-6 bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-burgundy/[0.08] to-transparent" />
                <div className="max-w-7xl mx-auto relative">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-14">
                        <div className="lg:col-span-8">
                            <span className="text-burgundy font-black tracking-[0.55em] uppercase text-[10px] mb-4 block">The People Behind Glads</span>
                            <h2 className="font-display text-5xl md:text-7xl xl:text-8xl leading-[0.9] font-bold tracking-tight text-neutral-900 dark:text-white">Meet Our Team.</h2>
                        </div>
                        <div className="lg:col-span-4 lg:text-right">
                            <p className="text-sm uppercase tracking-[0.25em] font-black text-neutral-500 dark:text-neutral-400">Selected Branch</p>
                            <p className="mt-2 text-2xl md:text-3xl font-black text-burgundy">{selectedTeam.branch}</p>
                        </div>
                    </div>

                    <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 rounded-[2rem] border border-neutral-200 dark:border-white/10 bg-neutral-50/80 dark:bg-white/[0.03] p-6 md:p-7">
                            <p className="text-[10px] uppercase tracking-[0.24em] font-black text-neutral-500 dark:text-neutral-400">About This Team</p>
                            <p className="mt-3 text-base md:text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
                                A hospitality-first team built to deliver consistent service quality, fast support, and memorable guest experiences across every stay.
                            </p>
                        </div>
                        <div className="rounded-[2rem] border border-neutral-200 dark:border-white/10 bg-neutral-50/80 dark:bg-white/[0.03] p-6 md:p-7">
                            <p className="text-[10px] uppercase tracking-[0.24em] font-black text-neutral-500 dark:text-neutral-400">Contact</p>
                            <a href={`tel:${selectedTeam.phone}`} className="mt-3 inline-block text-xl font-black text-burgundy hover:brightness-110 transition-all">
                                {selectedTeam.phone}
                            </a>
                            <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">{selectedTeam.location}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        {selectedTeam.members.map((member, j) => (
                            <article
                                key={j}
                                className="group rounded-[2rem] border border-neutral-200 dark:border-white/10 bg-white dark:bg-white/[0.02] px-5 py-5 md:px-6 md:py-6 hover:border-burgundy/40 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="flex items-start gap-4 md:gap-5">
                                    <div className="h-12 w-12 md:h-14 md:w-14 rounded-full border border-burgundy/30 overflow-hidden shrink-0">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xl md:text-2xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
                                            {member.name}
                                        </p>
                                        <p className="mt-2 text-sm md:text-base text-neutral-600 dark:text-neutral-300">
                                            {member.role}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

