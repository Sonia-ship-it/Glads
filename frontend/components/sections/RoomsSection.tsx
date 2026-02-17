import * as React from 'react';
import { Branch, RoomType } from '../../types';

interface RoomsSectionProps {
    data: any;
    activeBranch: Branch;
    onSelectRoom: (room: RoomType) => void;
    onBookRoom: (room: RoomType) => void;
    setCursorLabel: (label: string | null) => void;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({
    data,
    activeBranch,
    onSelectRoom,
    onBookRoom,
    setCursorLabel
}) => {
    return (
        <section className="reveal max-w-7xl mx-auto px-6 py-20">
            <div className="mb-24">
                <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">Our Collection</span>
                <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8]">Master Suites.</h2>
                <p className="text-neutral-400 text-xl max-w-xl font-light">Hand-picked residences at {activeBranch}. Built for those who appreciate the finer details of spatial design.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {data.rooms.map((room: any) => (
                    <div key={room.id} className="group flex flex-col h-full bg-neutral-50 dark:bg-neutral-900/40 rounded-[3rem] p-8 border border-neutral-100 dark:border-white/5 shadow-lg transition-all duration-700">
                        <div
                            className="relative aspect-[1.2/1] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl cursor-none transition-transform duration-500 ease-out"
                            onMouseEnter={() => setCursorLabel('View Suite')}
                            onMouseLeave={() => setCursorLabel(null)}
                            onClick={() => onSelectRoom(room)}
                        >
                            <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-6 left-6 bg-burgundy/90 backdrop-blur-xl text-white px-5 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-xl">\${room.price} <span className="opacity-60">/ NT</span></div>
                        </div>
                        <h3 className="text-4xl font-sans italic mb-4 leading-none">{room.name}</h3>
                        <p className="text-base text-neutral-400 font-light mb-8 flex-grow leading-relaxed">{room.description}</p>
                        <div className="flex gap-4">
                            <button onClick={() => onSelectRoom(room)} className="flex-1 py-4 rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all">View Details</button>
                            <button onClick={() => onBookRoom(room)} className="flex-1 py-4 rounded-[1.5rem] bg-black dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:bg-burgundy dark:hover:bg-burgundy dark:hover:text-white transition-all shadow-xl">Book Now</button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};
