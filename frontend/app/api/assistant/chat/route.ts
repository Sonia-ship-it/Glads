import { NextRequest, NextResponse } from 'next/server';
import { Branch } from '@/types';
import { BRANCH_DATA } from '@/constants';
import { buildRagContext, getLegalBranchNote } from '@/lib/gladsRag';

export const runtime = 'nodejs';

type IncomingHistoryItem = {
  role: 'assistant' | 'user' | string;
  content: string;
};

type ChatRequestBody = {
  branch?: Branch;
  message?: string;
  history?: IncomingHistoryItem[];
};

const BRANCH_MANAGER_CONTACTS: Record<
  Branch,
  { managerRole: string; managerName: string; phone: string; email: string }
> = {
  [Branch.NDERA]: {
    managerRole: 'GM',
    managerName: 'James Ngirowonsanga',
    phone: '+250 788 300 269',
    email: 'gladsapartments@gmail.com',
  },
  [Branch.KANOMBE]: {
    managerRole: 'Branch Manager',
    managerName: 'Jeanine',
    phone: '+250 788 354 475',
    email: 'gladsapartment@gmail.com',
  },
  [Branch.KABEZA]: {
    managerRole: 'Branch Manager',
    managerName: 'Aline',
    phone: '+250 788 550 390',
    email: 'gladsapartment19@gmail.com',
  },
};

const BRANCH_LEGAL_REFERENCE: Record<Branch, string> = {
  [Branch.NDERA]: 'GLADS APARTMENT - GASABO, Ndera (Near 15 Road)',
  [Branch.KANOMBE]: 'GLADS COMPANY - Nyarugunga (KMH)',
  [Branch.KABEZA]: 'GLADS APARTMENT - Kanombe (Kicukiro District, Rubirizi)',
};

const STRICT_BRANCH_SERVICES: Record<Branch, string[]> = {
  [Branch.NDERA]: [
    'Swimming Pool',
    'Sauna',
    'Massage',
    'Gym',
    'Jacuzzi',
    'Coffee Shop',
    'Restaurant',
    'Bars (with pool game)',
    'Conference Hall',
    'Hall',
    'Meeting Rooms',
    'Salon (Men and Women)',
    'Supermarket',
  ],
  [Branch.KANOMBE]: [
    'Swimming Pool',
    'Sauna',
    'Massage',
    'Gym',
    'Coffee Shop',
    'Kitchen',
    'Supermarket',
    'Milkzone',
  ],
  [Branch.KABEZA]: ['Rooms only (no extra facilities)'],
};

const NDERA_HALL_PRICES = [
  'Hall only: 6,000,000 RWF',
  'Live recording (sound and light included): 2 days = 15,000,000 RWF | 1 day = 12,000,000 RWF',
  'Concert: with sound and lighting = 10,000,000 RWF | without lighting = 7,500,000 RWF',
  'Wedding: with sound and lighting = 9,000,000 RWF | without lighting = 6,000,000 RWF',
  'Screen only: 1,000,000 RWF',
  'Meetings and small events: meeting = 6,000,000 RWF | small event = 2,000,000 RWF',
];

function isBranch(value: unknown): value is Branch {
  return typeof value === 'string' && (Object.values(Branch) as string[]).includes(value);
}

function sanitizeHistory(history: IncomingHistoryItem[] = []) {
  return history
    .filter((item) => (item.role === 'assistant' || item.role === 'user') && typeof item.content === 'string')
    .slice(-12)
    .map((item) => ({ role: item.role as 'assistant' | 'user', content: item.content.trim() }))
    .filter((item) => item.content.length > 0);
}

function normalizeAnswerContent(content: unknown): string {
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    const text = content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part) {
          return typeof part.text === 'string' ? part.text : '';
        }
        return '';
      })
      .join('\n')
      .trim();

    return text;
  }

  return '';
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

