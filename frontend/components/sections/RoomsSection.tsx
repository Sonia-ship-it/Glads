import * as React from 'react';
import { Branch, RoomType } from '../../types';
import { LoadingScreen } from '../common/LoadingScreen';

interface RoomsSectionProps {
  data: any;
  activeBranch: any;
  setCurrentTab: any;
  show3DView: any;
  setCursorLabel: any;
  openImmersive: any;
  openRoomBooking: any;
  setRotation: any;
  setShow3DView: any;
  start360Rotation: any;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({ data, activeBranch, setCurrentTab, show3DView, setCursorLabel, openImmersive, openRoomBooking, setRotation, setShow3DView, start360Rotation }) => {
  return (
    <section className="reveal max-w-7xl mx-auto px-6 py-20">
      <div className="mb-24">
        <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Our Collection</span>
        <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8]">Master <br /> Suites.</h2>
        <p className="text-neutral-400 text-xl max-w-xl font-light">Hand-picked residences at {activeBranch}. Built for those who appreciate the finer details of spatial design.</p>
      </div>
      {data.roomsLoading ? (
        <LoadingScreen message="Loading rooms..." variant="section" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {data.rooms.map((room) => (
            <div key={room.id} className="group flex flex-col h-full bg-neutral-50 dark:bg-neutral-900/40 rounded-[3rem] p-8 border border-neutral-100 dark:border-white/5 shadow-lg hover:shadow-2xl transition-all duration-700">
              <div
                className="relative aspect-[1.2/1] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl cursor-none transition-transform duration-500 ease-out preserve-3d"
                onMouseEnter={() => setCursorLabel('View Suite')}
                onMouseLeave={(e) => {
                  setCursorLabel(null);
                  (e.currentTarget as HTMLElement).style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = (y - centerY) / 10;
                  const rotateY = (centerX - x) / 10;
                  (e.currentTarget as HTMLElement).style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                }}
              >
                <img src={room.image} alt={room.name} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
                <div className="absolute top-6 left-6 bg-burgundy/90 backdrop-blur-xl text-white px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-xl animate-pulse-slow">${room.price} <span className="opacity-60">/ NT</span></div>
              </div>
              <h3 className="text-4xl font-sans italic mb-4 leading-none">{room.name}</h3>
              <p className="text-base text-neutral-400 font-light mb-8 grow leading-relaxed">{room.description}</p>
              <div className="flex flex-wrap gap-2 mb-8">
                {room.features.map((f: string) => <span key={f} className="text-[9px] uppercase tracking-widest bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-lg text-neutral-500 font-bold border border-neutral-100 dark:border-white/5">{f}</span>)}
              </div>
              <div className="flex gap-4">
                <button onClick={(e) => { e.stopPropagation(); setCurrentTab('Rooms'); }} className="flex-1 py-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">View Details</button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    openRoomBooking(room);
                  }}
                  className="flex-1 py-4 rounded-3xl bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:bg-burgundy dark:hover:bg-burgundy dark:hover:text-white transition-all shadow-xl"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
