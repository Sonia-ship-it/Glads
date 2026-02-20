import { Branch } from '@/types';

export const BRANCH_STORAGE_KEY = 'glads-selected-branch';
export const BRANCH_CHANGE_EVENT = 'glads-branch-change';

export function isBranch(value: unknown): value is Branch {
  return typeof value === 'string' && (Object.values(Branch) as string[]).includes(value);
}

export function getStoredBranch(defaultBranch: Branch = Branch.NDERA): Branch {
  if (typeof window === 'undefined') return defaultBranch;
  const stored = window.localStorage.getItem(BRANCH_STORAGE_KEY);
  return isBranch(stored) ? stored : defaultBranch;
}

export function setStoredBranch(branch: Branch): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(BRANCH_STORAGE_KEY, branch);
  window.dispatchEvent(new CustomEvent(BRANCH_CHANGE_EVENT, { detail: { branch } }));
}

export function subscribeToBranchChanges(onBranchChange: (branch: Branch) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  const onCustomEvent = (event: Event) => {
    const detail = (event as CustomEvent<{ branch?: unknown }>).detail;
    if (isBranch(detail?.branch)) {
      onBranchChange(detail.branch);
    }
  };

  const onStorageEvent = (event: StorageEvent) => {
    if (event.key !== BRANCH_STORAGE_KEY) return;
    if (isBranch(event.newValue)) {
      onBranchChange(event.newValue);
    }
  };

  window.addEventListener(BRANCH_CHANGE_EVENT, onCustomEvent as EventListener);
  window.addEventListener('storage', onStorageEvent);

  return () => {
    window.removeEventListener(BRANCH_CHANGE_EVENT, onCustomEvent as EventListener);
    window.removeEventListener('storage', onStorageEvent);
  };
}
