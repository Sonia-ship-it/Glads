import * as React from 'react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { COMPANY_PROFILE } from '../../constants';
import { Branch, TeamMember } from '../../types';
import { Counter } from '../common/Counter';

interface AboutSectionProps {
    activeBranch: Branch;
    activeFeatureIndex: number;
    setActiveFeatureIndex: (val: number) => void;
    teamMembers?: TeamMember[];
    isLoading?: boolean;
}

const BRANCH_TEAMS: Record<Branch, {
    branch: string;
    location: string;
    phone: string;
    color: string;
    borderColor: string;
    members: {
        fullName: string;
        position: string;
        department?: string;
        bio?: string;
        photoUrl: string;
        email?: string;
        phone?: string;
        displayOrder?: number;
    }[];
}> = {
    [Branch.NDERA]: {
        branch: 'Ndera (Flagship)',
        location: 'Near 15 Road, Ndera, Gasabo',
        phone: '+250 788 300 269',
        color: 'from-burgundy/20 to-red-900/10',
        borderColor: 'border-burgundy/30',
        members: [
            { fullName: 'Uwase Claudine', position: 'Branch Manager', department: 'Management', bio: 'Experienced hotel manager with over 10 years in the hospitality industry, ensuring guest satisfaction at every turn.', photoUrl: '/about-story-1.jpg', displayOrder: 1, email: 'claudine@glads.rw', phone: '+250788123456' },
            { fullName: 'Habimana Eric', position: 'Head of Hospitality', department: 'Operations', bio: 'Passionate about delivering the "Art of Living" experience to all our guests.', photoUrl: '/hero.jpeg', displayOrder: 2, email: 'eric@glads.rw', phone: '+250788123456' },
            { fullName: 'Mukamana Diane', position: 'Front Desk Lead', department: 'Guest Services', bio: 'Dedicated to welcoming every guest with a warm smile and ensuring a seamless check-in experience.', photoUrl: '/about-story-2.jpg', displayOrder: 3, email: 'diane@glads.rw', phone: '+250788123456' },
            { fullName: 'Niyonzima Jean', position: 'Wellness & Spa Supervisor', department: 'Wellness', bio: 'Expert in holistic therapies and dedicated to providing restorative experiences for our guests.', photoUrl: '/food.jpeg', displayOrder: 4, email: 'jean@glads.rw', phone: '+250788123456' },
            { fullName: 'Ingabire Solange', position: 'Restaurant Manager', department: 'Food & Beverage', bio: 'Bringing culinary excellence and impeccable service to our dining venues.', photoUrl: '/OKK_5838-1-scaled.jpg.jpeg', displayOrder: 5, email: 'solange@glads.rw', phone: '+250788123456' },
        ],
    },
    [Branch.KANOMBE]: {
        branch: 'Kanombe (KMH)',
        location: 'Kanombe, Kicukiro, Rwanda',
        phone: '+250 788 300 269',
        color: 'from-neutral-800/20 to-neutral-900/10',
        borderColor: 'border-neutral-300/30 dark:border-white/10',
        members: [
            { fullName: 'Nsengimana Patrick', position: 'Branch Manager', department: 'Management', bio: 'Leading the Kanombe branch with a focus on operational excellence and community engagement.', photoUrl: '/OKK_5908-1-720x520.jpg.jpeg', displayOrder: 1, email: 'patrick@glads.rw', phone: '+250788123456' },
            { fullName: 'Uwimana Grace', position: 'Guest Relations Lead', department: 'Guest Services', bio: 'Committed to personalizing every guest stay and exceeding expectations.', photoUrl: '/hero.jpeg', displayOrder: 2, email: 'grace@glads.rw', phone: '+250788123456' },
            { fullName: 'Bizimana Thierry', position: 'Facilities Supervisor', department: 'Maintenance', bio: 'Ensuring our properties remain pristine, safe, and fully functional at all times.', photoUrl: '/DSC_0996-1-720x470.jpg.jpeg', displayOrder: 3, email: 'thierry@glads.rw', phone: '+250788123456' },
            { fullName: 'Mukagasana Ange', position: 'Food & Beverage Lead', department: 'Food & Beverage', bio: 'Curating delightful culinary experiences and managing our talented kitchen team.', photoUrl: '/food.jpeg', displayOrder: 4, email: 'ange@glads.rw', phone: '+250788123456' },
        ],
    },
    [Branch.KABEZA]: {
        branch: 'Kabeza (Rubirizi)',
        location: 'Kabeza, Kicukiro, Rwanda',
        phone: '+250 788 300 269',
        color: 'from-stone-700/20 to-stone-900/10',
        borderColor: 'border-stone-300/30 dark:border-white/10',
        members: [
            { fullName: 'Kayitesi Aline', position: 'Branch Coordinator', department: 'Management', bio: 'Orchestrating daily operations to ensure a harmonious environment for guests and staff.', photoUrl: '/DSC_0996-1-720x470.jpg.jpeg', displayOrder: 1, email: 'aline@glads.rw', phone: '+250788123456' },
            { fullName: 'Nkurunziza Alain', position: 'Maintenance Lead', department: 'Maintenance', bio: 'Proactively managing infrastructure to provide a flawless stay for our residents.', photoUrl: '/about-story-2.jpg', displayOrder: 2, email: 'alain@glads.rw', phone: '+250788123456' },
            { fullName: 'Uwera Beatrice', position: 'Resident Services', department: 'Guest Services', bio: 'Your dedicated point of contact for long-term stays, providing tailored support and care.', photoUrl: '/hero.jpeg', displayOrder: 3, email: 'beatrice@glads.rw', phone: '+250788123456' },
        ],
    },
};

