import { useState } from 'react';
import { BarChart3, FileSpreadsheet, FileText, Mail, Cpu, Megaphone, Boxes, Store, ChevronRight, Database, Filter, Group, Eye, Save, CalendarClock, Plus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button, Badge } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlay';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { icon: Cpu, title: 'Device Health', color: 'text-brand-600 bg-brand-50', reports: ['Fleet uptime', 'Device health', 'Battery trends', 'Firmware distribution'] },
  { icon: Megaphone, title: 'Campaign', color: 'text-ok-600 bg-ok-50', reports: ['Reach', 'Plays', 'Completion', 'Region performance'] },
  { icon: Boxes, title: 'Inventory', color: 'text-warn-600 bg-warn-50', reports: ['Stock', 'Dispatch', 'Returns', 'RMA'] },
  { icon: Store, title: 'Merchant', color: 'text-[#7E22CE] bg-[#F6EDFE]', reports: ['Device distribution', 'Device health', 'Activity'] },
];

const RECENT = [
  { name: 'Weekly Fleet Uptime — All India', format: 'PDF', schedule: 'Every Monday 08:00', by: 'Santosh Kumar' },
  { name: 'Campaign Performance — August', format: 'Excel', schedule: 'Monthly', by: 'Priya Nair' },
  { name: 'RMA Turnaround Report', format: 'Excel', schedule: 'On demand', by: 'Vikram Singh' },
  { name: 'Low Battery Devices — Maharashtra', format: 'PDF', schedule: 'Daily 07:00', by: 'System' },
];

export default function Reports() {
  const [builder, setBuilder] = useState(false);
  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate, schedule and export operational reports across the platform"
        actions={<Button variant="primary" onClick={() => setBuilder(true)}><Plus size={14} /> Build Report</Button>} />

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Card key={c.title} className="p-4">
            <div className="flex items-center gap-2.5">
              <span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', c.color)}><c.icon size={18} /></span>
              <h3 className="text-[13px] font-semibold text-ink-900">{c.title}</h3>
            </div>
            <div className="mt-3 space-y-1">
              {c.reports.map((r) => (
                <button key={r} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[13px] text-ink-600 hover:bg-neutralst-50">
                  {r} <ChevronRight size={14} className="text-ink-300" />
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="Saved & Scheduled Reports" subtitle="Recurring and on-demand report definitions" />
        <div className="divide-y divide-line">
          {RECENT.map((r) => (
            <div key={r.name} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutralst-100 text-ink-500">{r.format === 'PDF' ? <FileText size={15} /> : <FileSpreadsheet size={15} />}</span>
              <div className="min-w-0 flex-1"><div className="text-[13px] font-medium text-ink-900">{r.name}</div><div className="text-2xs text-ink-400">{r.by}</div></div>
              <Badge>{r.format}</Badge>
              <span className="flex items-center gap-1 text-2xs text-ink-500"><CalendarClock size={12} /> {r.schedule}</span>
              <div className="flex items-center gap-1"><Button variant="ghost" size="sm"><Mail size={13} /></Button><Button variant="secondary" size="sm">Run</Button></div>
            </div>
          ))}
        </div>
      </Card>

      <CustomReportBuilder open={builder} onClose={() => setBuilder(false)} />
    </div>
  );
}

const FLOW = [
  { icon: Database, label: 'Select Data' }, { icon: Eye, label: 'Select Fields' }, { icon: Filter, label: 'Filters' },
  { icon: Group, label: 'Group By' }, { icon: BarChart3, label: 'Visualization' }, { icon: Save, label: 'Save' }, { icon: CalendarClock, label: 'Schedule' },
];
function CustomReportBuilder({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} size="xl" title="Custom Report Builder" subtitle="Compose a report from any data source, then export or schedule it"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><div className="flex gap-2"><Button variant="secondary"><FileSpreadsheet size={14} /> Excel</Button><Button variant="secondary"><FileText size={14} /> PDF</Button><Button variant="primary" onClick={onClose}><Save size={14} /> Save Report</Button></div></>}>
      <div className="mb-4 flex items-center overflow-x-auto pb-1">
        {FLOW.map((f, i) => (
          <div key={f.label} className="flex items-center">
            <div className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-2xs font-medium', i === 0 ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-line text-ink-500')}>
              <f.icon size={13} /> {f.label}
            </div>
            {i < FLOW.length - 1 && <ChevronRight size={14} className="mx-0.5 shrink-0 text-ink-300" />}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Data source"><select className="h-9 w-full rounded-lg border border-line-strong px-2.5 text-sm"><option>Devices</option><option>Campaigns</option><option>Tickets</option><option>Inventory</option><option>Merchants</option></select></Field>
        <Field label="Visualization"><select className="h-9 w-full rounded-lg border border-line-strong px-2.5 text-sm"><option>Table</option><option>Bar chart</option><option>Line chart</option><option>Donut</option></select></Field>
        <Field label="Group by"><select className="h-9 w-full rounded-lg border border-line-strong px-2.5 text-sm"><option>Region</option><option>Merchant category</option><option>Firmware version</option><option>Status</option></select></Field>
        <Field label="Schedule"><select className="h-9 w-full rounded-lg border border-line-strong px-2.5 text-sm"><option>On demand</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select></Field>
      </div>
      <div className="mt-3">
        <div className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-500">Fields</div>
        <div className="flex flex-wrap gap-1.5">
          {['Device ID', 'Status', 'Battery', 'Signal', 'Firmware', 'Region', 'Merchant', 'Last Sync', 'Uptime'].map((f, i) => (
            <span key={f} className={cn('cursor-pointer rounded-md border px-2 py-1 text-2xs font-medium', i < 5 ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-line text-ink-600')}>{f}</span>
          ))}
        </div>
      </div>
    </Modal>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[13px] font-medium text-ink-700">{label}</label><div className="mt-1">{children}</div></div>;
}
