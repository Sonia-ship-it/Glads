import * as React from 'react';

interface VirtualExperienceProps {
    isOpen: boolean;
    selectedRoom: any;
    data: any;
    rotation: number;
    isRotating: boolean;
    onClose: () => void;
    setRotation: (val: number | ((prev: number) => number)) => void;
    start360Rotation: () => void;
}

export const VirtualExperience: React.FC<VirtualExperienceProps> = ({
    isOpen,
    selectedRoom,
    data,
    rotation,
    isRotating,
    onClose,
    setRotation,
    start360Rotation
}) => {
    if (!isOpen || !selectedRoom) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-7xl h-[90vh] rounded-[2rem] overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-black dark:hover:text-white z-10 bg-white/10 rounded-full p-2 backdrop-blur-sm">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
                        <h3 className="text-2xl font-sans italic">{selectedRoom.name} - 360° Virtual Experience</h3>
                        <p className="text-sm text-neutral-500 mt-2">Use controls below to explore the room</p>
                    </div>

                    {/* 360° Image View */}
                    <div className="flex-1 relative bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900">
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-8">
                            <div
                                className="relative w-full h-full max-w-5xl max-h-full transition-transform duration-100 ease-out"
                                style={{
                                    transform: `perspective(2000px) rotateY(\${rotation}deg) scale(\${isRotating ? 0.95 : 1})`,
                                    transformStyle: 'preserve-3d'
                                }}
                            >
                                {/* Multiple Image Layers for Parallax Effect */}
                                <img
                                    src={data.gallery[Math.floor((rotation % 360) / 30) % data.gallery.length]}
                                    alt={`\${selectedRoom.name} - 360° View`}
                                    className="w-full h-full object-cover rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.3)] transition-all duration-200"
                                    style={{
                                        filter: `brightness(\${0.9 + Math.abs(Math.cos(rotation * Math.PI / 180)) * 0.3}) contrast(\${1.1 + Math.abs(Math.sin(rotation * Math.PI / 180)) * 0.2}) saturate(\${1 + Math.abs(Math.sin(rotation * Math.PI / 180)) * 0.3})`,
                                        transform: `translateZ(100px) scale(\${1 + Math.abs(Math.sin(rotation * Math.PI / 180)) * 0.05})`,
                                        opacity: isRotating ? 0.95 : 1
                                    }}
                                />

                                {/* Reflection Effect */}
                                <div className="absolute inset-0 rounded-3xl" style={{
                                    background: `linear-gradient(\${rotation}deg, rgba(255,255,255,0.1), transparent, rgba(0,0,0,0.2))`,
                                    opacity: 0.3
                                }}></div>

                                {/* Overlay effects for 3D feel */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" style={{
                                    opacity: Math.abs(Math.sin(rotation * Math.PI / 180)) * 0.3
                                }}></div>
                            </div>
                        </div>

                        {/* Rotation Indicator */}
                        <div className="absolute top-4 left-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm">
                            {Math.round(rotation)}°
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="p-6 border-t border-neutral-200 dark:border-neutral-800">
                        <div className="flex items-center justify-center gap-6">
                            <button
                                onClick={() => setRotation(prev => prev - 15)}
                                className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 p-4 rounded-full transition-all"
                                disabled={isRotating}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z" />
                                </svg>
                            </button>

                            <button
                                onClick={start360Rotation}
                                disabled={isRotating}
                                className={`\${isRotating ? 'bg-burgundy/50' : 'bg-burgundy hover:bg-burgundy/90'} text-white px-8 py-4 rounded-full font-bold transition-all flex items-center gap-3`}
                            >
                                <svg className={`w-5 h-5 \${isRotating ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z" />
                                </svg>
                                {isRotating ? 'Rotating...' : 'Full 360° View'}
                            </button>

                            <button
                                onClick={() => setRotation(prev => prev + 15)}
                                className="bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 p-4 rounded-full transition-all"
                                disabled={isRotating}
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M16.89 15.47L18.3 16.89c.9-1.16 1.46-2.5 1.63-3.89h-2.02c-.14.87-.49 1.72-1.02 2.47zm1.01-8.32c-1.16-.9-2.51-1.44-3.9-1.61V7.1c.87.15 1.71.49 2.46 1.03l1.44-1.45zm-1.01 2.85h2.02c-.17-1.39-.72-2.73-1.62-3.89L16.89 7.53c.52.75.87 1.59 1.01 2.47zM11 19.93v2.02c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93V4.07L15.55 8.55 11 13v-3.09c-2.84.48-5 2.94-5 5.91s2.16 5.43 5 5.91z" />
                                </svg>
                            </button>
                        </div>

                        <div className="text-center mt-4 text-sm text-neutral-500">
                            <div className="flex items-center justify-center gap-6">
                                <span>← Rotate Left</span>
                                <span className="text-burgundy font-bold">360° Virtual Tour</span>
                                <span>Rotate Right →</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
