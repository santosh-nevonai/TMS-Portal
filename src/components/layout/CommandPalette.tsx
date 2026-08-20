import { useEffect, useMemo, useState } from 'react';
import { Search, Cpu, Store, LifeBuoy, Megaphone, CornerDownLeft, ArrowRight } from 'lucide-react';
import { DEVICES, MERCHANTS, TICKETS, CAMPAIGNS } from '@/data/mock';
import { NAV } from '@/config/nav';
import { cn } from '@/lib/utils';

interface Result {
  id: string;
  label: string;
  sub: string;
  to: string;
  icon: React.ElementType;
  group: string;
}

export function CommandPalette({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (to: string) => void }) {
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (open) {
      setQ('');
      setActive(0);
    }
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const query = q.trim().toLowerCase();
    const out: Result[] = [];
    if (!query) {
      NAV.flatMap((s) => s.items).slice(0, 6).forEach((i) =>
        out.push({ id: i.to, label: i.label, sub: 'Navigate', to: i.to, icon: i.icon, group: 'Pages' }),
      );
      return out;
    }
    DEVICES.filter((d) => d.id.toLowerCase().includes(query) || d.serial.toLowerCase().includes(query) || d.imei.includes(query) || d.merchant.toLowerCase().includes(query))
      .slice(0, 5)
      .forEach((d) => out.push({ id: d.id, label: d.id, sub: `${d.serial} · ${d.merchant}`, to: `/devices/${d.id}`, icon: Cpu, group: 'Devices' }));
    MERCHANTS.filter((m) => m.name.toLowerCase().includes(query) || m.id.toLowerCase().includes(query))
      .slice(0, 4)
      .forEach((m) => out.push({ id: m.id, label: m.name, sub: `${m.id} · ${m.region}`, to: `/merchants/${m.id}`, icon: Store, group: 'Merchants' }));
    TICKETS.filter((t) => t.id.toLowerCase().includes(query) || t.subject.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach((t) => out.push({ id: t.id, label: t.id, sub: t.subject, to: `/tickets`, icon: LifeBuoy, group: 'Tickets' }));
    CAMPAIGNS.filter((c) => c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach((c) => out.push({ id: c.id, label: c.name, sub: c.id, to: `/campaigns`, icon: Megaphone, group: 'Campaigns' }));
    NAV.flatMap((s) => s.items)
      .filter((i) => i.label.toLowerCase().includes(query))
      .slice(0, 4)
      .forEach((i) => out.push({ id: i.to, label: i.label, sub: 'Page', to: i.to, icon: i.icon, group: 'Pages' }));
    return out;
  }, [q]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      }
      if (e.key === 'Enter' && results[active]) {
        onNavigate(results[active].to);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, results, active, onClose, onNavigate]);

  if (!open) return null;

  let lastGroup = '';
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]">
      <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-xl border border-line bg-white shadow-pop animate-fade-in">
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search size={17} className="text-ink-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            placeholder="Search devices, serial, IMEI, merchants, tickets, campaigns…"
            className="h-12 w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-400"
          />
          <kbd className="rounded border border-line-strong bg-neutralst-50 px-1.5 py-0.5 text-2xs text-ink-400">Esc</kbd>
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <div className="px-3 py-8 text-center text-[13px] text-ink-500">No matches for “{q}”</div>
          )}
          {results.map((r, i) => {
            const showGroup = r.group !== lastGroup;
            lastGroup = r.group;
            return (
              <div key={`${r.group}-${r.id}-${i}`}>
                {showGroup && <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-ink-400">{r.group}</div>}
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    onNavigate(r.to);
                    onClose();
                  }}
                  className={cn('flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left', active === i ? 'bg-brand-50' : 'hover:bg-neutralst-50')}
                >
                  <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', active === i ? 'bg-brand-100 text-brand-700' : 'bg-neutralst-100 text-ink-500')}>
                    <r.icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-ink-900">{r.label}</div>
                    <div className="truncate text-2xs text-ink-500">{r.sub}</div>
                  </div>
                  {active === i ? <CornerDownLeft size={14} className="text-brand-500" /> : <ArrowRight size={13} className="text-ink-300" />}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 border-t border-line bg-canvas/60 px-4 py-2 text-2xs text-ink-400">
          <span className="flex items-center gap-1"><kbd className="rounded border border-line-strong bg-white px-1">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="rounded border border-line-strong bg-white px-1">↵</kbd> open</span>
        </div>
      </div>
    </div>
  );
}
