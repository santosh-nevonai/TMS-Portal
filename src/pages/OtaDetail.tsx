import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Pause, Play, RotateCcw, ListX, HardDriveDownload } from 'lucide-react';
import { Card, CardHeader, Button, StatusBadge, Progress, Badge } from '@/components/ui/primitives';
import { BarTrend } from '@/components/charts/Charts';
import { OTA_ROLLOUTS, REGIONS } from '@/data/mock';
import { cn, fmt } from '@/lib/utils';

export default function OtaDetail() {
  const { id } = useParams();
  const r = OTA_ROLLOUTS.find((x) => x.id === id) ?? OTA_ROLLOUTS[0];
  const progress = Math.round((r.success / r.total) * 100);
  const tone = { in_progress: 'bg-info-500', paused: 'bg-warn-500', completed: 'bg-ok-500', failed: 'bg-danger-500', scheduled: 'bg-ink-400' }[r.status];

  const stats = [
    { label: 'Total', value: r.total, color: 'text-ink-900' },
    { label: 'Pending', value: r.pending, color: 'text-warn-600' },
    { label: 'In Progress', value: r.inProgress, color: 'text-info-600' },
    { label: 'Successful', value: r.success, color: 'text-ok-600' },
    { label: 'Failed', value: r.failed, color: 'text-danger-600' },
  ];

  const regionBreak = REGIONS.slice(0, 6).map((rg, i) => ({ label: rg.short, success: Math.round(rg.devices / 6), failed: 20 + i * 8 }));

  return (
    <div>
      <div className="mb-3 flex items-center gap-1 text-xs text-ink-500">
        <Link to="/ota" className="hover:text-ink-800">Firmware & OTA</Link>
        <ChevronRight size={13} className="text-ink-300" />
        <span className="font-mono font-medium text-ink-700">{r.id}</span>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white"><HardDriveDownload size={22} /></span>
          <div>
            <div className="flex items-center gap-2.5"><h1 className="font-mono text-xl font-bold text-ink-900">Firmware {r.firmware}</h1><StatusBadge tone={{ dot: tone, text: 'text-ink-700', bg: 'bg-neutralst-50', border: 'border-line', label: r.status.replace('_', ' ') }} pulse={r.status === 'in_progress'} /></div>
            <p className="mt-1 text-[13px] text-ink-500">Upgrading from {r.fromVersion} · {r.strategy} · {r.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {r.status === 'in_progress' ? <Button variant="secondary" size="sm"><Pause size={14} /> Pause</Button> : r.status === 'paused' ? <Button variant="primary" size="sm"><Play size={14} /> Resume</Button> : null}
          <Button variant="secondary" size="sm"><RotateCcw size={14} /> Rollback</Button>
          <Button variant="secondary" size="sm"><ListX size={14} /> View Failed</Button>
        </div>
      </div>

      <Card className="mb-3">
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-ink-800">Overall Progress</span>
            <span className="text-lg font-bold tabular-nums text-ink-900">{progress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-neutralst-100">
            <div className={cn('flex h-full items-center justify-end rounded-full pr-2 transition-all', tone)} style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-line px-3 py-2.5 text-center">
                <div className={cn('text-xl font-bold tabular-nums', s.color)}>{fmt(s.value)}</div>
                <div className="text-2xs text-ink-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader title="Progress by Region" subtitle="Success vs failure per region" />
          <div className="p-3"><BarTrend height={220} stacked data={regionBreak} series={[{ key: 'success', name: 'Successful', color: '#16A34A' }, { key: 'failed', name: 'Failed', color: '#DC2626' }]} /></div>
        </Card>
        <Card>
          <CardHeader title="Failed Devices" subtitle={`${r.failed} devices need attention`} action={<Button variant="ghost" size="sm">Retry all</Button>} />
          <div className="divide-y divide-line">
            {['NV-SB-042', 'NV-SB-118', 'NV-SB-203', 'NV-SB-267', 'NV-SB-390'].map((d, i) => (
              <div key={d} className="flex items-center gap-3 px-4 py-2.5">
                <Link to={`/devices/${d}`} className="font-mono text-[13px] font-semibold text-brand-600 hover:underline">{d}</Link>
                <span className="text-2xs text-ink-500">{['Download timeout', 'Low battery', 'Offline during window', 'Checksum mismatch', 'Insufficient storage'][i]}</span>
                <Badge tone="red" className="ml-auto">Failed</Badge>
                <Button variant="secondary" size="sm">Retry</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
