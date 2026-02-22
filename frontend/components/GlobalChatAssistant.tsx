'use client';

import { useEffect, useMemo, useState } from 'react';
import { BRANCH_DATA } from '@/constants';
import { Branch } from '@/types';
import { ChatAssistant, ChatFloatingButton } from './ChatAssistant';
import {
  getStoredBranch,
  setStoredBranch,
  subscribeToBranchChanges,
} from '@/lib/branchSelection';

export function GlobalChatAssistant() {
  const [activeBranch, setActiveBranch] = useState<Branch>(Branch.NDERA);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setActiveBranch(getStoredBranch(Branch.NDERA));
    return subscribeToBranchChanges((branch) => {
      setActiveBranch(branch);
    });
  }, []);

  const branchOptions = useMemo(
    () => Object.values(BRANCH_DATA).map((branch) => ({ id: branch.id, fullName: branch.fullName, tagline: branch.tagline })),
    []
  );

  const handleSelectBranch = (branch: Branch) => {
    setActiveBranch(branch);
    setStoredBranch(branch);
  };

  return (
    <>
      <ChatFloatingButton onClick={() => setIsOpen(true)} />
      <ChatAssistant
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        activeBranch={activeBranch}
        branches={branchOptions}
        onSelectBranch={handleSelectBranch}
      />
    </>
  );
}
