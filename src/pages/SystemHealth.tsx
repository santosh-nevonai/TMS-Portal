import { Activity, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button, StatusBadge } from '@/components/ui/primitives';
import { StatCard } from '@/components/ui/StatCard';
import { AreaTrend } from '@/components/charts/Charts';
import { SYSTEM_SERVICES, healthTrend } from '@/data/mock';
import { serviceTone } from '@/lib/status';
import { cn, shortAgo } from '@/lib/utils';

export default function SystemHealth() {
  const down = SYSTEM_SERVICES.filter((s) => s.status === 'down').length;
  const degraded = SYSTEM_SERVICES.filter((s) => s.status === 'degraded').length;
  return (
    <div>
      <PageHeader title="System Health" subtitle="Internal platform monitoring — IoT gateway, APIs, data stores and integrations"
        meta={degraded || down ? <span className="rounded-md bg-warn-50 px-2 py-0.5 text-2xs font-semibold text-warn-700">{degraded} degraded</span> : <span className="rounded-md bg-ok-50 px-2 py-0.5 text-2xs font-semibold text-ok-700">All systems operational</span>}
        actions={<Button variant="secondary"><RefreshCw size={14} /> Refresh</Button>} />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Services Operational" value={`${SYSTEM_SERVICES.length - down - degraded}/${SYSTEM_SERVICES.length}`} tone="ok" icon={<Activity size={15} />} />
        <StatCard label="API Latency (p95)" value="218ms" tone="default" />
        <StatCard label="Connected Devices" value="24,676" tone="brand" />
        <StatCard label="Job Queue Depth" value="18.4k" tone="warn" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Services" subtitle="Real-time status of platform components" />
          <div className="divide-y divide-line">
            {SYSTEM_SERVICES.map((s) => {
              const t = serviceTone(s.status);
              return (
                <div key={s.name} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span className={cn('h-2.5 w-2.5 rounded-full', t.dot, s.status === 'operational' && 'animate-pulse')} />
                  <div className="min-w-0 flex-1"><div className="text-[13px] font-semibold text-ink-900">{s.name}</div><div className="text-2xs text-ink-400">{s.detail}</div></div>
                  <div className="hidden gap-5 text-2xs sm:flex">
                    <Metric label="Latency" value={s.latencyMs ? `${s.latencyMs}ms` : '—'} />
                    <Metric label="Error rate" value={`${s.errorRate}%`} tone={s.errorRate > 1 ? 'text-danger-600' : 'text-ink-900'} />
                    {s.queueDepth !== undefined && <Metric label="Queue" value={s.queueDepth.toLocaleString('en-IN')} />}
                    <Metric label="Heartbeat" value={`${s.lastHeartbeatSec}s ago`} />
                  </div>
                  <StatusBadge tone={t} />
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader title="API Traffic" subtitle="Requests / min · last 30 min" />
            <div className="p-3"><AreaTrend height={140} yWidth={30} data={healthTrend(30).map((d, i) => ({ label: `${i}`, req: 800 + (d.online % 400) }))} series={[{ key: 'req', name: 'Requests', color: '#2E5BE6' }]} /></div>
          </Card>
          <Card>
            <CardHeader title="Platform Info" />
            <div className="space-y-2.5 p-4 text-[13px]">
              {[['Region', 'ap-south-1 (Mumbai)'], ['Version', 'v3.8.2'], ['Last backup', '1h ago'], ['Uptime', '64 days'], ['MQTT broker', 'Healthy']].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between"><span className="text-ink-500">{k}</span><span className="font-medium text-ink-900">{v}</span></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
function Metric({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return <div className="text-right"><div className={cn('font-semibold tabular-nums', tone ?? 'text-ink-900')}>{value}</div><div className="text-ink-400">{label}</div></div>;
}
