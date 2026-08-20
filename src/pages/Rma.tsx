import { Wrench, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button, Badge } from '@/components/ui/primitives';
import { StatCard } from '@/components/ui/StatCard';
import { RMA_ITEMS } from '@/data/mock';
import type { RmaStage } from '@/types';
import { cn } from '@/lib/utils';

const STAGES: { key: RmaStage; label: string }[] = [
  { key: 'fault_reported', label: 'Fault Reported' },
  { key: 'received', label: 'Device Received' },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'repair', label: 'Repair' },
  { key: 'refurbished', label: 'Refurbished' },
  { key: 'ready', label: 'Ready for Dispatch' },
];

export default function Rma() {
  const byStage = (s: RmaStage) => RMA_ITEMS.filter((r) => r.stage === s);
  const stageIndex = (s: RmaStage) => STAGES.findIndex((x) => x.key === s);

  return (
    <div>
      <PageHeader title="RMA / Refurbishment" subtitle="Track faulty devices through repair and refurbishment to redeployment"
        actions={<Button variant="primary"><Plus size={14} /> New RMA</Button>} />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Open RMAs" value={RMA_ITEMS.length} icon={<Wrench size={15} />} tone="brand" />
        <StatCard label="In Repair" value={byStage('repair').length + byStage('diagnosis').length} tone="warn" />
        <StatCard label="Ready to Dispatch" value={byStage('ready').length} tone="ok" />
        <StatCard label="Avg Turnaround" value="6.2 days" tone="default" />
      </div>

      {/* Kanban board */}
      <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {STAGES.map((stage, si) => {
          const items = byStage(stage.key);
          return (
            <div key={stage.key} className="flex flex-col rounded-lg border border-line bg-neutralst-50/40">
              <div className="flex items-center justify-between border-b border-line px-3 py-2">
                <span className="text-xs font-semibold text-ink-700">{stage.label}</span>
                <span className="rounded-full bg-white px-1.5 text-2xs font-semibold text-ink-500">{items.length}</span>
              </div>
              <div className="flex-1 space-y-2 p-2">
                {items.slice(0, 4).map((r) => (
                  <div key={r.id} className="rounded-lg border border-line bg-white p-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xs font-semibold text-brand-600">{r.deviceId}</span>
                      <span className="text-[10px] text-ink-400">{r.reportedDays}d</span>
                    </div>
                    <div className="mt-1 text-2xs text-ink-600">{r.fault}</div>
                    <div className="mt-1 text-[10px] text-ink-400">{r.region}</div>
                  </div>
                ))}
                {items.length === 0 && <div className="py-4 text-center text-[10px] text-ink-400">Empty</div>}
              </div>
            </div>
          );
        })}
      </div>

      <Card>
        <CardHeader title="All RMA Items" subtitle="Full list with turnaround tracking" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead><tr className="border-b border-line bg-neutralst-50/80 text-2xs uppercase tracking-wide text-ink-500">{['RMA ID', 'Device', 'Fault', 'Region', 'Stage', 'Reported', 'Turnaround'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {RMA_ITEMS.map((r) => (
                <tr key={r.id} className="hover:bg-neutralst-50/60">
                  <td className="px-3 py-2 font-mono font-semibold text-ink-900">{r.id}</td>
                  <td className="px-3 py-2 font-mono text-brand-600">{r.deviceId}</td>
                  <td className="px-3 py-2 text-ink-700">{r.fault}</td>
                  <td className="px-3 py-2 text-ink-600">{r.region}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {STAGES.map((s, i) => <span key={s.key} className={cn('h-1.5 w-4 rounded-full', i <= stageIndex(r.stage) ? 'bg-brand-500' : 'bg-neutralst-200')} />)}
                      <span className="ml-2 text-2xs text-ink-500">{STAGES[stageIndex(r.stage)].label}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 tabular-nums text-ink-500">{r.reportedDays}d ago</td>
                  <td className="px-3 py-2"><Badge tone={r.turnaroundDays > 10 ? 'red' : r.turnaroundDays > 6 ? 'amber' : 'green'}>{r.turnaroundDays} days</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
