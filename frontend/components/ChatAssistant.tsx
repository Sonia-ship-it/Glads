import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Branch } from '../types';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  ts: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  activeBranch: Branch;
  branches: Array<{ id: Branch; fullName: string; tagline: string }>;
  onSelectBranch: (branch: Branch) => void;
};

type ChatHistoryItem = {
  role: 'assistant' | 'user';
  content: string;
};

type QuickPrompt = {
  q: string;
  a: string;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

async function fetchAssistantReply(
  branch: Branch,
  message: string,
  history: ChatHistoryItem[]
): Promise<string> {
  const res = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ branch, message, history }),
  });

  if (!res.ok) {
    const fallback = await res.text();
    throw new Error(fallback || 'Assistant service returned an error.');
  }

  const payload = await res.json();
  return payload.answer || 'I could not generate a response. Please try again.';
}

export function ChatAssistant({
  visible,
  onClose,
  activeBranch,
  branches,
  onSelectBranch,
}: Props) {
  const [step, setStep] = useState<'branch' | 'chat'>('branch');
  const [pendingBranch, setPendingBranch] = useState<Branch>(activeBranch);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = useMemo<QuickPrompt[]>(
    () => [
      {
        q: 'How can I contact you?',
        a: 'Branch phone, email, manager contact, and MoMo code.',
      },
      {
        q: 'Show me room prices',
        a: 'See range and sample room rates for this branch.',
      },
      {
        q: 'What services do you have?',
        a: 'Get all facilities available at this selected branch.',
      },
      {
        q: 'Where are you located?',
        a: 'Get branch address and legal location reference.',
      },
    ],
    []
  );

  useEffect(() => {
    if (!visible) return;
    setPendingBranch(activeBranch);
    setStep('branch');
  }, [visible, activeBranch]);

  useEffect(() => {
    if (!visible) return;
    setMessages([
      {
        id: uid(),
        role: 'assistant',
        text: 'Hi! I am GLADS Assistant. First, choose the branch you want to ask about.',
        ts: Date.now(),
      },
    ]);
    setInput('');
    setIsSending(false);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, visible]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const userMsg: Message = { id: uid(), role: 'user', text: trimmed, ts: Date.now() };
    const history: ChatHistoryItem[] = [...messages, userMsg]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const assistantText = await fetchAssistantReply(activeBranch, trimmed, history);
      const assistantMsg: Message = {
        id: uid(),
        role: 'assistant',
        text: assistantText,
        ts: Date.now() + 1,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: Message = {
        id: uid(),
        role: 'assistant',
        text: 'I could not reach the assistant service. Please check configuration and try again.',
        ts: Date.now() + 1,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[170]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute bottom-6 right-6 left-6 md:left-auto md:w-[420px] bg-white dark:bg-neutral-950 rounded-[2rem] shadow-2xl border border-neutral-200 dark:border-white/10 overflow-hidden">
        <div className="p-5 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.35em] text-burgundy">GLADS Assistant</div>
            <div className="text-sm font-bold text-neutral-800 dark:text-white">Ask about rooms, services, and directions</div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-white hover:brightness-95"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div ref={listRef} className="max-h-[55vh] md:max-h-[520px] overflow-y-auto p-5 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={
                  m.role === 'user'
                    ? 'max-w-[85%] bg-burgundy text-white rounded-2xl px-4 py-3 text-sm'
                    : 'max-w-[85%] bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-white rounded-2xl px-4 py-3 text-sm border border-neutral-200 dark:border-white/10'
                }
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 rounded-2xl px-4 py-3 text-sm border border-neutral-200 dark:border-white/10">
                Thinking...
              </div>
            </div>
          )}

          {step === 'branch' && (
            <div className="mt-2 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-white/10 rounded-2xl p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.35em] text-neutral-500 mb-3">Choose Branch</div>
              <div className="grid grid-cols-1 gap-2">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setPendingBranch(b.id)}
                    className={`text-left px-4 py-3 rounded-2xl border transition-all ${
                      pendingBranch === b.id
                        ? 'bg-burgundy text-white border-burgundy'
                        : 'bg-white dark:bg-neutral-950 text-neutral-700 dark:text-white border-neutral-200 dark:border-white/10 hover:bg-neutral-100 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <div className="font-bold text-sm">{b.fullName}</div>
                    <div className={`text-xs ${pendingBranch === b.id ? 'text-white/80' : 'text-neutral-500'}`}>{b.tagline}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onSelectBranch(pendingBranch);
                    setStep('chat');
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: uid(),
                        role: 'assistant',
                        text: `Great. You are asking about ${pendingBranch}. What can I help you with?`,
                        ts: Date.now(),
                      },
                    ]);
                  }}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black rounded-full py-3 text-[11px] font-black uppercase tracking-[0.35em]"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: uid(),
                        role: 'assistant',
                        text: 'You can ask now and switch branch anytime for branch-specific answers.',
                        ts: Date.now(),
                      },
                    ]);
                    setStep('chat');
                  }}
                  className="px-5 rounded-full py-3 text-[11px] font-black uppercase tracking-[0.35em] border border-neutral-200 dark:border-white/10"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {step === 'chat' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {quickPrompts.map((p) => (
                <button
                  key={p.q}
                  type="button"
                  onClick={() => send(p.q)}
                  disabled={isSending}
                  className="text-left px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 hover:brightness-95 disabled:opacity-50"
                >
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-burgundy">Q: {p.q}</div>
                  <div className="text-[10px] text-neutral-600 dark:text-neutral-300 mt-1">A: {p.a}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-neutral-200 dark:border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (step !== 'chat') return;
              void send(input);
            }}
            className="flex items-center gap-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={step === 'chat' ? 'Type your question...' : 'Select branch to start'}
              disabled={step !== 'chat' || isSending}
              className="flex-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 ring-burgundy/40"
            />
            <button
              type="submit"
              disabled={step !== 'chat' || !input.trim() || isSending}
              className="w-12 h-12 rounded-full bg-burgundy text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              aria-label="Send"
            >
              <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function ChatFloatingButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[165] w-16 h-16 rounded-full bg-burgundy shadow-2xl shadow-burgundy/30 border border-burgundy/30 hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] transition-all"
      aria-label="Open chat assistant"
    >
      <div className="w-full h-full grid place-items-center">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h8M8 14h5m9-2c0 4.418-4.03 8-9 8a10.98 10.98 0 01-4-.73L3 20l1.23-3.38A7.94 7.94 0 012 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
    </button>
  );
}
