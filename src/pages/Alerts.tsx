import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BellRing, Plus, AlertOctagon, TriangleAlert, Info, CircleDot, Mail, MessageSquare, Webhook, Smartphone } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Button, StatusBadge, Badge } from '@/components/ui/primitives';
import { Tabs } from '@/components/ui/Tabs';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/overlay';
import { ALERTS } from '@/data/mock';
import type { Alert, Severity } from '@/types';
import { severityTone } from '@/lib/status';
import { cn, shortAgo } from '@/lib/utils';

const SEV_ICON = { critical: AlertOctagon, high: TriangleAlert, medium: Info, low: CircleDot };

export default function Alerts() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'open' | 'acknowledged' | 'resolved' | 'all'>('open');
  const [ruleOpen, setRuleOpen] = useState(false);
  const sevParam = params.get('severity') as Severity | null;

  let rows = ALERTS;
  if (tab !== 'all') rows = rows.filter((a) => a.status === tab);
  if (sevParam) rows = rows.filter((a) => a.severity === sevParam);

  const counts = {
    critical: ALERTS.filter((a) => a.severity === 'critical').length,
    high: ALERTS.filter((a) => a.severity === 'high').length,
    medium: ALERTS.filter((a) => a.severity === 'medium').length,
    low: ALERTS.filter((a) => a.severity === 'low').length,
  };

  const cols: Column<Alert>[] = [
    { key: 'severity', header: 'Severity', sortValue: (a) => a.severity, render: (a) => {
      const Icon = SEV_ICON[a.severity]; const t = severityTone(a.severity);
      return <span className={cn('inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-2xs font-medium', t.bg, t.text, t.border)}><Icon size={12} /> {t.label}</span>;
    } },
    { key: 'title', header: 'Alert', sortValue: (a) => a.type, render: (a) => (
      <div className="max-w-[240px]"><div className="text-[13px] font-medium text-ink-900">{a.type}</div><div className="truncate text-2xs text-ink-500">{a.title}</div></div>
    ) },
    { key: 'device', header: 'Device', render: (a) => <button onClick={(e) => { e.stopPropagation(); navigate(`/devices/${a.deviceId}`); }} className="font-mono text-xs font-medium text-brand-600 hover:underline">{a.deviceId}</button> },
    { key: 'merchant', header: 'Merchant', render: (a) => <span className="text-[13px] text-ink-600">{a.merchant}</span> },
    { key: 'region', header: 'Region', sortValue: (a) => a.region, render: (a) => <span className="text-[13px] text-ink-600">{a.region}</span> },
    { key: 'duration', header: 'Duration', align: 'right', sortValue: (a) => a.durationMins, render: (a) => <span className="tabular-nums text-xs text-ink-500">{shortAgo(a.durationMins)}</span> },
    { key: 'assigned', header: 'Assigned', render: (a) => a.assignedTo ? <span className="text-[13px] text-ink-700">{a.assignedTo}</span> : <span className="text-2xs text-ink-400">Unassigned</span> },
    { key: 'status', header: 'Status', sortValue: (a) => a.status, render: (a) => <Badge tone={a.status === 'open' ? 'red' : a.status === 'acknowledged' ? 'amber' : 'green'}>{a.status}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Alert Center" subtitle="Operational alerts across the fleet — offline, battery, tamper, connectivity & more"
        actions={<Button variant="primary" onClick={() => setRuleOpen(true)}><Plus size={14} /> New Alert Rule</Button>} />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(['critical', 'high', 'medium', 'low'] as Severity[]).map((s) => {
          const Icon = SEV_ICON[s]; const t = severityTone(s);
          return (
            <Card key={s} className="flex items-center gap-3 px-4 py-3">
              <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', t.bg, t.text)}><Icon size={18} /></span>
              <div><div className="text-2xl font-bold tabular-nums text-ink-900">{counts[s]}</div><div className="text-2xs font-medium capitalize text-ink-500">{s}</div></div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="px-3 pt-1"><Tabs value={tab} onChange={setTab} tabs={[
          { value: 'open', label: 'Open', count: ALERTS.filter((a) => a.status === 'open').length },
          { value: 'acknowledged', label: 'Acknowledged', count: ALERTS.filter((a) => a.status === 'acknowledged').length },
          { value: 'resolved', label: 'Resolved', count: ALERTS.filter((a) => a.status === 'resolved').length },
          { value: 'all', label: 'All', count: ALERTS.length },
        ]} /></div>
        <DataTable columns={cols} rows={rows} dense pageSize={12} />
      </Card>

      <AlertRuleBuilder open={ruleOpen} onClose={() => setRuleOpen(false)} />
    </div>
  );
}

function AlertRuleBuilder({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="New Alert Rule" subtitle="Trigger alerts and notifications automatically when conditions are met" size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={onClose}>Create Rule</Button></>}>
      <div className="space-y-3">
        <RuleRow keyword="WHEN" color="bg-brand-50 text-brand-700">
          <Select options={['Battery %', 'Signal strength', 'Offline duration', 'Command failures', 'Temperature']} />
        </RuleRow>
        <RuleRow keyword="IS BELOW" color="bg-neutralst-100 text-ink-700">
          <input defaultValue="20" className="h-9 w-24 rounded-lg border border-line-strong px-2.5 text-sm outline-none focus-visible:focus-ring" />
          <span className="text-sm text-ink-500">%</span>
        </RuleRow>
        <RuleRow keyword="FOR" color="bg-neutralst-100 text-ink-700">
          <input defaultValue="30" className="h-9 w-24 rounded-lg border border-line-strong px-2.5 text-sm outline-none focus-visible:focus-ring" />
          <Select options={['minutes', 'hours', 'days']} />
        </RuleRow>
        <RuleRow keyword="THEN" color="bg-warn-50 text-warn-700">
          <Select options={['Create Critical Alert', 'Create High Alert', 'Create Medium Alert']} />
        </RuleRow>

        <div className="rounded-lg border border-line p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Notify via</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[{ icon: Mail, label: 'Email', on: true }, { icon: MessageSquare, label: 'SMS', on: true }, { icon: Smartphone, label: 'Push', on: false }, { icon: Webhook, label: 'Webhook', on: true }].map((c) => (
              <label key={c.label} className={cn('flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-[13px]', c.on ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-line text-ink-600')}>
                <input type="checkbox" defaultChecked={c.on} className="h-3.5 w-3.5 rounded border-line-strong text-brand-600" />
                <c.icon size={14} /> {c.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
function RuleRow({ keyword, color, children }: { keyword: string; color: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn('w-24 shrink-0 rounded-md px-2 py-1 text-center text-2xs font-bold uppercase tracking-wide', color)}>{keyword}</span>
      <div className="flex flex-1 items-center gap-2">{children}</div>
    </div>
  );
}
function Select({ options }: { options: string[] }) {
  return (
    <select className="h-9 flex-1 rounded-lg border border-line-strong bg-white px-2.5 text-sm text-ink-800 outline-none focus-visible:focus-ring">
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}