export const AboutSection: React.FC<AboutSectionProps> = ({
    activeBranch,
    activeFeatureIndex,
    setActiveFeatureIndex,
    teamMembers = [],
    isLoading = false,
}) => {
    const selectedTeam = BRANCH_TEAMS[activeBranch];
    // Use dynamic members if available, otherwise fallback to hardcoded
    const members = teamMembers.length > 0 ? teamMembers : selectedTeam.members;

    const [selectedMember, setSelectedMember] = useState<TeamMember | (typeof BRANCH_TEAMS[Branch.NDERA]['members'])[0] | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (selectedMember) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedMember]);

    return (
        <div className="reveal relative">
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

            <section className="py-32 px-6 bg-white dark:bg-black transition-colors duration-500">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-20">
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

                        <div className="lg:w-1/2 relative lg:h-[800px] h-[500px] hidden md:block">
                            <div className="sticky top-10 h-full w-full rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700">
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

            <section className="relative py-32 px-6 bg-white dark:bg-neutral-950 transition-colors duration-500 overflow-hidden" id="team">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-burgundy/[0.05] to-transparent" />
                <div className="pointer-events-none absolute -left-40 top-40 w-96 h-96 bg-burgundy/10 rounded-full blur-[100px]" />
                <div className="pointer-events-none absolute -right-40 bottom-40 w-96 h-96 bg-burgundy/5 rounded-full blur-[100px]" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end mb-16">
                        <div className="lg:col-span-8 relative">
                            <span className="inline-block py-1.5 px-4 rounded-full bg-burgundy/10 text-burgundy font-black tracking-[0.3em] uppercase text-[10px] mb-6 border border-burgundy/20">The People Behind Glads</span>
                            <h2 className="font-display text-5xl md:text-7xl xl:text-8xl leading-[0.85] font-bold tracking-tight text-neutral-900 dark:text-white mb-6">
                                Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-burgundy to-red-600 italic pr-2">Team.</span>
                            </h2>
                            <p className="max-w-xl text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed font-light border-l-2 border-burgundy/30 pl-5">
                                Dedicated hospitality professionals delivering consistency, warmth, and excellence at every guest touchpoint.
                            </p>
                        </div>
                        <div className="lg:col-span-4 flex flex-col lg:items-end justify-end">
                            <div className="inline-flex flex-col items-start lg:items-end px-7 py-5 rounded-[2rem] bg-neutral-50 dark:bg-white/[0.02] border border-neutral-100 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/20 backdrop-blur-sm">
                                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] font-black text-neutral-500 dark:text-neutral-400 mb-2">
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-burgundy opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-burgundy"></span>
                                    </span>
                                    Selected Branch
                                </p>
                                <p className="text-2xl md:text-3xl font-black text-burgundy bg-clip-text text-transparent bg-gradient-to-r from-burgundy to-red-800">${selectedTeam.branch}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="col-span-1 lg:col-span-2 relative overflow-hidden rounded-[2.5rem] border border-neutral-200/50 dark:border-white/10 bg-gradient-to-br from-neutral-50 to-white dark:from-neutral-900/50 dark:to-neutral-900 p-8 md:p-10 group shadow-sm">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-burgundy/5 rounded-full blur-3xl group-hover:bg-burgundy/10 transition-colors duration-700 pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col h-full justify-center">
                                <div className="mb-6">
                                    <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-black text-neutral-500 dark:text-neutral-400 bg-white dark:bg-black/40 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-white/10 shadow-sm">
                                        <svg className="w-3.5 h-3.5 text-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        About This Team
                                    </p>
                                </div>
                                <p className="text-xl md:text-2xl text-neutral-800 dark:text-neutral-200 leading-relaxed font-light max-w-2xl">
                                    A hospitality-first team built to deliver <strong className="font-bold text-burgundy dark:text-red-400">consistent service quality</strong>, fast support, and memorable guest experiences across every stay.
                                </p>
                            </div>
                        </div>
                        <div className="col-span-1 relative overflow-hidden rounded-[2.5rem] bg-burgundy text-white p-8 md:p-10 shadow-xl shadow-burgundy/20 flex flex-col justify-between group">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

                            <div className="relative z-10">
                                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/70 mb-4 inline-flex items-center gap-2">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    Contact Branch
                                </p>
                                <a href={`tel:${selectedTeam.phone}`} className="inline-flex items-center gap-3 text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-black text-white hover:text-white/80 transition-all mb-4 group/link w-full">
                                    <span className="truncate">${selectedTeam.phone}</span>
                                    <svg className="w-5 h-5 md:w-6 md:h-6 shrink-0 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </a>
                                <p className="text-sm md:text-base text-white/80 leading-relaxed font-light flex items-start gap-2.5">
                                    <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span>${selectedTeam.location}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Auto-Centering Flex Grid for Team Cards */}
                    <div className="flex flex-wrap justify-center gap-6 xl:gap-8 max-w-[1400px] mx-auto min-h-[400px]">
                        {isLoading ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 border-4 border-burgundy/20 border-t-burgundy rounded-full animate-spin mb-4"></div>
                                <p className="text-neutral-500 font-light tracking-widest uppercase text-xs">Assembling Team...</p>
                            </div>
                        ) : members.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20">
                                <p className="text-neutral-500 font-light">No team members found for this branch.</p>
                            </div>
                        ) : (
                            members.map((member, j) => {
                                return (
                                    <article
                                        key={j}
                                        onClick={() => setSelectedMember(member)}
                                        className="group relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-neutral-900 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-burgundy/20 hover:-translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] border border-neutral-200 dark:border-white/10 p-2 md:p-3
                                        w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-1.5rem)] xl:w-[calc(33.333%-2rem)] max-w-[380px] aspect-[3/4]
                                    "
                                    >
                                        <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-inner group/cardImg">
                                            <img
                                                src={member.photoUrl}
                                                alt={member.fullName}
                                                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/cardImg:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-700" />

                                            {/* Action Icon that reveals on hover (like a View Details button) */}
                                            <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out shadow-lg">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </div>

                                            {/* Info Pane */}
                                            <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-5 md:p-6 translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">

                                                <div className="flex flex-col gap-2 mb-3">
                                                    <div className="overflow-hidden">
                                                        <div className="translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out flex flex-wrap gap-2">
                                                            <span className="inline-flex items-center rounded-xl bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-black !text-red-700 dark:!text-red-500 border border-white/50 dark:border-white/20 shadow-sm shrink-0">
                                                                {member.position}
                                                            </span>
                                                            {member.department && (
                                                                <span className="inline-flex items-center rounded-xl bg-burgundy/90 backdrop-blur-md px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] font-black text-white border border-burgundy/30 shadow-sm shrink-0">
                                                                    {member.department}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-white mb-3 drop-shadow-md leading-tight">
                                                    {member.fullName}
                                                </h3>

                                                <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] opacity-0 group-hover:opacity-100">
                                                    <div className="overflow-hidden">
                                                        {member.bio && (
                                                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-inner mb-4">
                                                                <p className="text-xs md:text-sm !text-white font-light line-clamp-3 leading-relaxed">
                                                                    "{member.bio}"
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Mini Contact Actions */}
                                                        <div className="flex items-center gap-3">
                                                            {member.email && (
                                                                <div className="w-10 h-10 rounded-full bg-burgundy text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg shadow-burgundy/40">
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            {member.phone && (
                                                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/30 transition-colors border border-white/20 shadow-lg">
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })
                        )}
                    </div>
                </div>
            </section>

            {/* Team Member Detail Modal */}
            {/* Team Member Detail Modal */}
            {mounted && selectedMember && createPortal(
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
                    onClick={() => setSelectedMember(null)}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"></div>

                    <div
                        className="relative w-full max-w-3xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row animate-slideUp border border-white/20 dark:border-white/10 p-3 md:p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Image Section - Inner Bezel Style */}
                        <div className="md:w-5/12 h-[350px] md:h-auto relative rounded-[2rem] overflow-hidden shadow-inner group/modalImg">
                            <img
                                src={selectedMember.photoUrl}
                                alt={selectedMember.fullName}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover/modalImg:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20"></div>

                            {/* Floating Close Button inside Image */}
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-900 transition-all border border-white/40 shadow-lg"
                                aria-label="Close modal"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>

                            {/* Overlaid Tags */}
                            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-xl bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-black !text-red-700 dark:!text-red-500 border border-white/50 dark:border-white/20 shadow-sm">
                                    {selectedMember.position}
                                </span>
                                {selectedMember.department && (
                                    <span className="inline-flex items-center rounded-xl bg-burgundy/90 backdrop-blur-md px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] font-black text-white border border-burgundy/30 shadow-sm">
                                        {selectedMember.department}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content Section - Elegant Magazine Style */}
                        <div className="md:w-7/12 p-8 md:p-10 flex flex-col justify-center relative">
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-burgundy/5 rounded-full blur-3xl pointer-events-none"></div>

                            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-burgundy dark:text-red-400 mb-3 ml-1">
                                Team Profile
                            </p>
                            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-neutral-900 dark:text-white mb-6 leading-tight">
                                {selectedMember.fullName}
                            </h2>

                            <div className="w-16 h-[2px] bg-gradient-to-r from-burgundy to-transparent mb-8"></div>

                            <div className="max-w-none mb-10">
                                <p className="text-base md:text-lg text-neutral-800 dark:text-white leading-relaxed font-light italic">
                                    "{selectedMember.bio || "A dedicated member of our hospitality team, focusing on delivering exceptional service and ensuring guest satisfaction at every touchpoint."}"
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-4 mt-auto">
                                {selectedMember.email && (
                                    <a href={`mailto:${selectedMember.email}`} className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-burgundy dark:bg-burgundy text-white hover:scale-[1.02] transition-all shadow-xl shadow-burgundy/20 font-bold text-sm tracking-wide overflow-hidden border border-burgundy">
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-800 to-burgundy opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <svg className="w-4 h-4 relative z-10 text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <span className="relative z-10 text-white transition-colors">Contact via Email</span>
                                    </a>
                                )}
                                {selectedMember.phone && (
                                    <a href={`tel:${selectedMember.phone}`} className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-neutral-100 dark:bg-white/5 text-neutral-800 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/10 transition-all border border-neutral-200 dark:border-white/10 font-bold text-sm tracking-wide shadow-sm hover:shadow-md">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Direct Call
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
