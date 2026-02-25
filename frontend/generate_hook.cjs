const fs = require('fs');

const mainApp = fs.readFileSync('components/MainApp.tsx', 'utf-8');
const lines = mainApp.split('\n');

const constIndex = lines.findIndex(l => l.includes("const API_BASE = 'http://localhost:3001/api';"));
const initialTabIndex = lines.findIndex(l => l.includes("const App: React.FC<MainAppProps> = ({ initialTab = 'Home' }) => {"));
const isRestoringIndex = lines.findIndex(l => l.trim() === "if (isRestoringAuth) {");

if (constIndex === -1 || initialTabIndex === -1 || isRestoringIndex === -1) {
    console.error("Could not find start or end index.", { constIndex, initialTabIndex, isRestoringIndex });
    process.exit(1);
}

const topLevelImports = `import { useState, useCallback, useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Branch, RoomType, AdminRole, Service, TeamMember } from '../types';
import { BRANCH_DATA } from '../constants';
import { subscribeToBranchChanges, setStoredBranch } from '@/lib/branchSelection';

type Tab = 'Home' | 'About' | 'Rooms' | 'Services' | 'Gallery' | 'Contact' | 'Admin' | 'Feedback';
type LegalDoc = 'dashboard' | 'bookings' | 'services' | 'operations' | 'profile';
type LegalDocKey = 'privacy' | 'terms' | 'booking';
type BranchOption = { id: string; name: string; code?: string };
type AuthUser = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  branchId?: string;
};
`;

const pureHelpers = lines.slice(constIndex, initialTabIndex - 4).join('\n');

const hookStart = `export const useMainAppState = (initialTab: Tab = 'Home') => {`;

const hookBody = lines.slice(initialTabIndex + 1, isRestoringIndex).join('\n');

const exportsSet = new Set();
const bodyLines = hookBody.split('\n');
for (const l of bodyLines) {
    // Only variables at exactly 2-space indentation (since they were top level in App)
    let m = l.match(/^  const\s+([a-zA-Z0-9_]+)\s*(:|=)/);
    if (m) exportsSet.add(m[1]);
    let m2 = l.match(/^  const\s+\[([a-zA-Z0-9_]+),\s*([a-zA-Z0-9_]+)\]\s*=\s*useState/);
    if (m2) { exportsSet.add(m2[1]); exportsSet.add(m2[2]); }
    let m3 = l.match(/^  function\s+([a-zA-Z0-9_]+)\s*\(/);
    if (m3) exportsSet.add(m3[1]);
}

const returnBlock = `
  return {
    ${Array.from(exportsSet).join(',\n    ')}
  };
};
`;

const newFileContent = topLevelImports + '\n' + pureHelpers + '\n\n' + hookStart + '\n' + hookBody + returnBlock;
fs.writeFileSync('hooks/useMainAppState.ts', newFileContent);
console.log("Successfully generated useMainAppState.ts with " + exportsSet.size + " exports.");
