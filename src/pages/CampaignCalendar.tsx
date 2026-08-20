import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Button, SegmentedControl } from '@/components/ui/primitives';
import { cn } from '@/lib/utils';

// Campaign timeline blocks laid across August 2026.
const BLOCKS = [
  { name: 'Festive Cashback', start: 15, end: 22, row: 0, color: 'bg-brand-500' },
  { name: 'UPI Autopay Awareness', start: 12, end: 25, row: 1, color: 'bg-ok-500' },
  { name: 'Monsoon Merchant Offer', start: 14, end: 21, row: 2, color: 'bg-warn-500' },
  { name: 'I-Day Greetings', start: 15, end: 15, row: 3, color: 'bg-[#9333EA]' },
  { name: 'Tamil New Merchant Drive', start: 24, end: 30, row: 0, color: 'bg-info-500' },
  { name: 'Karnataka Loyalty', start: 28, end: 31, row: 1, color: 'bg-danger-500' },
];

export default function CampaignCalendar() {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const firstDay = 5; // Aug 1 2026 is a Saturday-ish; simplified
  const days = 31;
  const cells = Array.from({ length: firstDay + days }, (_, i) => (i < firstDay ? null : i - firstDay + 1));

  return (
    <div>
      <PageHeader title="Campaign Calendar" subtitle="Visualise campaign schedules and avoid overlap conflicts — August 2026"
        actions={<>
          <SegmentedControl value={view} onChange={setView} options={[{ value: 'month', label: 'Month' }, { value: 'week', label: 'Week' }, { value: 'day', label: 'Day' }]} />
          <Button variant="primary"><Plus size={14} /> Create Campaign</Button>
        </>} />

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-1">
            <button className="rounded-lg border border-line-strong p-1.5 text-ink-500 hover:bg-neutralst-50"><ChevronLeft size={16} /></button>
            <button className="rounded-lg border border-line-strong p-1.5 text-ink-500 hover:bg-neutralst-50"><ChevronRight size={16} /></button>
            <span className="ml-2 text-sm font-semibold text-ink-900">August 2026</span>
          </div>
          <div className="flex items-center gap-3 text-2xs text-ink-500">
            {[['bg-brand-500', 'Promotion'], ['bg-ok-500', 'Awareness'], ['bg-warn-500', 'Regional'], ['bg-[#9333EA]', 'Override']].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1"><span className={cn('h-2 w-2 rounded-sm', c)} /> {l}</span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 border-b border-line bg-neutralst-50 text-2xs font-semibold uppercase tracking-wide text-ink-500">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d} className="px-2 py-2 text-center">{d}</div>)}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const week = Math.floor(i / 7);
            const dow = i % 7;
            return (
              <div key={i} className={cn('relative min-h-[92px] border-b border-r border-line p-1.5', dow === 0 && 'border-l', day === 20 && 'bg-brand-50/40')}>
                {day && <span className={cn('text-xs font-medium', day === 20 ? 'flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white' : 'text-ink-500')}>{day}</span>}
                {/* Render blocks that start on this day */}
                <div className="mt-1 space-y-1">
                  {day && BLOCKS.filter((b) => b.start === day).map((b) => {
                    const span = Math.min(b.end - b.start + 1, 7 - dow);
                    return (
                      <div key={b.name} className={cn('truncate rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm', b.color)}
                        style={{ width: `calc(${span * 100}% + ${(span - 1) * 0.75}rem)` }}>
                        {b.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
