import * as React from 'react';
import { Branch } from '../../types';
import { BRANCH_DATA } from '../../constants';

interface BranchSelectorModalProps {
    isOpen: boolean;
    activeBranch: Branch;
    onClose: () => void;
    onBranchSwitch: (branch: Branch) => void;
}

export const BranchSelectorModal: React.FC<BranchSelectorModalProps> = ({
    isOpen,
    activeBranch,
    onClose,
    onBranchSwitch
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-[40px] flex items-center justify-center p-6 animate-fadeIn" onClick={onClose}>
            <div className="bg-white/90 dark:bg-neutral-900/90 rounded-[4rem] p-12 max-w-5xl w-full shadow-[0_0_150px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/5 animate-in zoom-in-95 duration-700 font-sans" onClick={(e) => e.stopPropagation()}>
                <div className="text-center mb-12">
                    <h3 className="text-6xl font-black uppercase tracking-tighter mb-4">Where Can We Take You?</h3>
                    <p className="text-neutral-500 text-lg">Select your preferred GLADS location</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {Object.values(BRANCH_DATA).map((branchData) => (
                        <button
                            key={branchData.id}
                            onClick={() => {
                                onBranchSwitch(branchData.id);
                                onClose();
                            }}
                            className="group relative h-[400px] rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
                        >
                            <img src={branchData.gallery[0]} alt={branchData.fullName} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                            <div className="absolute inset-0 flex flex-col justify-end p-8">
                                <div className="mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/60">{branchData.location.distance}</span>
                                </div>
                                <h4 className="text-3xl font-black uppercase text-white mb-2">{branchData.id}</h4>
                                <p className="text-sm text-white/80 mb-4">{branchData.tagline}</p>
                            </div>

                            {activeBranch === branchData.id && (
                                <div className="absolute top-6 right-6 bg-burgundy text-white px-4 py-2 rounded-full text-xs font-black">
                                    CURRENT
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <button onClick={onClose} className="mt-12 w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 py-4 rounded-[2rem] text-sm font-black uppercase tracking-wider hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all">Close</button>
            </div>
        </div>
    );
};
