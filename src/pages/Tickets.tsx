import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, Plus, Clock, CheckCircle2, AlertTriangle, Timer, Search } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button, StatusBadge, Badge } from '@/components/ui/primitives';
import { StatCard } from '@/components/ui/StatCard';
import { Tabs } from '@/components/ui/Tabs';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { BarTrend } from '@/components/charts/Charts';
import { TICKETS, ticketTrend } from '@/data/mock';
import type { Ticket, TicketStatus } from '@/types';
import { ticketTone, severityTone } from '@/lib/status';
import { cn, slaLabel, shortAgo } from '@/lib/utils';

export default function Tickets() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TicketStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  let rows = TICKETS;
  if (tab !== 'all') rows = rows.filter((t) => t.status === tab);
  if (search) rows = rows.filter((t) => t.id.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase()) || t.merchant.toLowerCase().includes(search.toLowerCase()));

  const cols: Column<Ticket>[] = [
    { key: 'id', header: 'Ticket', sortValue: (t) => t.id, render: (t) => <span className="font-mono text-[13px] font-semibold text-brand-600">{t.id}</span> },
    { key: 'priority', header: 'Priority', sortValue: (t) => t.priority, render: (t) => <StatusBadge tone={severityTone(t.priority)} /> },
    { key: 'subject', header: 'Issue', sortValue: (t) => t.subject, render: (t) => (
      <div className="max-w-[240px]"><div className="truncate text-[13px] font-medium text-ink-900">{t.subject}</div><div className="text-2xs text-ink-400">{t.category}</div></div>
    ) },
    { key: 'merchant', header: 'Merchant', render: (t) => <span className="text-[13px] text-ink-600">{t.merchant}</span> },
    { key: 'device', header: 'Device', render: (t) => <span className="font-mono text-xs text-ink-500">{t.deviceId}</span> },
    { key: 'assignee', header: 'Assignee', sortValue: (t) => t.assignee, render: (t) => <span className="text-[13px] text-ink-700">{t.assignee}</span> },
    { key: 'sla', header: 'SLA', sortValue: (t) => t.slaMins, render: (t) => {
      const s = slaLabel(t.slaMins);
      return <span className={cn('inline-flex items-center gap-1 text-xs font-medium tabular-nums', s.breached ? 'text-danger-600' : t.slaMins < 120 ? 'text-warn-600' : 'text-ink-500')}><Timer size={12} /> {s.text}</span>;
    } },
    { key: 'status', header: 'Status', sortValue: (t) => t.status, render: (t) => <StatusBadge tone={ticketTone(t.status)} /> },
    { key: 'created', header: 'Created', align: 'right', sortValue: (t) => t.createdMins, render: (t) => <span className="tabular-nums text-xs text-ink-400">{shortAgo(t.createdMins)} ago</span> },
  ];

  return (
    <div>
      <PageHeader title="Tickets" subtitle="Support requests for merchants and devices — with SLA tracking"
        actions={<Button variant="primary"><Plus size={14} /> New Ticket</Button>} />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Open Tickets" value={128} icon={<LifeBuoy size={15} />} tone="brand" />
        <StatCard label="Avg Resolution" value="6.4h" icon={<Clock size={15} />} tone="default" />
        <StatCard label="SLA Compliance" value="93.2%" icon={<CheckCircle2 size={15} />} tone="ok" />
        <StatCard label="SLA Breached" value={7} icon={<AlertTriangle size={15} />} tone="danger" />
        <StatCard label="Due Today" value={16} icon={<Timer size={15} />} tone="warn" />
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 pt-1">
            <Tabs value={tab} onChange={setTab} tabs={[
              { value: 'all', label: 'All', count: TICKETS.length },
              { value: 'open', label: 'Open', count: TICKETS.filter((t) => t.status === 'open').length },
              { value: 'in_progress', label: 'In Progress', count: TICKETS.filter((t) => t.status === 'in_progress').length },
              { value: 'pending', label: 'Pending', count: TICKETS.filter((t) => t.status === 'pending').length },
              { value: 'resolved', label: 'Resolved', count: TICKETS.filter((t) => t.status === 'resolved').length },
            ]} />
          </div>
          <div className="border-b border-line p-3">
            <div className="relative max-w-xs">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets…" className="h-9 w-full rounded-lg border border-line-strong pl-8 pr-3 text-[13px] outline-none focus-visible:focus-ring" />
            </div>
          </div>
          <DataTable columns={cols} rows={rows} dense pageSize={9} onRowClick={(t) => navigate(`/tickets/${t.id}`)} />
        </Card>

        <Card>
          <CardHeader title="SLA Dashboard" subtitle="Open vs closed · last 14 days" />
          <div className="p-3"><BarTrend height={160} data={ticketTrend()} series={[{ key: 'open', name: 'Open', color: '#D97706' }, { key: 'closed', name: 'Closed', color: '#16A34A' }]} /></div>
          <div className="grid grid-cols-2 divide-x divide-line border-t border-line">
            {[['SLA Compliance', '93.2%', 'text-ok-600'], ['Breaches (7d)', '18', 'text-danger-600'], ['Avg First Response', '22m', 'text-ink-900'], ['Reopened', '4', 'text-warn-600']].map(([l, v, c]) => (
              <div key={l} className="border-b border-line px-3 py-2.5 [&:nth-child(n+3)]:border-b-0"><div className={cn('text-base font-bold tabular-nums', c)}>{v}</div><div className="text-2xs text-ink-500">{l}</div></div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
