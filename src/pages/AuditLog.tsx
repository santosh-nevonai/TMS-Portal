import { useState } from 'react';
import { ScrollText, Download, Search, Filter } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Button, Badge } from '@/components/ui/primitives';

const LOGS = [
  { time: '20 Aug 2026, 10:42:13', user: 'Santosh Kumar', role: 'Admin', action: 'Changed volume', entity: 'Device', eid: 'NV-SB-001', ip: '10.20.4.11', before: '50', after: '70' },
  { time: '20 Aug 2026, 10:31:02', user: 'Arjun Reddy', role: 'Campaign Approver', action: 'Campaign approved', entity: 'Campaign', eid: 'CMP-501', ip: '52.66.10.4', before: 'pending', after: 'approved' },
  { time: '20 Aug 2026, 09:58:44', user: 'Vikram Singh', role: 'Operations', action: 'Device blocked', entity: 'Device', eid: 'NV-SB-087', ip: '10.20.4.19', before: 'online', after: 'blocked' },
  { time: '20 Aug 2026, 09:41:20', user: 'Santosh Kumar', role: 'Admin', action: 'User permission changed', entity: 'User', eid: 'anjali.rao', ip: '10.20.4.11', before: 'Support', after: 'Campaign Approver' },
  { time: '20 Aug 2026, 09:15:07', user: 'Rahul Mehta', role: 'Operations', action: 'Merchant mapping updated', entity: 'Device', eid: 'NV-SB-204', ip: '10.20.4.22', before: 'Fresh Point', after: 'Metro Mart' },
  { time: '20 Aug 2026, 02:10:33', user: 'System', role: 'System', action: 'Firmware rollout initiated', entity: 'OTA', eid: 'OTA-341', ip: '—', before: '—', after: 'v2.5.0' },
  { time: '19 Aug 2026, 22:04:11', user: 'Priya Nair', role: 'Operations', action: 'Reboot command sent', entity: 'Device', eid: 'NV-SB-118', ip: '10.20.4.15', before: '—', after: '—' },
  { time: '19 Aug 2026, 18:30:52', user: 'Neha Kapoor', role: 'Support', action: 'Ticket escalated', entity: 'Ticket', eid: 'TKT-9112', ip: '10.20.4.31', before: 'L1', after: 'L2' },
];

export default function AuditLog() {
  const [q, setQ] = useState('');
  const rows = LOGS.filter((l) => !q || l.user.toLowerCase().includes(q.toLowerCase()) || l.action.toLowerCase().includes(q.toLowerCase()) || l.eid.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Immutable record of every state-changing action — who, what, when, before & after"
        meta={<Badge tone="green">Immutable</Badge>}
        actions={<Button variant="secondary"><Download size={14} /> Export</Button>} />

      <Card>
        <div className="flex items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search user, action, entity ID…" className="h-9 w-full rounded-lg border border-line-strong pl-8 pr-3 text-[13px] outline-none focus-visible:focus-ring" />
          </div>
          <Button variant="secondary" size="sm"><Filter size={14} /> Filters</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead><tr className="border-b border-line bg-neutralst-50/80 text-2xs uppercase tracking-wide text-ink-500">{['Timestamp', 'User', 'Role', 'Action', 'Entity', 'IP / Session', 'Before', 'After'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {rows.map((l, i) => (
                <tr key={i} className="hover:bg-neutralst-50/60">
                  <td className="px-3 py-2 font-mono text-2xs text-ink-500">{l.time}</td>
                  <td className="px-3 py-2 font-medium text-ink-900">{l.user}</td>
                  <td className="px-3 py-2"><Badge tone={l.role === 'System' ? 'gray' : l.role === 'Admin' ? 'blue' : 'gray'}>{l.role}</Badge></td>
                  <td className="px-3 py-2 text-ink-800">{l.action}</td>
                  <td className="px-3 py-2"><span className="text-ink-500">{l.entity} · </span><span className="font-mono text-brand-600">{l.eid}</span></td>
                  <td className="px-3 py-2 font-mono text-2xs text-ink-400">{l.ip}</td>
                  <td className="px-3 py-2 font-mono text-2xs text-ink-500">{l.before}</td>
                  <td className="px-3 py-2 font-mono text-2xs font-medium text-ink-900">{l.after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
