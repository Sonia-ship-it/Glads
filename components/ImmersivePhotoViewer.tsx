
import React, { useState, useRef, useEffect } from 'react';

interface Props {
  src: string;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export const ImmersivePhotoViewer: React.FC<Props> = ({ src, isOpen, onClose, title }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Increased sensitivity for 3D depth feel
    const rotateX = (centerY - y) / 25;
    const rotateY = (x - centerX) / 25;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const resetRotation = () => setRotation({ x: 0, y: 0 });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-2xl animate-in fade-in duration-500"
      onClick={onClose}
    >
      <button 
        className="absolute top-12 right-12 text-white/20 hover:text-white text-6xl font-thin transition-all z-[110] hover:rotate-90"
        onClick={onClose}
      >
        &times;
      </button>

      <div 
        ref={containerRef}
        className="relative w-[85vw] h-[80vh] flex items-center justify-center immersive-perspective"
        onMouseMove={handleMouseMove}
        onMouseLeave={resetRotation}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="relative w-full h-full max-w-7xl overflow-hidden rounded-2xl shadow-[0_0_150px_rgba(255,255,255,0.05)] border border-white/5 3d-frame"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.05)`,
            transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Parallax Background Glow */}
          <div 
            className="absolute inset-[-10%] bg-white/5 blur-[100px] rounded-full pointer-events-none"
            style={{
              transform: `translateX(${-rotation.y * 5}px) translateY(${-rotation.x * 5}px)`
            }}
          />

          {/* Main Content */}
          <img 
            src={src} 
            alt={title}
            className="w-full h-full object-cover transition-all duration-1000"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent z-20" />
          
          <div className="absolute bottom-20 left-20 z-30 text-white max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.6em] font-black text-white/40 mb-4 block">Immersive Residency</span>
            <h3 className="text-6xl font-serif italic tracking-tighter mb-4">{title}</h3>
            <p className="text-xs tracking-widest uppercase opacity-30 font-bold">Glads Apartments &bull; Kigali</p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-12 text-white/20 text-[10px] tracking-[0.5em] font-black uppercase">
        Explore depth by moving your cursor
      </div>
    </div>
  );
};
