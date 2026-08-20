import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Plus, Search, Zap, Pin, Cpu, ArrowRight, Megaphone, HardDriveDownload, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Button, Badge, StatusBadge, Progress } from '@/components/ui/primitives';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/overlay';
import { DEVICE_GROUPS } from '@/data/mock';
import type { DeviceGroup } from '@/types';
import { cn, fmt, pct, shortAgo } from '@/lib/utils';

export default function DeviceGroups() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const rows = DEVICE_GROUPS.filter((g) => !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.id.toLowerCase().includes(search.toLowerCase()));

  const totalDevices = DEVICE_GROUPS.reduce((a, g) => a + g.devices, 0);

  return (
    <div>
      <PageHeader title="Device Groups" subtitle="Logical cohorts of devices used to target campaigns and firmware rollouts"
        actions={<Button variant="primary" onClick={() => setCreateOpen(true)}><Plus size={14} /> Create Group</Button>} />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Groups" value={DEVICE_GROUPS.length} icon={<Layers size={15} />} tone="brand" />
        <StatCard label="Dynamic" value={DEVICE_GROUPS.filter((g) => g.type === 'dynamic').length} icon={<Zap size={15} />} tone="warn" />
        <StatCard label="Static" value={DEVICE_GROUPS.filter((g) => g.type === 'static').length} icon={<Pin size={15} />} tone="default" />
        <StatCard label="Devices Grouped" value={totalDevices} icon={<Cpu size={15} />} tone="ok" />
      </div>

      <Card>
        <div className="flex items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search groups…" className="h-9 w-full rounded-lg border border-line-strong pl-8 pr-3 text-[13px] outline-none focus-visible:focus-ring" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((g) => <GroupCard key={g.id} g={g} onOpen={() => navigate(`/devices?group=${g.id}`)} />)}
        </div>
      </Card>

      <CreateGroupModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}

function GroupCard({ g, onOpen }: { g: DeviceGroup; onOpen: () => void }) {
  const onlinePct = (g.online / g.devices) * 100;
  return (
    <div className="group flex flex-col rounded-lg border border-line p-3.5 transition-all hover:border-line-strong hover:shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', g.type === 'dynamic' ? 'bg-warn-50 text-warn-600' : 'bg-brand-50 text-brand-600')}>
            {g.type === 'dynamic' ? <Zap size={16} /> : <Pin size={16} />}
          </span>
          <div>
            <div className="text-[13px] font-semibold text-ink-900">{g.name}</div>
            <div className="font-mono text-2xs text-ink-400">{g.id}</div>
          </div>
        </div>
        <Badge tone={g.type === 'dynamic' ? 'amber' : 'blue'}>{g.type === 'dynamic' ? 'Dynamic' : 'Static'}</Badge>
      </div>

      <p className="mt-2.5 text-xs leading-snug text-ink-500">{g.description}</p>
      {g.criteria && (
        <div className="mt-2 inline-flex w-fit items-center gap-1 rounded-md bg-neutralst-50 px-2 py-1 font-mono text-2xs text-ink-600"><Filter size={11} /> {g.criteria}</div>
      )}

      <div className="mt-3 flex items-end justify-between">
        <div>
          <div className="text-xl font-bold tabular-nums text-ink-900">{fmt(g.devices)}</div>
          <div className="text-2xs text-ink-400">devices · {g.scope}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold tabular-nums text-ok-600">{pct(onlinePct)}</div>
          <div className="text-2xs text-ink-400">online</div>
        </div>
      </div>
      <Progress value={onlinePct} tone="ok" size="sm" className="mt-2" />

      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5 text-2xs text-ink-400">
        <span className="flex items-center gap-2">
          <span>Used in {g.usedIn}</span>
          <span className="flex items-center gap-0.5"><Megaphone size={11} /><HardDriveDownload size={11} /></span>
        </span>
        <button onClick={onOpen} className="flex items-center gap-0.5 font-medium text-brand-600 hover:underline">View devices <ArrowRight size={12} /></button>
      </div>
    </div>
  );
}

function CreateGroupModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState<'static' | 'dynamic'>('static');
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Create Device Group" subtitle="Group devices to target campaigns and firmware rollouts"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={onClose}>Create Group</Button></>}>
      <div className="space-y-3">
        <div><label className="text-[13px] font-medium text-ink-700">Group name</label><input placeholder="e.g. Diwali Campaign Cohort" className="inp2 mt-1" /></div>
        <div><label className="text-[13px] font-medium text-ink-700">Description</label><input placeholder="Short description of this group" className="inp2 mt-1" /></div>

        <div>
          <label className="text-[13px] font-medium text-ink-700">Membership type</label>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {([['static', Pin, 'Static', 'Manually select a fixed set of devices'], ['dynamic', Zap, 'Dynamic', 'Auto-updates from filter criteria']] as const).map(([val, Icon, label, desc]) => (
              <button key={val} onClick={() => setType(val)} className={cn('flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left', type === val ? 'border-brand-400 bg-brand-50' : 'border-line hover:bg-neutralst-50')}>
                <Icon size={16} className={type === val ? 'text-brand-600' : 'text-ink-400'} />
                <div><div className="text-[13px] font-semibold text-ink-900">{label}</div><div className="text-xs text-ink-500">{desc}</div></div>
              </button>
            ))}
          </div>
        </div>

        {type === 'dynamic' ? (
          <div className="rounded-lg border border-line p-3">
            <div className="mb-2 text-2xs font-semibold uppercase tracking-wide text-ink-500">Match criteria</div>
            <div className="grid grid-cols-3 gap-2">
              <select className="inp2"><option>SKU</option><option>Region</option><option>Battery %</option><option>Firmware</option><option>Status</option></select>
              <select className="inp2"><option>is</option><option>is not</option><option>below</option><option>above</option></select>
              <input placeholder="NV-SBPRO-4G-STD" className="inp2 font-mono" />
            </div>
            <div className="mt-2 rounded-md bg-brand-50 px-3 py-2 text-[13px] text-brand-700">Matches <span className="font-bold">9,240 devices</span> now — membership refreshes automatically.</div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line p-4 text-center text-[13px] text-ink-500">
            Select devices from the device list, or import by Device ID / serial. <span className="font-medium text-brand-600">0 devices selected.</span>
          </div>
        )}
      </div>
      <style>{`.inp2{height:36px;width:100%;border:1px solid #D6DBE1;border-radius:8px;padding:0 10px;font-size:13px;outline:none}.inp2:focus{box-shadow:0 0 0 2px rgba(46,91,230,.35)}`}</style>
    </Modal>
  );
}
