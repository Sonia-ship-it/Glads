import * as React from 'react';
import { Counter } from '../common/Counter';
import { Trophy, Users, MapPin, Leaf } from 'lucide-react';
import { Branch } from '../../types';

interface HomeSectionProps {
  data: any;
  activeBranch: Branch;
  setCurrentTab: (tab: any) => void;
  handleBranchSwitch: (branch: Branch) => void;
  openImmersive: (src: string, title: string) => void;
  setCursorLabel: (label: string | null) => void;
  testimonials: any[];
  mappedNews: any[];
}

export const HomeSection: React.FC<HomeSectionProps> = ({
  data,
  activeBranch,
  setCurrentTab,
  handleBranchSwitch,
  openImmersive,
  setCursorLabel,
  testimonials,
  mappedNews
}) => {
  return (
            <div className="reveal">
              {/* Hero Section - Full Width Video */}
              <section className="relative min-h-screen flex items-center overflow-hidden -mt-32 md:-mt-44 bg-black">
                <div className="absolute inset-0 z-0">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={data.gallery[0]}
                    className="w-full h-full object-cover"
                  >
                    <source src="/herovideo.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/32" />
                  <div className="absolute inset-0 bg-linear-to-r from-black/56 via-black/28 to-black/34" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_45%,rgba(255,255,255,0.12),transparent_52%)]" />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto w-full px-6 md:px-14 pt-36 md:pt-44 pb-24">
                  <div className="max-w-3xl space-y-7 text-white">
                    <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-7 py-3 rounded-full border border-white/20">
                      <span className="text-[11px] font-black tracking-[0.24em] uppercase text-white">GLADS APARTMENT {activeBranch}</span>
                    </div>
                    <h1 className="font-display text-[3rem] md:text-[6.5rem] font-black tracking-tight leading-[0.9] text-[#7a0016] dark:text-white drop-shadow-[0_8px_28px_rgba(0,0,0,0.45)] uppercase">
                      ART OF
                      <br />
                      LIVING.
                    </h1>
                    <p className="text-[1rem] md:text-[1.08rem] text-white font-normal leading-relaxed max-w-2xl drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
                      Lifestyle Branch - Connectivity Meets Comfort. Discover hospitality redefined through silence, space, and sophisticated materials.
                    </p>
                    <div className="flex flex-wrap gap-3 md:gap-4 items-center pt-4">
                      <button
                        onClick={() => setCurrentTab('Rooms')}
                        className="bg-burgundy hover:bg-burgundy/90 text-white px-8 py-3.5 text-[10px] font-black tracking-[0.12em] uppercase border border-burgundy rounded-full transition-colors"
                      >
                        Check Availability
                      </button>
                      <button
                        onClick={() => setCurrentTab('Services')}
                        className="bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 text-[10px] font-black tracking-[0.12em] uppercase border border-white/40 rounded-full transition-colors"
                      >
                        View Menu
                      </button>
                      <button
                        onClick={() => setCurrentTab('Services')}
                        className="bg-transparent hover:bg-white/10 text-white px-8 py-3.5 text-[10px] font-black tracking-[0.12em] uppercase border border-white/30 rounded-full transition-colors"
                      >
                        Explore Our Services
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-white">
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-2">Locations</p>
                        <p className="text-3xl font-black text-white"><Counter target={3} /></p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-2">Suites</p>
                        <p className="text-3xl font-black text-white"><Counter target={50} suffix="+" /></p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-2">Satisfaction</p>
                        <p className="text-3xl font-black text-white"><Counter target={94} suffix="%" /></p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-white">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-2">Concierge</p>
                        <p className="text-3xl font-black text-white">24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Service and Room Glimpse */}
              <section className="reveal py-24 px-6 bg-neutral-50 dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-14">
                    <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-4 block">First Look</span>
                    <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white">Service and Room Glimpse.</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data.services.slice(0, 3).map((service, i) => (
                      <div
                        key={service.id}
                        className="group relative h-105 rounded-[2.5rem] overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-500 border border-neutral-200/60 dark:border-white/10"
                        onClick={() => setCurrentTab('Services')}
                      >
                        <img src={service.icon} alt={service.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/88 via-black/35 to-black/15" />
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                          <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-80 block mb-2">
                            <Counter target={i + 1} zeroPad /> • Service
                          </span>
                          <h3 className="text-3xl font-black mb-2">{service.name}</h3>
                          <p className="text-sm text-white line-clamp-2">{service.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                    {data.rooms.slice(0, 2).map((room, i) => (
                      <div
                        key={room.id}
                        className="group relative h-85 rounded-[2.5rem] overflow-hidden shadow-xl border border-neutral-200/60 dark:border-white/10 cursor-pointer hover:shadow-2xl transition-all duration-500"
                        onClick={() => setCurrentTab('Rooms')}
                      >
                        <img src={room.image} alt={room.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/88 via-black/35 to-black/15" />
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                          <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-80 block mb-2">
                            <Counter target={i + 1} zeroPad /> • Room
                          </span>
                          <h3 className="text-3xl font-black mb-2 leading-tight">{room.name}</h3>
                          <p className="text-sm text-white/85 line-clamp-2">{room.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Why Choose Us */}
              <section className="reveal py-24 px-6 bg-neutral-50 dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                      <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">The Glads Difference</span>
                      <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white mb-8">Why Choose Us.</h2>
                      <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed mb-10">We do not just offer a room. We deliver a complete lifestyle experience designed around comfort, care, and consistency.</p>
                      <div className="space-y-6">
                        {[
                          { icon: Trophy, title: 'All-in-One Destination', desc: 'Accommodation, dining, wellness, and shopping under one roof.' },
                          { icon: Users, title: 'Professional Staff', desc: 'Customer-first approach with trained hospitality professionals.' },
                          { icon: MapPin, title: 'Strategic Locations', desc: 'Three branches across Kigali for maximum convenience.' },
                          { icon: Leaf, title: 'Sustainability Commitment', desc: 'Eco-conscious practices and community-driven initiatives.' },
                        ].map((item, i) => (
                          <div key={i} className="flex gap-5 items-start">
                            <div className="w-14 h-14 rounded-2xl bg-burgundy/10 text-burgundy flex items-center justify-center shrink-0">
                              <item.icon className="w-7 h-7" strokeWidth={2.2} />
                            </div>
                            <div>
                              <h4 className="font-heading font-bold text-lg text-neutral-900 dark:text-white mb-1">{item.title}</h4>
                              <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="relative h-150 hidden lg:block">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-44 h-44 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-xl border border-white/70 dark:border-white/15 shadow-2xl flex flex-col items-center justify-center p-4">
                        <div className="flex -space-x-3 mb-3">
                          <img
                            src="/hero.jpeg"
                            alt="Ndera Branch"
                            className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-black"
                            loading="lazy"
                          />
                          <img
                            src="/OKK_5908-1-720x520.jpg.jpeg"
                            alt="Kanombe Branch"
                            className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-black"
                            loading="lazy"
                          />
                          <img
                            src="/DSC_0996-1-720x470.jpg.jpeg"
                            alt="Kabeza Branch"
                            className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-black"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-3xl font-black text-burgundy leading-none">3</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-700 dark:text-white/80 mt-1 text-center">
                          Branches
                        </p>
                      </div>
                      <div className="absolute top-0 right-0 w-[80%] h-[75%] rounded-[3rem] overflow-hidden shadow-2xl">
                        <img src="/OKK_5838-1-scaled.jpg.jpeg" alt="Glads Experience" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      </div>
                      <div className="absolute bottom-0 left-0 w-[55%] h-[50%] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-neutral-50 dark:border-neutral-950">
                        <img src="/food.jpeg" alt="Glads Dining" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Our Locations */}
              <section className="reveal py-24 px-6 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-4 block">Find Us</span>
                    <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white">Our Locations.</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      { branch: Branch.NDERA, name: 'Ndera', subtitle: 'Flagship Location', address: 'Near 15 Road, Ndera, Gasabo', tag: 'Business and Relaxation', color: 'from-burgundy/90 to-red-900/90', img: '/hero.jpeg' },
                      { branch: Branch.KANOMBE, name: 'Kanombe', subtitle: 'Vibrant Complex', address: 'Kanombe (KMH), Kicukiro', tag: 'Lifestyle and Wellness', color: 'from-neutral-800/90 to-neutral-900/90', img: '/OKK_5908-1-720x520.jpg.jpeg' },
                      { branch: Branch.KABEZA, name: 'Kabeza', subtitle: 'Residential Living', address: 'Kabeza (Rubirizi), Kicukiro', tag: 'Quiet and Affordable', color: 'from-stone-700/90 to-stone-900/90', img: '/DSC_0996-1-720x470.jpg.jpeg' },
                    ].map((loc, i) => (
                      <div key={i} className="group relative rounded-[3rem] overflow-hidden h-115 shadow-2xl cursor-pointer" onClick={() => handleBranchSwitch(loc.branch)}>
                        <img src={loc.img} alt={loc.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
                        <div className={`absolute inset-0 bg-linear-to-t ${loc.color}`}></div>
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/35 to-transparent" />
                        <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                          <div className="bg-black/45 backdrop-blur-md border border-white/20 rounded-2xl p-5 md:p-6">
                            <span className="text-white! text-[10px] font-black uppercase tracking-[0.26em] mb-2 block">{loc.subtitle}</span>
                            <h3 className="font-display text-3xl md:text-4xl font-bold text-white! mb-2 leading-tight uppercase">Glads Apartment {loc.name}</h3>
                            <p className="text-white! text-sm mb-4">{loc.address}</p>
                            <span className="inline-block bg-white/20 backdrop-blur-sm text-white! text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full border border-white/30">{loc.tag}</span>
                            <div className="mt-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (activeBranch !== loc.branch) handleBranchSwitch(loc.branch);
                                }}
                                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.16em] border transition-all ${activeBranch === loc.branch
                                  ? 'bg-white/15 text-white! border-white/40 cursor-default'
                                  : 'bg-burgundy text-white! border-burgundy hover:brightness-110'
                                  }`}
                              >
                                {activeBranch === loc.branch ? 'Current Branch' : 'Switch to this branch'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Glimpse Inside */}
              <section className="reveal py-24 px-6 bg-white dark:bg-black overflow-hidden">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-16">
                    <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-4 block">Visual Journey</span>
                    <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white">A Glimpse Inside.</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {data.gallery.slice(0, 6).map((img, i) => (
                      <div
                        key={i}
                        className={`relative rounded-4xl overflow-hidden cursor-pointer group shadow-xl ${i === 0 ? 'md:col-span-2 md:row-span-2 h-64 md:h-full' : 'h-48 md:h-56'}`}
                        onClick={() => openImmersive(img, `${activeBranch} - Highlight ${i + 1}`)}
                        onMouseEnter={() => setCursorLabel('View')}
                        onMouseLeave={() => setCursorLabel(null)}
                      >
                        <img src={img} alt={`Highlight ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Special Offers */}
              <section className="reveal py-20 px-6 bg-neutral-50 dark:bg-neutral-950">
                <div className="max-w-7xl mx-auto">
                  <div className="flex items-end justify-between gap-4 mb-10">
                    <div>
                      <span className="text-burgundy font-black tracking-[0.5em] uppercase text-[11px] block mb-3">Special Offers</span>
                      <h3 className="text-4xl md:text-6xl font-black tracking-tight">Limited Deals.</h3>
                    </div>
                    <button onClick={() => setCurrentTab('Rooms')} className="border border-neutral-300 dark:border-neutral-700 px-5 py-3 text-[10px] font-black uppercase tracking-[0.14em] hover:border-burgundy hover:text-burgundy transition-colors">
                      Check Availability
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: 'Weekend Escape', detail: 'Save 15% on two-night stays at Ndera and Kanombe.', cta: 'Book Weekend' },
                      { title: 'Family Stay Package', detail: 'Complimentary breakfast and pool access for family bookings.', cta: 'View Package' },
                      { title: 'Business Traveler Rate', detail: 'Preferential weekday rates with fast check-in and workspace setup.', cta: 'Apply Offer' },
                    ].map((offer, i) => (
                      <article key={i} className="bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-white/10 p-7 rounded-4xl shadow-lg hover:shadow-xl transition-all">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-burgundy mb-3">Offer {String(i + 1).padStart(2, '0')}</p>
                        <h4 className="text-2xl font-black mb-3">{offer.title}</h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">{offer.detail}</p>
                        <button className="text-[10px] font-black uppercase tracking-[0.12em] border border-neutral-300 dark:border-neutral-700 px-4 py-2 hover:border-burgundy hover:text-burgundy transition-colors">
                          {offer.cta}
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              {/* Testimonials */}
              <section className="reveal max-w-7xl mx-auto px-6 py-20">
                <div className="text-center mb-16">
                  <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Guest Experiences</span>
                  <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">What They Say.</h3>
                </div>
                <div className="relative">
                  <div className="overflow-hidden">
                    <div className="testimonials-slider flex gap-6 w-max py-1">
                      {[...testimonials, ...testimonials].map((item, i) => (
                        <article key={i} className="w-[86vw] md:w-110 lg:w-105 bg-neutral-50 dark:bg-neutral-900/40 p-8 md:p-10 border border-neutral-100 dark:border-white/5 rounded-[2.2rem] shadow-lg">
                          <div className="flex gap-1 mb-5">
                            {[...Array(5)].map((_, j) => (
                              <svg key={j} className="w-5 h-5 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                            ))}
                          </div>
                          <p className="text-base text-neutral-700 dark:text-neutral-300 mb-8 leading-relaxed">{item.quote}</p>
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-full bg-burgundy/10 flex items-center justify-center">
                              <span className="font-black text-burgundy text-sm">{item.initials}</span>
                            </div>
                            <div>
                              <p className="font-bold text-sm">{item.name}</p>
                              <p className="text-xs text-neutral-500">{item.role}</p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* News */}
              <section className="reveal py-20 px-6 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-12">
                    <span className="text-burgundy font-black tracking-[0.5em] uppercase text-[11px] block mb-3">News</span>
                    <h3 className="text-4xl md:text-6xl font-black tracking-tight">Latest Updates.</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(mappedNews.length > 0 ? mappedNews : [
                      { title: 'New Dining Menu Launch', text: 'Our updated food menu now includes expanded local favorites and chef specials.', image: '/food.jpeg' },
                      { title: 'Wellness Program Upgrade', text: 'Spa and fitness sessions now include structured weekly wellness routines.', image: '/hero.jpeg' },
                      { title: 'Conference Space Expansion', text: 'Kanombe branch adds enhanced event facilities for corporate bookings.', image: '/OKK_5908-1-720x520.jpg.jpeg' },
                    ]).map((news, i) => (
                      <article key={i} className="border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900/30 rounded-4xl overflow-hidden shadow-md hover:shadow-xl transition-all">
                        <div className="h-44 relative">
                          <img src={news.image} alt={news.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                          <div className="absolute inset-0 bg-linear-to-t from-black/55 to-black/10" />
                        </div>
                        <div className="p-7">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-3">Update</p>
                          <h4 className="text-2xl font-black mb-3">{news.title}</h4>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{news.text}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              {/* Contact Us */}
              <section className="reveal max-w-5xl mx-auto px-6 py-20">
                <div className="bg-linear-to-br from-burgundy to-red-900 rounded-[4rem] p-16 text-center text-white shadow-2xl">
                  <h3 className="font-display text-5xl md:text-6xl font-bold tracking-tight mb-6">Contact Us.</h3>
                  <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">Talk to our team for room availability, menu details, services, and special requests.</p>
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
  );
};
