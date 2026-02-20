import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Branch } from '@/types';

type BranchScope = 'general' | Branch;

type KnowledgeSection = {
  title: string;
  body: string;
  scope: BranchScope;
  searchableText: string;
};

const LEGAL_BRANCH_MAPPING: Record<Branch, { publicName: string; legalReference: string; note: string }> = {
  [Branch.NDERA]: {
    publicName: 'Ndera',
    legalReference: 'GLADS APARTMENT - GASABO, Ndera (Near 15 Road)',
    note: 'Use Ndera for customer-facing responses, legal reference is Gasabo/Ndera.',
  },
  [Branch.KANOMBE]: {
    publicName: 'Kanombe',
    legalReference: 'GLADS COMPANY - Nyarugunga (KMH)',
    note: 'Use Kanombe for customer-facing responses, legal reference uses Nyarugunga.',
  },
  [Branch.KABEZA]: {
    publicName: 'Kabeza',
    legalReference: 'GLADS APARTMENT - Kanombe (Kicukiro District, Rubirizi)',
    note: 'Use Kabeza for customer-facing responses, legal location reference uses Kanombe/Rubirizi.',
  },
};

const SECTION_HEADER_REGEX = /^##\s+(.+)\n([\s\S]*?)(?=^##\s+|\s*$)/gm;

function resolveKnowledgePath(): string {
  const candidates = [
    join(process.cwd(), 'data', 'glads-info'),
    join(process.cwd(), 'frontend', 'data', 'glads-info'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error('Unable to locate frontend/data/glads-info file.');
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function toTokens(text: string): string[] {
  return normalizeText(text)
    .split(' ')
    .filter((token) => token.length >= 3);
}

function detectScope(title: string, body: string): BranchScope {
  const text = normalizeText(`${title} ${body}`);
  if (text.includes('branch ndera') || text.includes('ndera')) {
    if (!text.includes('kanombe') && !text.includes('kabeza') && !text.includes('nyarugunga')) {
      return Branch.NDERA;
    }
  }

  if (text.includes('branch kanombe') || text.includes('nyarugunga')) {
    if (!text.includes('kabeza')) {
      return Branch.KANOMBE;
    }
  }

  if (text.includes('branch kabeza') || text.includes('rubirizi')) {
    return Branch.KABEZA;
  }

  return 'general';
}

function parseSections(raw: string): KnowledgeSection[] {
  const sections: KnowledgeSection[] = [];
  const normalized = raw.replace(/\r\n/g, '\n');
  SECTION_HEADER_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null = SECTION_HEADER_REGEX.exec(normalized);
  while (match) {
    const title = match[1].trim();
    const body = match[2].trim();
    const scope = detectScope(title, body);
    sections.push({
      title,
      body,
      scope,
      searchableText: normalizeText(`${title}\n${body}`),
    });
    match = SECTION_HEADER_REGEX.exec(normalized);
  }

  return sections;
}

function loadKnowledgeSections(): KnowledgeSection[] {
  const filePath = resolveKnowledgePath();
  const content = readFileSync(filePath, 'utf8');
  const sections = parseSections(content);

  if (sections.length === 0) {
    return [
      {
        title: 'Fallback',
        body: content,
        scope: 'general',
        searchableText: normalizeText(content),
      },
    ];
  }

  return sections;
}

const KNOWLEDGE_SECTIONS = loadKnowledgeSections();

function scoreSection(section: KnowledgeSection, branch: Branch, queryTokens: string[]): number {
  let score = 0;

  if (section.scope === branch) {
    score += 6;
  } else if (section.scope !== 'general') {
    score -= 3;
  }

  for (const token of queryTokens) {
    if (section.searchableText.includes(token)) {
      score += 1;
    }
  }

  return score;
}

export function buildRagContext(branch: Branch, question: string, limit = 6): string {
  const questionTokens = toTokens(question);

  const ranked = KNOWLEDGE_SECTIONS
    .map((section) => ({ section, score: scoreSection(section, branch, questionTokens) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ section }) => `## ${section.title}\n${section.body}`)
    .join('\n\n');

  const selectedLegal = LEGAL_BRANCH_MAPPING[branch];
  const mappingSummary = Object.values(LEGAL_BRANCH_MAPPING)
    .map((item) => `${item.publicName}: ${item.legalReference}`)
    .join(' | ');

  return [
    `Selected branch: ${selectedLegal.publicName}`,
    `Selected branch legal reference: ${selectedLegal.legalReference}`,
    `Branch legal mapping summary: ${mappingSummary}`,
    'Knowledge snippets:',
    ranked,
  ].join('\n\n');
}

export function getLegalBranchNote(branch: Branch): string {
  return LEGAL_BRANCH_MAPPING[branch].note;
}
