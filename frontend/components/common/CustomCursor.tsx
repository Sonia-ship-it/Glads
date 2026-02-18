import * as React from 'react';
import { useState, useEffect } from 'react';

interface CustomCursorProps {
    cursorActive: boolean;
    cursorPos: { x: number; y: number };
    cursorLabel: string | null;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ cursorActive, cursorPos, cursorLabel }) => {
    const [trailPos, setTrailPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const trailAnimation = requestAnimationFrame(() => {
                setTrailPos({ x: e.clientX, y: e.clientY });
            });

            return () => cancelAnimationFrame(trailAnimation);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <>
            {/* Main Cursor - Precise Dot */}
            <div
                className={`fixed pointer-events-none z-[9999] hidden lg:block ${cursorActive ? 'scale-75' : 'scale-100'}`}
                style={{ left: cursorPos.x, top: cursorPos.y, transform: `translate(-50%, -50%) ${cursorActive ? 'scale(0.8)' : 'scale(1)'}` }}
            >
                <div className={`rounded-full bg-burgundy shadow-[0_0_15px_rgba(128,0,32,0.5)] transition-all duration-300 flex items-center justify-center ${cursorLabel ? 'w-32 h-32 bg-burgundy/90' : 'w-4 h-4'}`}>
                    {cursorLabel && (
                        <div className="text-[10px] font-black uppercase tracking-widest text-white animate-fadeIn px-4 text-center">
                            {cursorLabel}
                        </div>
                    )}
                </div>
            </div>

            {/* Follower Cursor - Large Transparent Ring */}
            <div
                className="fixed pointer-events-none z-[9998] transition-all duration-700 ease-out hidden lg:block"
                style={{
                    left: trailPos.x,
                    top: trailPos.y,
                    transform: `translate(-50%, -50%) ${cursorActive ? 'scale(1.3)' : 'scale(1)'}`,
                    width: '60px',
                    height: '60px',
                    border: '2px solid rgba(128, 0, 32, 0.12)',
                    borderRadius: '50%',
                    opacity: cursorLabel ? 0 : 0.6,
                    background: 'radial-gradient(circle, rgba(128,0,32,0.03) 0%, transparent 70%)'
                }}
            ></div>
        </>
    );
};
