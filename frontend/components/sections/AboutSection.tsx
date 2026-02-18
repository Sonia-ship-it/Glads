import * as React from 'react';
import { COMPANY_PROFILE } from '../../constants';
import { Counter } from '../common/Counter';

interface AboutSectionProps {
    activeFeatureIndex: number;
    setActiveFeatureIndex: (val: number) => void;
}

const BRANCH_TEAMS = [
    {
        branch: 'Ndera (Flagship)',
        location: 'Near 15 Road, Ndera, Gasabo',
        phone: '+250 788 300 269',
        color: 'from-burgundy/20 to-red-900/10',
        borderColor: 'border-burgundy/30',
        members: [
            { name: 'Uwase Claudine', role: 'Branch Manager', emoji: '👩‍💼' },
            { name: 'Habimana Eric', role: 'Head of Hospitality', emoji: '🤝' },
            { name: 'Mukamana Diane', role: 'Front Desk Lead', emoji: '🏨' },
            { name: 'Niyonzima Jean', role: 'Wellness & Spa Supervisor', emoji: '🧘' },
            { name: 'Ingabire Solange', role: 'Restaurant Manager', emoji: '🍽️' },
        ]
    },
    {
        branch: 'Kanombe (KMH)',
        location: 'Kanombe, Kicukiro, Rwanda',
        phone: '+250 788 300 269',
        color: 'from-neutral-800/20 to-neutral-900/10',
        borderColor: 'border-neutral-300/30 dark:border-white/10',
        members: [
            { name: 'Nsengimana Patrick', role: 'Branch Manager', emoji: '👨‍💼' },
            { name: 'Uwimana Grace', role: 'Guest Relations Lead', emoji: '🤝' },
            { name: 'Bizimana Thierry', role: 'Facilities Supervisor', emoji: '🔧' },
            { name: 'Mukagasana Ange', role: 'Food & Beverage Lead', emoji: '☕' },
        ]
    },
    {
        branch: 'Kabeza (Rubirizi)',
        location: 'Kabeza, Kicukiro, Rwanda',
        phone: '+250 788 300 269',
        color: 'from-stone-700/20 to-stone-900/10',
        borderColor: 'border-stone-300/30 dark:border-white/10',
        members: [
            { name: 'Kayitesi Aline', role: 'Branch Coordinator', emoji: '👩‍💼' },
            { name: 'Nkurunziza Alain', role: 'Maintenance Lead', emoji: '🔧' },
            { name: 'Uwera Beatrice', role: 'Resident Services', emoji: '🏠' },
        ]
    }
];

export const AboutSection: React.FC<AboutSectionProps> = ({
    activeFeatureIndex,
    setActiveFeatureIndex
}) => {
    return (
        <div className="reveal">
            {/* Our Story */}
            <section className="relative py-32 md:py-48 px-6 bg-white dark:bg-black transition-colors duration-700 overflow-hidden">
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

            {/* Core Values */}
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
                                className="group relative flex-1 hover:flex-[3] transition-all duration-700 ease-in-out overflow-hidden rounded-[2.5rem] bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-white/5 shadow-xl hover:shadow-2xl cursor-default"
                            >
                                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                                    <span className="text-4xl md:text-6xl font-black text-transparent stroke-neutral-200 dark:stroke-white/10" style={{ WebkitTextStrokeWidth: '1px' }}>
                                        <Counter target={idx + 1} zeroPad />
                                    </span>
                                    <div className="absolute bottom-8 left-8 md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:-rotate-90 origin-center whitespace-nowrap opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                                        <h3 className="text-2xl font-black uppercase tracking-widest text-neutral-300 dark:text-neutral-700 hidden md:block">{value.title}</h3>
                                    </div>
                                    <div className="relative z-10 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                                        <h3 className="text-3xl md:text-4xl font-black uppercase mb-4 text-neutral-900 dark:text-white">{value.title}</h3>
                                        <p className="text-neutral-600 dark:text-neutral-400 font-light leading-relaxed text-sm md:text-lg max-w-md">{value.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Meet Our Teams */}
            <section className="py-24 px-6 bg-white dark:bg-black transition-colors duration-500">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-4 block">The People Behind Glads</span>
                        <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white">Meet Our Teams.</h2>
                        <p className="text-neutral-600 dark:text-neutral-400 text-lg mt-4 max-w-2xl mx-auto">
                            Dedicated professionals at each branch, committed to making your stay exceptional.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {BRANCH_TEAMS.map((team, i) => (
                            <div key={i} className={`bg-gradient-to-br ${team.color} border ${team.borderColor} rounded-[3rem] p-8 hover:shadow-2xl transition-all duration-500`}>
                                <div className="mb-8">
                                    <h3 className="font-heading text-2xl font-bold text-neutral-900 dark:text-white mb-1">Glads {team.branch}</h3>
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm flex items-center gap-2">
                                        <span>📍</span> {team.location}
                                    </p>
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm flex items-center gap-2 mt-1">
                                        <span>📞</span> {team.phone}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {team.members.map((member, j) => (
                                        <div key={j} className="flex items-center gap-4 bg-white/60 dark:bg-white/5 rounded-2xl p-4 border border-neutral-100 dark:border-white/5">
                                            <div className="w-12 h-12 rounded-full bg-burgundy/10 flex items-center justify-center text-2xl shrink-0">
                                                {member.emoji}
                                            </div>
                                            <div>
                                                <p className="font-bold text-neutral-900 dark:text-white text-sm">{member.name}</p>
                                                <p className="text-neutral-500 dark:text-neutral-400 text-xs">{member.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
