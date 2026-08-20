import { useState } from 'react';
import { Drawer } from '@/components/ui/overlay';
import { AlertOctagon, HardDriveDownload, Megaphone, LifeBuoy, Server, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SegmentedControl } from '@/components/ui/primitives';

const NOTIFS = [
  { id: 'n1', cat: 'Critical', icon: AlertOctagon, tone: 'danger', title: '24 devices offline for more than 24 hours', time: '5 min ago' },
  { id: 'n2', cat: 'OTA', icon: HardDriveDownload, tone: 'warn', title: 'Firmware rollout failed on 18 devices', time: '12 min ago' },
  { id: 'n3', cat: 'Campaign', icon: Megaphone, tone: 'ok', title: 'Campaign “Festive Cashback” approved', time: '25 min ago' },
  { id: 'n4', cat: 'Tickets', icon: LifeBuoy, tone: 'warn', title: '7 tickets breached SLA in the last hour', time: '38 min ago' },
  { id: 'n5', cat: 'Critical', icon: AlertOctagon, tone: 'danger', title: 'Tamper alert on NV-SB-087 (Metro Mart)', time: '52 min ago' },
  { id: 'n6', cat: 'System', icon: Server, tone: 'warn', title: 'Job queue backlog building — 18.4k pending', time: '1h ago' },
  { id: 'n7', cat: 'Campaign', icon: Megaphone, tone: 'ok', title: 'Diwali Mega Sale Teaser submitted for approval', time: '2h ago' },
];

const toneMap: Record<string, string> = {
  danger: 'bg-danger-50 text-danger-500',
  warn: 'bg-warn-50 text-warn-600',
  ok: 'bg-ok-50 text-ok-600',
};

export function NotificationDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [filter, setFilter] = useState<'all' | 'Critical' | 'OTA' | 'Campaign' | 'Tickets' | 'System'>('all');
  const list = filter === 'all' ? NOTIFS : NOTIFS.filter((n) => n.cat === filter);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <BellRing size={16} className="text-ink-500" /> Notifications
        </span>
      }
      subtitle="Critical events, OTA, campaigns, tickets & system"
      width="w-[400px]"
      footer={<button className="w-full rounded-lg py-1.5 text-[13px] font-medium text-brand-600 hover:bg-brand-50">Mark all as read</button>}
    >
      <div className="border-b border-line px-3 py-2.5">
        <SegmentedControl
          size="sm"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'Critical', label: 'Critical' },
            { value: 'OTA', label: 'OTA' },
            { value: 'Campaign', label: 'Campaign' },
            { value: 'System', label: 'System' },
          ]}
        />
      </div>
      <div className="divide-y divide-line">
        {list.map((n) => (
          <button key={n.id} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-neutralst-50/60">
            <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', toneMap[n.tone])}>
              <n.icon size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xs font-semibold uppercase tracking-wide text-ink-400">{n.cat}</span>
                <span className="text-2xs text-ink-400">· {n.time}</span>
              </div>
              <p className="mt-0.5 text-[13px] leading-snug text-ink-800">{n.title}</p>
            </div>
          </button>
        ))}
      </div>
    </Drawer>
  );
}
