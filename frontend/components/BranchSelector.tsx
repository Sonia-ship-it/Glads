
import React from 'react';
import { Branch } from '../types';

interface Props {
  activeBranch: Branch;
  onSelect: (branch: Branch) => void;
}

export const BranchSelector: React.FC<Props> = ({ activeBranch, onSelect }) => {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 pointer-events-auto shadow-inner font-sans">
      {Object.values(Branch).map((branch) => (
        <button
          key={branch}
          onClick={() => onSelect(branch)}
          className={`px-3.5 py-2 rounded-xl text-[9.5px] md:text-[10px] font-extrabold tracking-[0.05em] uppercase transition-all duration-300 ${
            activeBranch === branch
              ? 'bg-white dark:bg-neutral-800 text-burgundy shadow-sm scale-[1.02]'
              : 'text-neutral-800 dark:text-neutral-200 hover:text-burgundy dark:hover:text-burgundy'
          }`}
        >
          {branch}
        </button>
      ))}
    </div>
  );
};
