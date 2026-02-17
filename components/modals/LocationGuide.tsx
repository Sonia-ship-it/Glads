import * as React from 'react';
import { Branch } from '../../types';
import { BRANCH_DATA } from '../../constants';

interface LocationGuideProps {
    isOpen: boolean;
    activeBranch: Branch;
    onClose: () => void;
    onBranchSwitch: (branch: Branch) => void;
    onTabSwitch: (tab: any) => void;
}

export const LocationGuide: React.FC<LocationGuideProps> = ({
    isOpen,
    activeBranch,
    onClose,
    onBranchSwitch,
    onTabSwitch
}) => {
    if (!isOpen) return null;

    const branchData = BRANCH_DATA[activeBranch];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-[95vw] h-[95vh] rounded-3xl overflow-hidden shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-neutral-400 hover:text-black dark:hover:text-white z-50 bg-white dark:bg-neutral-800 rounded-full p-3 shadow-xl">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="flex flex-col h-full">
                    <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-700">
                        <h3 className="text-4xl font-sans italic text-burgundy mb-2">Location Guide</h3>
                        <p className="text-neutral-500 dark:text-neutral-400">Discover our three premium locations across Kigali</p>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        <div className="w-96 bg-neutral-50 dark:bg-neutral-800 p-6 overflow-y-auto border-r border-neutral-200 dark:border-neutral-700">
                            <h4 className="text-sm font-black uppercase tracking-wider mb-6 text-burgundy">Select Location</h4>
                            <div className="space-y-3">
                                {Object.values(BRANCH_DATA).map(branch => (
                                    <button
                                        key={branch.id}
                                        onClick={() => onBranchSwitch(branch.id)}
                                        className={`w-full text-left p-4 rounded-xl transition-all \${activeBranch === branch.id
                      ? 'bg-burgundy text-white shadow-lg'
                      : 'bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-600'
                      }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 \${activeBranch === branch.id ? 'bg-white/20' : 'bg-burgundy/10'}`}>
                                                <svg className={`w-5 h-5 \${activeBranch === branch.id ? 'text-white' : 'text-burgundy'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm mb-1">{branch.fullName}</div>
                                                <div className={`text-xs \${activeBranch === branch.id ? 'text-white/80' : 'text-neutral-500'}`}>
                                                    {branch.location.address}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8">
                            {branchData && (
                                <div className="max-w-4xl mx-auto space-y-8">
                                    <div className="relative h-80 rounded-3xl overflow-hidden shadow-2xl">
                                        <img src={branchData.gallery[0]} alt={branchData.fullName} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        <div className="absolute bottom-8 left-8 text-white">
                                            <h2 className="text-5xl font-sans italic mb-2">{branchData.fullName}</h2>
                                            <p className="text-lg opacity-90">{branchData.location.address}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-6 h-6 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-burgundy mb-2">Address</h4>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{branchData.location.address}, Kigali, Rwanda</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 bg-burgundy/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <svg className="w-6 h-6 text-burgundy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-burgundy mb-2">Coordinates</h4>
                                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">{branchData.location.lat}, {branchData.location.lng}</p>
                                                    <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=\${branchData.location.lat},\${branchData.location.lng}`, '_blank')} className="text-xs text-burgundy hover:underline mt-2 font-bold">View on Google Maps →</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-lg">
                                        <h4 className="font-bold text-burgundy mb-4">Interactive Map</h4>
                                        <div className="w-full h-96 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-700">
                                            <iframe width="100%" height="100%" frameBorder="0" style={{ border: 0 }} src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=\${branchData.location.lat},\${branchData.location.lng}&zoom=15`} allowFullScreen></iframe>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=\${branchData.location.lat},\${branchData.location.lng}`, '_blank')} className="flex-1 bg-burgundy text-white py-4 px-6 rounded-full font-bold hover:brightness-125 transition-all flex items-center justify-center gap-2">
                                            Get Directions
                                        </button>
                                        <button onClick={() => { onBranchSwitch(activeBranch); onClose(); onTabSwitch('Rooms'); }} className="flex-1 border-2 border-burgundy text-burgundy py-4 px-6 rounded-full font-bold hover:bg-burgundy hover:text-white transition-all flex items-center justify-center gap-2">
                                            Book This Location
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