function buildDeterministicBranchReply(branch: Branch, rawMessage: string): string | null {
  const message = rawMessage.toLowerCase();
  const branchData = BRANCH_DATA[branch];

  const asksBrandIntro =
    /\bwhat\s+is\s+glad[s]?\b/.test(message) ||
    /\bwho\s+is\s+glad[s]?\b/.test(message) ||
    /\babout\s+glad[s]?\b/.test(message) ||
    /\bwho\s+are\s+you\b/.test(message) ||
    /\bwhat\s+is\s+this\b/.test(message);

  const asksContact = /contact|phone|email|call|whatsapp|reach/.test(message);
  const asksLocation = /location|where|address|map|direction|directions|near/.test(message);
  const asksHallPricing =
    /(hall|event|wedding|concert|screen|live recording|conference hall|meeting room|meeting rooms)/.test(message) &&
    /(price|prices|pricing|rate|rates|rental|cost|how much|fee)/.test(message);
  const asksRoomPrices =
    /(room|rooms|suite|suites|night|accommodation|stay)/.test(message) &&
    /(price|prices|pricing|rate|rates|cost|how much)?/.test(message);
  const asksServices = /service|services|facilities|offer|available/.test(message);

  if (asksBrandIntro) {
    return [
      'GLADS is a modern hospitality and lifestyle company in Rwanda.',
      'It combines accommodation, wellness, dining, and convenience services across three branches: Ndera, Kanombe, and Kabeza.',
      `You are currently on ${branch}. I can give branch-specific prices, services, location, and contacts.`,
    ].join(' ');
  }

  if (asksContact) {
    const manager = BRANCH_MANAGER_CONTACTS[branch];
    return [
      `${branch} contact details:`,
      `- ${manager.managerRole}: ${manager.managerName}`,
      `- Phone: ${manager.phone}`,
      `- Email: ${manager.email}`,
      `Main hotline: +250 788 300 269`,
      `MoMo code: 000488`,
    ].join('\n');
  }

  if (asksLocation) {
    return [
      `${branch} is located at ${branchData.location.address}.`,
      `Legal location reference: ${BRANCH_LEGAL_REFERENCE[branch]}.`,
    ].join(' ');
  }

  if (asksHallPricing) {
    if (branch === Branch.NDERA) {
      return `Ndera hall rental prices:\n- ${NDERA_HALL_PRICES.join('\n- ')}`;
    }

    if (branch === Branch.KANOMBE) {
      return [
        'The published hall rental prices (for example 6,000,000 RWF) are for Ndera only.',
        'Kanombe has a small conference hall, but no fixed hall-pricing sheet is published in the current data.',
        `For Kanombe event pricing, contact ${BRANCH_MANAGER_CONTACTS[Branch.KANOMBE].phone}.`,
      ].join(' ');
    }

    return [
      'The published hall rental prices are for Ndera only.',
      'Kabeza is accommodation-only and does not have hall/event facilities.',
    ].join(' ');
  }

  if (asksServices && !asksRoomPrices) {
    const services = STRICT_BRANCH_SERVICES[branch];
    return `${branch} available services:\n- ${services.join('\n- ')}`;
  }

  if (asksRoomPrices) {
    if (!branchData.rooms.length) {
      return `${branch} does not have listed room pricing in the current data.`;
    }

    const sorted = [...branchData.rooms].sort((a, b) => a.price - b.price);
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];

    if (sorted.length === 1) {
      return `${branch} room price: ${lowest.name} at ${formatCurrency(lowest.price)} per night.`;
    }

    const preview = sorted
      .slice(0, 3)
      .map((room) => `${room.name}: ${formatCurrency(room.price)}/night`)
      .join('\n- ');

    return [
      `${branch} room prices range from ${formatCurrency(lowest.price)} to ${formatCurrency(highest.price)} per night.`,
      `Sample options:\n- ${preview}`,
    ].join('\n');
  }

  return null;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is missing. Configure frontend/.env.local first.' },
      { status: 500 }
    );
  }

  let payload: ChatRequestBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const branch = payload.branch;
  const message = payload.message?.trim();

  if (!isBranch(branch)) {
    return NextResponse.json({ error: 'Invalid or missing branch.' }, { status: 400 });
  }

  if (!message) {
    return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
  }

  const deterministicReply = buildDeterministicBranchReply(branch, message);
  if (deterministicReply) {
    return NextResponse.json({ answer: deterministicReply });
  }

  const history = sanitizeHistory(payload.history);
  const ragContext = buildRagContext(branch, message);
  const legalNote = getLegalBranchNote(branch);

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt = [
    'You are the official GLADS customer assistant.',
    'Use the provided context as the primary source of truth.',
    'Interpret minor typos naturally (for example, treat "glad" as "GLADS" when intent is clear).',
    'If exact detail is missing, provide the closest confirmed info and ask a short clarifying question.',
    'Selected branch is authoritative for branch-specific answers.',
    'Public branch names are Ndera, Kanombe, Kabeza.',
    'Hall rental prices are Ndera-only unless new branch-specific hall pricing is explicitly provided.',
    'Legal-name guidance is mandatory when user asks legal name or legal location.',
    `Selected-branch legal note: ${legalNote}`,
    'If user asks for a service unavailable in selected branch, clearly say unavailable and suggest the correct branch when known.',
    'Keep replies concise, clear, and practical.',
    '',
    ragContext,
  ].join('\n');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map((item) => ({ role: item.role, content: item.content })),
    { role: 'user', content: message },
  ];

  try {
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      return NextResponse.json(
        { error: `OpenAI request failed with status ${openAiResponse.status}.`, details: errorText },
        { status: 502 }
      );
    }

    const completion = await openAiResponse.json();
    let answer = normalizeAnswerContent(completion?.choices?.[0]?.message?.content);

    // Safety-net: avoid overly rigid fallback for obvious GLADS intent.
    if (/do not have confirmed information/i.test(answer) && /\bglad[s]?\b/i.test(message)) {
      answer = [
        'GLADS is a hospitality and lifestyle company in Rwanda with accommodation, wellness, dining, and convenience services.',
        `It operates through Ndera, Kanombe, and Kabeza branches. You are currently asking about ${branch}.`,
      ].join(' ');
    }

    if (!answer) {
      return NextResponse.json(
        { error: 'Assistant response was empty.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Assistant request failed.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
