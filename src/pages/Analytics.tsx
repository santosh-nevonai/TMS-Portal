import { LineChart, Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button } from '@/components/ui/primitives';
import { StatCard } from '@/components/ui/StatCard';
import { AreaTrend, BarTrend, LineTrend, Donut } from '@/components/charts/Charts';
import { healthTrend, REGIONS, HEALTH_BREAKDOWN, FIRMWARE_DISTRIBUTION } from '@/data/mock';
import { fmt } from '@/lib/utils';

export default function Analytics() {
  const regionData = REGIONS.slice(0, 8).map((r) => ({ label: r.short, devices: r.devices, online: r.online }));
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Fleet-wide operational analytics and long-term trends"
        actions={<Button variant="secondary"><Download size={14} /> Export</Button>} />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Fleet Uptime (30d)" value="98.4%" delta={0.6} tone="ok" />
        <StatCard label="Avg Battery" value="71%" delta={-1.2} tone="warn" />
        <StatCard label="Announcements (30d)" value="4.82M" delta={5.4} tone="brand" />
        <StatCard label="Mean Time To Repair" value="6.2d" delta={-0.4} deltaInvert tone="default" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader title="Fleet Uptime Trend" subtitle="Online devices over 30 days" />
          <div className="p-3"><AreaTrend height={220} data={healthTrend(30)} series={[{ key: 'online', name: 'Online', color: '#16A34A' }]} /></div>
        </Card>
        <Card>
          <CardHeader title="Devices by Region" subtitle="Fleet distribution and online count" />
          <div className="p-3"><BarTrend height={220} data={regionData} series={[{ key: 'online', name: 'Online', color: '#16A34A' }, { key: 'devices', name: 'Total', color: '#CBD5E1' }]} /></div>
        </Card>
        <Card>
          <CardHeader title="Firmware Adoption" subtitle="Version distribution across fleet" />
          <div className="flex items-center gap-4 p-4">
            <div className="w-1/2"><Donut height={180} data={FIRMWARE_DISTRIBUTION.map((f, i) => ({ label: f.version, value: f.pct, color: ['#2E5BE6', '#16A34A', '#D97706', '#9333EA', '#94A3B8'][i] }))} /></div>
            <div className="flex-1 space-y-1.5">
              {FIRMWARE_DISTRIBUTION.map((f, i) => (
                <div key={f.version} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: ['#2E5BE6', '#16A34A', '#D97706', '#9333EA', '#94A3B8'][i] }} />
                  <span className="font-mono text-ink-700">{f.version}</span>
                  <span className="ml-auto tabular-nums font-semibold text-ink-900">{f.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Offline & Faulty Trend" subtitle="Problem devices over time" />
          <div className="p-3"><LineTrend height={220} data={healthTrend(30)} series={[{ key: 'offline', name: 'Offline', color: '#DC2626' }, { key: 'faulty', name: 'Faulty', color: '#9333EA' }, { key: 'lowBattery', name: 'Low Battery', color: '#D97706' }]} /></div>
        </Card>
      </div>
    </div>
  );
}
