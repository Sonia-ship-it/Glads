
import React from 'react';
import { Branch } from '../types';

interface Props {
  activeBranch: Branch;
  onSelect: (branch: Branch) => void;
}

export const BranchSelector: React.FC<Props> = ({ activeBranch, onSelect }) => {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 pointer-events-auto shadow-inner">
      {Object.values(Branch).map((branch) => (
        <button
          key={branch}
          onClick={() => onSelect(branch)}
          className={`px-5 py-2.5 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all duration-300 ${
            activeBranch === branch
              ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm scale-[1.02]'
              : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          {branch}
        </button>
      ))}
    </div>
  );
};
