
import React from 'react';
import { Branch } from '../types';

interface Props {
  activeBranch: Branch;
  onSelect: (branch: Branch) => void;
}

export const BranchSelector: React.FC<Props> = ({ activeBranch, onSelect }) => {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 pointer-events-auto shadow-inner" style={{ fontFamily: 'var(--font-outfit)' }}>
      {Object.values(Branch).map((branch) => (
        <button
          key={branch}
          onClick={() => onSelect(branch)}
          className={`px-2.5 py-1.5 rounded-xl text-[5px] md:text-[6px] font-semibold tracking-[0em] uppercase transition-none ${
            activeBranch === branch
              ? 'bg-white dark:bg-neutral-800 text-burgundy shadow-sm'
              : 'text-[#9d9d9d] dark:text-[#9d9d9d] hover:text-[#787878] dark:hover:text-[#c4c4c4]'
          }`}
          style={{ fontWeight: 600 }}
        >
          {branch}
        </button>
      ))}
    </div>
  );
};


