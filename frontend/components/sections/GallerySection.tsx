import * as React from 'react';
import { Branch } from '../../types';
import { Counter } from '../common/Counter';

interface GallerySectionProps {
    data: any;
    activeBranch: Branch;
    onOpenImmersive: (src: string, title: string) => void;
    setCursorLabel: (label: string | null) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
    data,
    activeBranch,
    onOpenImmersive,
    setCursorLabel
}) => {
    return (
        <section className="reveal max-w-full px-6 py-20">
            <div className="max-w-7xl mx-auto mb-24 text-center">
                <span className="text-burgundy font-black tracking-[0.6em] uppercase text-[11px] mb-6 block">{data.fullName} Collection</span>
                <h2 className="text-7xl md:text-9xl font-black uppercase tracking-tighter mb-10 leading-[0.8] bg-gradient-to-r from-burgundy to-neutral-600 bg-clip-text text-transparent">Visual.</h2>
            </div>

            <div className="max-w-8xl mx-auto px-6">
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
                    {data.gallery.map((img: any, i: number) => (
                        <div
                            key={i}
                            className="break-inside-avoid relative rounded-[2.5rem] overflow-hidden group cursor-none shadow-xl transition-all duration-700 hover:scale-[1.03]"
                            onClick={() => onOpenImmersive(img, `\${activeBranch} Gallery \${i + 1}`)}
                            onMouseEnter={() => setCursorLabel('Enlarge')}
                            onMouseLeave={() => setCursorLabel(null)}
                        >
                            <img src={img} alt={`Gallery \${i + 1}`} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-[1.2s] group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{activeBranch} Collection</p>
                                    <p className="text-lg font-sans italic">Perspective <Counter target={i + 1} /></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
