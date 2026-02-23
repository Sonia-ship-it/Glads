import * as React from 'react';
import { Branch } from '../../types';
import { Counter } from '../common/Counter';

interface GallerySectionProps {
  data: any;
  activeBranch: any;
  setCursorLabel: any;
  openImmersive: any;
  setCurrentTab: any;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ data, activeBranch, setCursorLabel, openImmersive, setCurrentTab }) => {
  return (
    <section className="reveal max-w-full px-6 py-20">
      <div className="max-w-7xl mx-auto mb-24 text-center">
        <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">{data.fullName} Collection</span>
        <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8] bg-linear-to-r from-burgundy to-neutral-600 bg-clip-text text-transparent">Visual.</h2>
        <p className="text-neutral-500 text-xl max-w-2xl mx-auto leading-relaxed">Every space tells a story. Explore our curated collection of moments, spaces, and experiences.</p>
      </div>

      {/* Enhanced Gallery Grid */}
      <div className="max-w-8xl mx-auto px-6">
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
          {data.gallery.map((img, i) => (
            <div
              key={i}
              className="break-inside-avoid relative rounded-[2.5rem] overflow-hidden group cursor-none shadow-xl transition-all duration-700 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-neutral-100 dark:bg-neutral-900 border border-black/5 dark:border-white/5"
              onClick={() => openImmersive(img, `${activeBranch} Gallery ${i + 1}`)}
              onMouseEnter={() => setCursorLabel('Enlarge')}
              onMouseLeave={() => setCursorLabel(null)}
            >
              <img
                src={img}
                alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-[1.2s] group-hover:scale-110"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="text-white space-y-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
                      {activeBranch} Collection
                    </div>
                    <div className="text-lg font-sans italic">
                      Perspective <Counter target={i + 1} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-burgundy/20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-[1px]">
                <div className="transform scale-75 group-hover:scale-100 transition-all duration-300">
                  <div className="text-white text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] border border-white/30 px-4 py-2 rounded-full backdrop-blur-sm">
                      View Full
                    </span>
                  </div>
                </div>
              </div>

              {/* Corner Badge */}
              <div className="absolute top-4 right-4 bg-burgundy/90 text-white px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm">
                #{String(i + 1).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Stats */}
      <div className="max-w-4xl mx-auto mt-24 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="group hover:scale-105 transition-all duration-300">
            <div className="text-4xl md:text-6xl font-black text-burgundy mb-4">{data.gallery.length}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Curated Images</div>
          </div>
          <div className="group hover:scale-105 transition-all duration-300">
            <div className="text-4xl md:text-6xl font-black text-burgundy mb-4">{data.services.length}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Premium Services</div>
          </div>
          <div className="group hover:scale-105 transition-all duration-300">
            <div className="text-4xl md:text-6xl font-black text-burgundy mb-4">{data.rooms.length}</div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">Exclusive Suites</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto mt-24 text-center">
        <div className="bg-linear-to-r from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 p-12 rounded-[3rem] border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-3xl md:text-5xl font-sans italic mb-6">Experience Beyond Images</h3>
          <p className="text-neutral-500 text-lg mb-8 max-w-2xl mx-auto">
            Every photograph captures a moment, but nothing compares to experiencing {activeBranch} in person.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <button
              onClick={() => setCurrentTab('Rooms')}
              className="bg-burgundy text-white px-8 py-4 rounded-full text-sm font-bold hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              Explore Suites
            </button>
            <button
              onClick={() => setCurrentTab('Services')}
              className="border border-burgundy text-burgundy px-8 py-4 rounded-full text-sm font-bold hover:bg-burgundy hover:text-white transition-all"
            >
              Discover Services
            </button>
            <button
              onClick={() => setCurrentTab('Contact')}
              className="bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 px-8 py-4 rounded-full text-sm font-bold hover:scale-105 transition-all"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
