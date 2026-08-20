import { Plug, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button, Badge, StatusBadge } from '@/components/ui/primitives';
import { StatCard } from '@/components/ui/StatCard';
import { cn } from '@/lib/utils';

const INTEGRATIONS = [
  { name: 'Airtel Payments Bank', desc: 'Merchant master, KYC & mapping sync', status: 'operational', last: '6 min ago' },
  { name: 'MQTT / IoT Gateway', desc: 'Device telemetry & command channel', status: 'operational', last: '2 sec ago' },
  { name: 'SMS Gateway (Kaleyra)', desc: 'Alert & OTP delivery', status: 'operational', last: '1 min ago' },
  { name: 'Email (Amazon SES)', desc: 'Notifications & reports', status: 'operational', last: '3 min ago' },
  { name: 'Payment Webhooks', desc: 'Transaction confirmation feed', status: 'degraded', last: '14 min ago' },
  { name: 'Object Storage (S3)', desc: 'Audio assets & firmware binaries', status: 'operational', last: '5 min ago' },
];

const MISMATCHES = [
  { id: 'APB100411', airtel: 'Sharma General Store', dash: 'Sharma Genral Store', issue: 'Name mismatch', res: 'Auto-resolvable' },
  { id: 'APB100822', airtel: 'Grocery', dash: 'Kirana', issue: 'Category mismatch', res: 'Review' },
  { id: 'APB101233', airtel: 'Active', dash: 'Suspended', issue: 'Status mismatch', res: 'Manual' },
];

export default function Integrations() {
  return (
    <div>
      <PageHeader title="Integrations" subtitle="Connected systems, sync status and data reconciliation"
        actions={<Button variant="primary"><RefreshCw size={14} /> Sync Now</Button>} />

      {/* Airtel sync panel */}
      <Card className="mb-3">
        <CardHeader title="Airtel Payments Bank — Merchant Sync" subtitle="Last reconciliation with Airtel merchant systems" icon={<Plug size={15} />}
          action={<StatusBadge tone={{ dot: 'bg-ok-500', text: 'text-ok-700', bg: 'bg-ok-50', border: 'border-ok-100', label: 'Connected' }} pulse />} />
        <div className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-3 lg:grid-cols-6">
          {[['Last Sync', '6 min ago', 'text-ink-900'], ['Records Processed', '4,820', 'text-ink-900'], ['New Merchants', '12', 'text-ok-600'], ['Updated', '38', 'text-info-600'], ['Failed', '2', 'text-danger-600'], ['Mismatches', '3', 'text-warn-600']].map(([l, v, c]) => (
            <div key={l} className="px-4 py-3"><div className={cn('text-xl font-bold tabular-nums', c)}>{v}</div><div className="text-2xs text-ink-500">{l}</div></div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader title="Connected Systems" />
          <div className="divide-y divide-line">
            {INTEGRATIONS.map((s) => (
              <div key={s.name} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutralst-100 text-ink-500"><Plug size={16} /></span>
                <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold text-ink-900">{s.name}</div><div className="text-2xs text-ink-400">{s.desc}</div></div>
                <span className="hidden text-2xs text-ink-400 sm:block">{s.last}</span>
                <StatusBadge tone={s.status === 'operational' ? { dot: 'bg-ok-500', text: 'text-ok-700', bg: 'bg-ok-50', border: 'border-ok-100', label: 'Operational' } : { dot: 'bg-warn-500', text: 'text-warn-700', bg: 'bg-warn-50', border: 'border-warn-100', label: 'Degraded' }} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Data Mismatches" subtitle="Records requiring reconciliation with Airtel" action={<Badge tone="amber">{MISMATCHES.length} open</Badge>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[13px]">
              <thead><tr className="border-b border-line bg-neutralst-50/80 text-2xs uppercase tracking-wide text-ink-500">{['Merchant ID', 'Airtel', 'Dashboard', 'Issue', 'Resolution'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">
                {MISMATCHES.map((m) => (
                  <tr key={m.id} className="hover:bg-neutralst-50/60">
                    <td className="px-3 py-2 font-mono text-brand-600">{m.id}</td>
                    <td className="px-3 py-2 text-ink-800">{m.airtel}</td>
                    <td className="px-3 py-2 text-ink-600">{m.dash}</td>
                    <td className="px-3 py-2"><span className="flex items-center gap-1 text-warn-700"><AlertTriangle size={12} /> {m.issue}</span></td>
                    <td className="px-3 py-2"><Badge tone={m.res === 'Auto-resolvable' ? 'green' : m.res === 'Review' ? 'amber' : 'red'}>{m.res}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
