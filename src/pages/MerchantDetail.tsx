import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Store, MapPin, Cpu, Plus, ArrowRightLeft, Wifi, WifiOff, Wrench } from 'lucide-react';
import { Card, CardHeader, Button, StatusBadge, Badge } from '@/components/ui/primitives';
import { StatCard } from '@/components/ui/StatCard';
import { AreaTrend, BarTrend } from '@/components/charts/Charts';
import { MERCHANTS, DEVICES, healthTrend } from '@/data/mock';
import { deviceTone, kycTone } from '@/lib/status';
import { BatteryIndicator, SignalIndicator } from '@/components/ui/indicators';
import { cn, shortAgo } from '@/lib/utils';

export default function MerchantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const merchant = MERCHANTS.find((m) => m.id === id) ?? MERCHANTS[0];
  const devices = DEVICES.filter((d) => d.merchantId === merchant.id).slice(0, 6);
  const list = devices.length ? devices : DEVICES.slice(0, 4);

  return (
    <div>
      <div className="mb-3 flex items-center gap-1 text-xs text-ink-500">
        <Link to="/merchants" className="hover:text-ink-800">Merchants</Link>
        <ChevronRight size={13} className="text-ink-300" />
        <span className="font-medium text-ink-700">{merchant.name}</span>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Store size={24} /></span>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-ink-900">{merchant.name}</h1>
              <StatusBadge tone={deviceTone(merchant.status)} />
            </div>
            <div className="mt-1 flex items-center gap-x-3 text-[13px] text-ink-500">
              <span className="font-mono text-xs">{merchant.id}</span>
              <span className="text-ink-300">·</span>
              <span className="inline-flex items-center gap-1"><MapPin size={12} /> {merchant.region}</span>
              <span className="text-ink-300">·</span>
              <StatusBadge tone={kycTone(merchant.kyc)} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="sm"><ArrowRightLeft size={14} /> Reassign Devices</Button>
          <Button variant="primary" size="sm"><Plus size={14} /> Assign Device</Button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Assigned Devices" value={merchant.devices} icon={<Cpu size={15} />} tone="brand" />
        <StatCard label="Online" value={merchant.online} icon={<Wifi size={15} />} tone="ok" />
        <StatCard label="Offline" value={merchant.offline} icon={<WifiOff size={15} />} tone="danger" />
        <StatCard label="Faulty" value={merchant.faulty} icon={<Wrench size={15} />} tone="purple" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Assigned Devices" subtitle="Devices deployed at this merchant location" action={<Button variant="ghost" size="sm" onClick={() => navigate('/devices')}>View all</Button>} />
          <div className="divide-y divide-line">
            {list.map((d) => (
              <button key={d.id} onClick={() => navigate(`/devices/${d.id}`)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutralst-50/60">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-900 text-white"><Cpu size={15} /></span>
                <div className="min-w-0 flex-1"><div className="font-mono text-[13px] font-semibold text-ink-900">{d.id}</div><div className="text-2xs text-ink-400">{d.model} · {d.firmware}</div></div>
                <StatusBadge tone={deviceTone(d.status)} />
                <div className="hidden sm:block"><BatteryIndicator value={d.battery} showBar={false} /></div>
                <div className="hidden md:block"><SignalIndicator bars={d.signal} connectivity={d.connectivity} /></div>
                <span className="tabular-nums text-2xs text-ink-400">{shortAgo(d.lastSyncMins)}</span>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader title="Business Information" />
            <div className="space-y-2.5 p-4 text-[13px]">
              {[['Category', merchant.category], ['Region', merchant.region], ['KYC Status', merchant.kyc], ['Onboarded', merchant.onboarded], ['Last Sync', shortAgo(merchant.lastSyncMins) + ' ago']].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between"><span className="text-ink-500">{k}</span><span className="font-medium capitalize text-ink-900">{v}</span></div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader title="Announcement Volume" subtitle="Payment announcements played · last 30 days" />
          <div className="p-3"><BarTrend height={180} data={healthTrend(14).map((d, i) => ({ label: d.label, plays: 400 + (i % 5) * 60 + (d.online % 200) }))} series={[{ key: 'plays', name: 'Announcements', color: '#2E5BE6' }]} /></div>
        </Card>
        <Card>
          <CardHeader title="Device Health Trend" subtitle="Online devices at this merchant" />
          <div className="p-3"><AreaTrend height={180} data={healthTrend(14).map((d) => ({ label: d.label, online: Math.round(d.online / 5000) + 2 }))} series={[{ key: 'online', name: 'Online', color: '#16A34A' }]} /></div>
        </Card>
      </div>
    </div>
  );
}
