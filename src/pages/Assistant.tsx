import { useEffect, useRef, useState } from 'react';
import {
  Sparkles, Send, Cpu, BellRing, LifeBuoy, Megaphone, HardDriveDownload,
  Battery, MapPin, Gauge, RotateCcw, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';
import { ASSISTANT, SUGGESTED_PROMPTS, sendAssistantMessage, type ChatMessage } from '@/services/assistant';

const PROMPT_ICONS = [Gauge, Cpu, BellRing, Battery, LifeBuoy, Megaphone, HardDriveDownload, MapPin];
let idc = 0;
const uid = () => `m${Date.now()}-${idc++}`;

export default function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: trimmed, ts: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setBusy(true);
    const reply = await sendAssistantMessage(history);
    setMessages((m) => [...m, { id: uid(), role: 'assistant', content: reply, ts: Date.now() }]);
    setBusy(false);
    taRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-3xl flex-col">
      {/* Page heading */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <Sparkles size={20} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-ink-900">{ASSISTANT.name}</h1>
              <span className="rounded-md bg-brand-50 px-1.5 py-0.5 text-2xs font-semibold text-brand-700 ring-1 ring-brand-100">Preview</span>
            </div>
            <p className="text-[13px] text-ink-500">{ASSISTANT.tagline}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="secondary" size="sm" onClick={() => setMessages([])}><RotateCcw size={13} /> New chat</Button>
        )}
      </div>

      {/* Preview notice */}
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-brand-100 bg-brand-50/60 px-3 py-2 text-2xs text-brand-700">
        <Info size={14} className="shrink-0" />
        Powered by Claude (Anthropic) — integration pending. Responses are simulated from your live fleet data for this preview.
      </div>

      {/* Chat surface */}
      <div className="card flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {empty ? (
            <EmptyState onPick={send} />
          ) : (
            <div className="space-y-5">
              {messages.map((m) => <Bubble key={m.id} msg={m} />)}
              {busy && <Typing />}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-line bg-canvas/40 p-3">
          {!empty && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTED_PROMPTS.slice(0, 4).map((p) => (
                <button key={p.label} onClick={() => send(p.prompt)} disabled={busy}
                  className="rounded-full border border-line bg-white px-2.5 py-1 text-2xs font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:opacity-50">
                  {p.label}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2 rounded-xl border border-line-strong bg-white p-2 focus-within:ring-2 focus-within:ring-brand-500/30">
            <textarea
              ref={taRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask about devices, alerts, tickets, campaigns…"
              className="max-h-32 flex-1 resize-none bg-transparent px-1.5 py-1 text-[13px] text-ink-900 outline-none placeholder:text-ink-400"
            />
            <Button variant="primary" size="sm" disabled={!input.trim() || busy} onClick={() => send(input)}>
              <Send size={14} /> Send
            </Button>
          </div>
          <p className="mt-1.5 px-1 text-[10px] text-ink-400">
            NevonAI can make mistakes. Verify critical actions before executing. Enter to send · Shift+Enter for a new line.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-6 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-card">
        <Sparkles size={26} />
      </span>
      <h2 className="text-lg font-bold text-ink-900">How can I help with your fleet?</h2>
      <p className="mt-1 max-w-md text-[13px] text-ink-500">
        Ask about device health, alerts, tickets, campaigns, or firmware rollouts. I read from live fleet data and can draft actions for you.
      </p>
      <div className="mt-6 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((p, i) => {
          const Icon = PROMPT_ICONS[i % PROMPT_ICONS.length];
          return (
            <button key={p.label} onClick={() => onPick(p.prompt)}
              className="group flex items-start gap-2.5 rounded-lg border border-line bg-white px-3 py-2.5 text-left transition-all hover:border-brand-300 hover:shadow-card">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-100">
                <Icon size={15} />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-ink-900">{p.label}</div>
                <div className="text-2xs text-ink-500">{p.prompt}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow-sm',
        isUser ? 'bg-navy-700' : 'bg-gradient-to-br from-brand-500 to-brand-700')}>
        {isUser ? <span className="text-2xs font-bold">You</span> : <Sparkles size={16} />}
      </span>
      <div className={cn('max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
        isUser ? 'bg-brand-600 text-white' : 'border border-line bg-white text-ink-800')}>
        <MessageContent text={msg.content} light={isUser} />
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
        <Sparkles size={16} />
      </span>
      <div className="flex items-center gap-1 rounded-2xl border border-line bg-white px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-300" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

// Minimal markdown: **bold**, "- " bullets, blank-line spacing.
function MessageContent({ text, light }: { text: string; light?: boolean }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: string) => {
    if (list.length) {
      blocks.push(
        <ul key={key} className="my-1 space-y-1 pl-1">
          {list.map((li, i) => (
            <li key={i} className="flex gap-2">
              <span className={cn('mt-1.5 h-1 w-1 shrink-0 rounded-full', light ? 'bg-brand-200' : 'bg-brand-400')} />
              <span>{renderInline(li)}</span>
            </li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  lines.forEach((ln, i) => {
    if (ln.startsWith('- ')) {
      list.push(ln.slice(2));
    } else {
      flush(`l${i}`);
      if (ln.trim() === '') blocks.push(<div key={`s${i}`} className="h-2" />);
      else blocks.push(<p key={`p${i}`}>{renderInline(ln)}</p>);
    }
  });
  flush('lend');
  return <div>{blocks}</div>;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>,
  );
}
