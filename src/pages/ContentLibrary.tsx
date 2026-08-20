import { useState } from 'react';
import { Music, Upload, Play, Pause, Search, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Button, Badge, StatusBadge } from '@/components/ui/primitives';
import { AUDIO_ASSETS } from '@/data/mock';
import { cn, durationSec } from '@/lib/utils';

export default function ContentLibrary() {
  const [playing, setPlaying] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const rows = AUDIO_ASSETS.filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Content Library" subtitle="Audio assets for announcement campaigns — awaiting or approved for use"
        actions={<Button variant="primary"><Upload size={14} /> Upload Audio</Button>} />

      <Card>
        <div className="flex items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search audio…" className="h-9 w-full rounded-lg border border-line-strong pl-8 pr-3 text-[13px] outline-none focus-visible:focus-ring" />
          </div>
          <Button variant="secondary" size="sm"><Filter size={14} /> Filters</Button>
        </div>

        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((a) => {
            const isPlaying = playing === a.id;
            return (
              <div key={a.id} className="rounded-lg border border-line p-3.5 transition-all hover:border-line-strong hover:shadow-card">
                <div className="flex items-start justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Music size={17} /></span>
                  <StatusBadge tone={a.status === 'approved' ? { dot: 'bg-ok-500', text: 'text-ok-700', bg: 'bg-ok-50', border: 'border-ok-100', label: 'Approved' } : a.status === 'pending' ? { dot: 'bg-warn-500', text: 'text-warn-700', bg: 'bg-warn-50', border: 'border-warn-100', label: 'Pending' } : { dot: 'bg-danger-500', text: 'text-danger-700', bg: 'bg-danger-50', border: 'border-danger-100', label: 'Rejected' }} />
                </div>
                <div className="mt-2.5 text-[13px] font-semibold text-ink-900">{a.name}</div>
                <div className="mt-0.5 flex items-center gap-1.5 text-2xs text-ink-400"><Badge>{a.language}</Badge><Badge>{a.category}</Badge></div>

                {/* Audio player */}
                <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-neutralst-50 px-2.5 py-2">
                  <button onClick={() => setPlaying(isPlaying ? null : a.id)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700">
                    {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-neutralst-200">
                      <div className={cn('h-full rounded-full bg-brand-500 transition-all', isPlaying ? 'w-2/3 duration-[3000ms]' : 'w-0')} />
                    </div>
                    <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-400"><span>0:00</span><span>{durationSec(a.durationSec)}</span></div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-2xs text-ink-400">
                  <span>{(a.sizeKb / 1024).toFixed(2)} MB</span>
                  <span>{a.uploadedBy}</span>
                  <span>{a.created}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
