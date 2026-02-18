import React, { useEffect, useMemo, useState } from 'react';
import type { Service, Branch } from '../types';

type ServiceVideo = {
  title?: string;
  url: string;
};

type ServiceFaq = {
  q: string;
  a: string;
};

type Props = {
  service: Service;
  activeBranch: Branch;
  branchGallery: string[];
  onClose: () => void;
  onBook: (service: Service) => void;
  onOpenImage: (src: string, title: string) => void;
};

function toYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '');
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      if (id) return `https://www.youtube.com/embed/${id}`;
      const parts = parsed.pathname.split('/').filter(Boolean);
      const embedIndex = parts.indexOf('embed');
      if (embedIndex >= 0 && parts[embedIndex + 1]) {
        return `https://www.youtube.com/embed/${parts[embedIndex + 1]}`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function defaultFaqsForCategory(category: Service['category']): ServiceFaq[] {
  switch (category) {
    case 'Wellness & Fitness':
      return [
        { q: 'Do I need to book in advance?', a: 'Walk-ins are welcome when availability allows, but booking is recommended for peak hours and private sessions.' },
        { q: 'What should I bring?', a: 'Comfortable clothing. For pool/spa services, bring swimwear; towels are provided for guests unless otherwise stated.' },
        { q: 'Can non-guests access this service?', a: 'Some services may be available to non-guests on request. Contact reception for day-pass options and pricing.' },
      ];
    case 'Food & Entertainment':
      return [
        { q: 'Do you accommodate dietary preferences?', a: 'Yes. Please share allergies or dietary needs when booking so we can prepare.' },
        { q: 'Do I need a reservation?', a: 'Reservations are recommended for evenings and weekends to guarantee seating.' },
        { q: 'Can I host a private event?', a: 'Yes. We can customize menus and seating for private events—reach out to reception for packages.' },
      ];
    case 'Business & Events':
      return [
        { q: 'What AV equipment is available?', a: 'Standard setups include display/projection options, audio support, and connectivity. Exact availability depends on the room configuration.' },
        { q: 'Can you provide catering?', a: 'Yes. We offer coffee breaks, lunch packages, and custom catering based on your agenda.' },
        { q: 'How do I confirm a booking?', a: 'Submit a request via Book Now. Our team will confirm availability and share a pro-forma invoice if required.' },
      ];
    case 'Beauty & Care':
      return [
        { q: 'Can I request a specific stylist?', a: 'Yes. Add a note in your request and we will confirm availability.' },
        { q: 'Do you accept walk-ins?', a: 'Walk-ins are welcome, but appointments are recommended for best availability.' },
        { q: 'What products do you use?', a: 'We use premium professional products and can accommodate sensitivities when informed in advance.' },
      ];
    case 'Convenience':
      return [
        { q: 'Is this available to all guests?', a: 'Yes, availability is intended for all guests unless otherwise noted.' },
        { q: 'Do you offer delivery to rooms?', a: 'Some convenience items can be delivered to your suite. Ask reception for details.' },
        { q: 'What are peak times?', a: 'Peak times vary by branch; evenings are typically busiest.' },
      ];
    case 'Family Services':
      return [
        { q: 'Is this suitable for children?', a: 'Yes, family services are designed with comfort and safety in mind. Some activities may have age guidelines.' },
        { q: 'Do parents need to supervise?', a: 'Depending on the service, supervision may be required. Our team will confirm the policy when you book.' },
        { q: 'Can I book for a group?', a: 'Yes. Group bookings are available—please include the number of participants in your request.' },
      ];
    default:
      return [
        { q: 'Do I need to book in advance?', a: 'Booking is recommended to ensure availability.' },
        { q: 'Can non-guests access this service?', a: 'Some services may be available to non-guests on request. Contact reception for details.' },
        { q: 'What is the cancellation policy?', a: 'Policies vary by service. Our team will confirm the terms when you submit your request.' },
      ];
  }
}

export default function ServiceMiniPage({
  service,
  activeBranch,
  branchGallery,
  onClose,
  onBook,
  onOpenImage,
}: Props) {
  const [tab, setTab] = useState<'overview' | 'menu' | 'gallery' | 'videos' | 'faq'>('overview');
  const [menuTab, setMenuTab] = useState<'breakfast' | 'lunch' | 'dinner' | 'drinks'>('breakfast');

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const hasMenu = !!(service as any).menu;

  const galleryImages = useMemo(() => {
    const fromService = service.gallery?.filter(Boolean) ?? [];
    if (fromService.length > 0) return fromService;
    return branchGallery.slice(0, 18);
  }, [service.gallery, branchGallery]);

  const videos: ServiceVideo[] = service.videos ?? [];
  const faqs: ServiceFaq[] = service.faqs && service.faqs.length > 0 ? service.faqs : defaultFaqsForCategory(service.category);

  const highlights = useMemo(() => {
    const fromService = service.highlights?.filter(Boolean) ?? [];
    if (fromService.length > 0) return fromService;

    const derived: string[] = [];
    if (service.hours) derived.push(`Hours: ${service.hours}`);
    if (service.pricing) derived.push(`Pricing: ${service.pricing}`);
    if (service.description) derived.push(service.description);
    return derived.slice(0, 5);
  }, [service.highlights, service.hours, service.pricing, service.description]);

  const heroImage = service.coverImage ?? service.icon;

  return (
    <div className="fixed inset-0 z-[115] bg-black/95 backdrop-blur-xl">
      <div className="absolute inset-0 overflow-hidden">
        {heroImage ? (
          <img src={heroImage} alt={service.name} className="w-full h-full object-cover opacity-25 scale-105" />
        ) : (
          <div className="w-full h-full bg-neutral-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90" />
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 z-[120] w-12 h-12 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
        aria-label="Close"
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="relative h-full w-full max-w-[1500px] mx-auto flex flex-col">
        <div className="px-6 md:px-10 pt-8 pb-6 flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-black tracking-[0.45em] uppercase text-white/60">{activeBranch}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
              <span className="text-[10px] font-black tracking-[0.45em] uppercase text-burgundy">{service.category}</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[0.95]">{service.name}</h2>
            <p className="mt-4 text-white/80 text-base md:text-lg font-normal leading-relaxed max-w-2xl">
              {service.fullDescription || service.description || 'Discover this experience at GLADS.'}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {service.hours && (
                <span className="px-4 py-2 rounded-full text-[11px] font-bold bg-white/10 text-white border border-white/20">
                  {service.hours}
                </span>
              )}
              {service.pricing && (
                <span className="px-4 py-2 rounded-full text-[11px] font-bold bg-burgundy/20 text-white border border-burgundy/40">
                  {service.pricing}
                </span>
              )}
            </div>
            {/* MoMo Pay Banner */}
            <div className="mt-5 flex items-center gap-3 bg-yellow-400/15 border border-yellow-400/40 rounded-2xl px-5 py-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="text-yellow-300 font-black text-[11px] uppercase tracking-wider">MoMo Pay Accepted</p>
                <p className="text-white/70 text-xs mt-0.5">Pay with MTN Mobile Money for this service. Fast &amp; secure.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onBook(service)}
              className="bg-burgundy text-white px-6 md:px-8 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.22em] shadow-2xl hover:brightness-125 transition-all"
            >
              Book Now
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 text-white px-5 py-3.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border border-white/20 hover:bg-white/15 transition-all"
            >
              Close
            </button>
          </div>
        </div>

        <div className="px-6 md:px-10 sticky top-0 z-20">
          <div className="flex flex-wrap gap-3 bg-black/35 backdrop-blur-md border border-white/10 rounded-2xl p-3">
            <button
              onClick={() => setTab('overview')}
              className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${tab === 'overview' ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                }`}
            >
              Overview
            </button>
            {hasMenu && (
              <button
                onClick={() => setTab('menu')}
                className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${tab === 'menu' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                  }`}
              >
                Menu
              </button>
            )}
            <button
              onClick={() => setTab('gallery')}
              className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${tab === 'gallery' ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                }`}
            >
              Gallery
            </button>
            <button
              onClick={() => setTab('videos')}
              className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${tab === 'videos' ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                }`}
            >
              Videos
            </button>
            <button
              onClick={() => setTab('faq')}
              className={`px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${tab === 'faq' ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                }`}
            >
              FAQ
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          {tab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                  <h3 className="text-white text-xl font-black uppercase tracking-widest mb-4">The Experience</h3>
                  <p className="text-white/80 leading-relaxed">
                    {service.longDescription || service.fullDescription || service.description || 'Details will be available soon.'}
                  </p>

                  {highlights.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-white/90 text-[11px] font-black uppercase tracking-[0.35em] mb-4">Highlights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {highlights.map((h) => (
                          <div key={h} className="bg-black/30 border border-white/10 rounded-2xl p-4">
                            <div className="text-white text-sm font-semibold leading-snug">{h}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {service.inclusions && service.inclusions.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-white/90 text-[11px] font-black uppercase tracking-[0.35em] mb-4">What’s Included</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {service.inclusions.map((item) => (
                          <li key={item} className="bg-black/30 border border-white/10 rounded-2xl p-4 text-white/80 text-sm">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {service.goodToKnow && service.goodToKnow.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-white/90 text-[11px] font-black uppercase tracking-[0.35em] mb-4">Good To Know</h4>
                      <ul className="space-y-3">
                        {service.goodToKnow.map((item) => (
                          <li key={item} className="bg-black/30 border border-white/10 rounded-2xl p-4 text-white/80 text-sm">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-7">
                  <h4 className="text-white text-[11px] font-black uppercase tracking-[0.35em] mb-4">Quick Info</h4>
                  <div className="space-y-4 text-white/75 text-sm">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-white/50">Branch</span>
                      <span className="font-bold text-right">{activeBranch}</span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-white/50">Category</span>
                      <span className="font-bold text-right">{service.category}</span>
                    </div>
                    {service.hours && (
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-white/50">Hours</span>
                        <span className="font-bold text-right">{service.hours}</span>
                      </div>
                    )}
                    {service.pricing && (
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-white/50">Pricing</span>
                        <span className="font-bold text-right">{service.pricing}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-burgundy/40 to-black/40 border border-burgundy/30 rounded-[2rem] p-7">
                  <h4 className="text-white text-[11px] font-black uppercase tracking-[0.35em] mb-4">Ready?</h4>
                  <p className="text-white/85 text-sm leading-relaxed mb-5">
                    Tap “Book Now” to request a slot. Our team will confirm availability and payment instructions.
                  </p>
                  <button
                    onClick={() => onBook(service)}
                    className="w-full bg-white text-burgundy py-4 rounded-full text-[11px] font-black uppercase tracking-[0.35em] hover:brightness-110 transition-all"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'menu' && hasMenu && (() => {
            const menu = (service as any).menu;
            const menuCategories: { key: 'breakfast' | 'lunch' | 'dinner' | 'drinks'; label: string; emoji: string }[] = [
              { key: 'breakfast', label: 'Breakfast', emoji: '🌅' },
              { key: 'lunch', label: 'Lunch', emoji: '☀️' },
              { key: 'dinner', label: 'Dinner', emoji: '🌙' },
              { key: 'drinks', label: 'Drinks', emoji: '🍹' },
            ];
            const currentItems = menu[menuTab] ?? [];
            return (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-white text-xl font-black uppercase tracking-widest">Restaurant Menu</h3>
                  <div className="flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 px-3 py-1.5 rounded-full">
                    <span className="text-yellow-300 text-xs">📱</span>
                    <span className="text-yellow-300 text-[10px] font-black uppercase tracking-wider">MoMo Pay Available</span>
                  </div>
                </div>
                {/* Menu Category Tabs */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {menuCategories.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setMenuTab(cat.key)}
                      className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider border transition-all ${menuTab === cat.key
                        ? 'bg-yellow-400 text-black border-yellow-400'
                        : 'bg-white/10 text-white border-white/15 hover:bg-white/15'
                        }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>
                {/* Menu Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentItems.map((item: { name: string; description: string; price: string }, idx: number) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-base mb-1">{item.name}</h4>
                          <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                        </div>
                        <span className="text-yellow-400 font-black text-sm whitespace-nowrap shrink-0">{item.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-white/40 text-xs mt-6 italic">* Prices are subject to change. Ask staff for daily specials. MoMo Pay, cash, and card accepted.</p>
              </div>
            );
          })()}

          {tab === 'gallery' && (
            <div>
              <div className="flex items-end justify-between gap-6 mb-6">
                <div>
                  <h3 className="text-white text-xl font-black uppercase tracking-widest">Gallery</h3>
                  <p className="text-white/60 text-sm mt-1">
                    {service.gallery && service.gallery.length > 0 ? 'Service gallery' : 'Property gallery (service-specific media coming soon)'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => onOpenImage(src, service.name)}
                    className="group relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-white/5"
                  >
                    <img src={src} alt={service.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'videos' && (
            <div>
              <h3 className="text-white text-xl font-black uppercase tracking-widest mb-2">Videos</h3>
              <p className="text-white/60 text-sm mb-6">Add YouTube links or direct MP4 links per service.</p>

              {videos.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-10 text-white/70">
                  No videos added for this service yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {videos.map((v) => {
                    const youtubeEmbed = toYouTubeEmbedUrl(v.url);
                    const isMp4 = v.url.toLowerCase().includes('.mp4');
                    return (
                      <div key={v.url} className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
                        <div className="p-5 border-b border-white/10">
                          <div className="text-white font-bold">{v.title || 'Video'}</div>
                          <div className="text-white/50 text-xs break-all">{v.url}</div>
                        </div>
                        <div className="aspect-video bg-black">
                          {youtubeEmbed ? (
                            <iframe
                              src={youtubeEmbed}
                              title={v.title || service.name}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : isMp4 ? (
                            <video className="w-full h-full" controls preload="metadata">
                              <source src={v.url} type="video/mp4" />
                            </video>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/70 text-sm p-8">
                              Unsupported video link format.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'faq' && (
            <div>
              <h3 className="text-white text-xl font-black uppercase tracking-widest mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {faqs.map((f) => (
                  <details key={f.q} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 open:bg-white/10 transition-colors">
                    <summary className="cursor-pointer text-white font-bold">{f.q}</summary>
                    <div className="mt-3 text-white/80 text-sm leading-relaxed">{f.a}</div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
