import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  Cpu, Wifi, WifiOff, WrenchIcon, BatteryLow, PackageX,
  RefreshCw, ChevronDown, ArrowRight, MapPin, Maximize2, Minimize2,
  AlertOctagon, TriangleAlert, Info, CircleDot,
  Radio, Megaphone, LifeBuoy, HardDriveDownload, ShieldAlert, RotateCw, UserCog, Store,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, Button, SegmentedControl, StatusBadge, Progress } from '@/components/ui/primitives';
import { AreaTrend, Donut } from '@/components/charts/Charts';
import { IndiaMap } from '@/components/maps/IndiaMap';
import {
  FLEET, HEALTH_BREAKDOWN, healthTrend, ALERT_SUMMARY, CAMPAIGNS, TICKET_SNAPSHOT, ACTIVITY, ticketTrend, sparkline,
} from '@/data/mock';
import { severityTone, campaignTone } from '@/lib/status';
import { cn, fmt, pct, timeAgo } from '@/lib/utils';
import { BarTrend } from '@/components/charts/Charts';

const WrenchAlt = WrenchIcon as any;

function FilterButton({ label, value }: { label: string; value: string }) {
  return (
    <button className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line-strong bg-white px-3 text-[13px] font-medium text-ink-700 hover:bg-neutralst-50">
      <span className="text-ink-400">{label}</span>
      {value}
      <ChevronDown size={14} className="text-ink-400" />
    </button>
  );
}

export default function Overview() {
  const [range, setRange] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const trend = healthTrend(range === '24h' ? 24 : range === '7d' ? 7 : range === '90d' ? 90 : 30);

  return (
    <div>
      <PageHeader
        title="Fleet Overview"
        subtitle="Real-time health and operational status of your Soundbox fleet"
        meta={<span className="inline-flex items-center gap-1.5 rounded-md bg-ok-50 px-2 py-0.5 text-2xs font-semibold text-ok-700 ring-1 ring-ok-100"><span className="h-1.5 w-1.5 rounded-full bg-ok-500 animate-pulse" />Live</span>}
        actions={
          <>
            <FilterButton label="Region" value="All India" />
            <FilterButton label="Model" value="All" />
            <FilterButton label="Range" value="Last 30d" />
            <Button variant="secondary"><RefreshCw size={14} /> Refresh</Button>
          </>
        }
      >
        <p className="text-xs text-ink-400">
          Last updated <span className="font-medium text-ink-600">12 seconds ago</span> · Auto-refresh every 30s
        </p>
      </PageHeader>

      {/* KPI ROW */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Devices" value={FLEET.total} delta={3.2} sub="this month" icon={<Cpu size={15} />} tone="brand" to="/devices" spark={sparkline(1, 16, 60, 12)} sparkColor="#2E5BE6" />
        <StatCard label="Active" value={FLEET.active} sub={pct(92.3)} icon={<Wifi size={15} />} tone="ok" to="/devices?status=online" spark={sparkline(2, 16, 60, 8)} sparkColor="#16A34A" />
        <StatCard label="Offline" value={FLEET.offline} sub={pct(4.5)} icon={<WifiOff size={15} />} tone="danger" to="/devices?status=offline" delta={-0.4} deltaInvert spark={sparkline(3, 16, 40, 14)} sparkColor="#DC2626" />
        <StatCard label="Faulty / Repair" value={FLEET.faulty} sub={pct(1.2)} icon={<WrenchAlt size={15} />} tone="purple" to="/devices?status=faulty" />
        <StatCard label="Low Battery" value={FLEET.lowBattery} sub="< 20%" icon={<BatteryLow size={15} />} tone="warn" to="/devices?battery=low" />
        <StatCard label="Unassigned" value={FLEET.unassigned} sub="awaiting mapping" icon={<PackageX size={15} />} tone="default" to="/devices?assigned=no" />
      </div>

      {/* ROW 2: Fleet health + Trend */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card>
          <CardHeader title="Fleet Health" subtitle="Distribution across the entire fleet" />
          <div className="flex items-center gap-3 p-4">
            <div className="relative w-[42%] shrink-0">
              <Donut
                data={HEALTH_BREAKDOWN.map((h) => ({ label: h.label, value: h.value, color: h.color }))}
                height={150}
                inner={44}
                outer={64}
                center={
                  <div className="text-center">
                    <div className="text-lg font-bold tabular-nums text-ink-900">92.3%</div>
                    <div className="text-2xs text-ink-500">Healthy</div>
                  </div>
                }
              />
            </div>
            <div className="flex-1 space-y-1.5">
              {HEALTH_BREAKDOWN.map((h) => (
                <div key={h.key} className="flex items-center gap-2 text-xs">
                  <span className="h-2 w-2 rounded-full" style={{ background: h.color }} />
                  <span className="text-ink-600">{h.label}</span>
                  <span className="ml-auto font-semibold tabular-nums text-ink-900">{pct(h.value)}</span>
                  <span className="w-12 text-right tabular-nums text-ink-400">{fmt(h.count)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 divide-x divide-line border-t border-line text-center">
            {[
              { label: 'vs Yesterday', v: '+0.3%', good: true },
              { label: 'vs 7 days', v: '+1.1%', good: true },
              { label: 'vs 30 days', v: '-0.4%', good: false },
            ].map((c) => (
              <div key={c.label} className="py-2.5">
                <div className={cn('text-sm font-bold tabular-nums', c.good ? 'text-ok-600' : 'text-danger-600')}>{c.v}</div>
                <div className="text-2xs text-ink-500">{c.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Device Health Trend"
            subtitle="Online, offline, low battery & faulty devices over time"
            action={
              <SegmentedControl
                size="sm"
                value={range}
                onChange={setRange}
                options={[
                  { value: '24h', label: '24H' },
                  { value: '7d', label: '7D' },
                  { value: '30d', label: '30D' },
                  { value: '90d', label: '90D' },
                ]}
              />
            }
          />
          <div className="p-3">
            <AreaTrend
              data={trend}
              height={218}
              series={[
                { key: 'online', name: 'Online', color: '#16A34A' },
                { key: 'offline', name: 'Offline', color: '#DC2626' },
                { key: 'lowBattery', name: 'Low Battery', color: '#D97706' },
                { key: 'faulty', name: 'Faulty', color: '#9333EA' },
              ]}
            />
            <div className="mt-1 flex flex-wrap items-center justify-center gap-4">
              {[
                { c: '#16A34A', l: 'Online' },
                { c: '#DC2626', l: 'Offline' },
                { c: '#D97706', l: 'Low Battery' },
                { c: '#9333EA', l: 'Faulty' },
              ].map((s) => (
                <span key={s.l} className="flex items-center gap-1.5 text-2xs text-ink-500">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.c }} /> {s.l}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* ROW 3: Map + Alerts */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <RegionalDistribution />

        <AlertsSnapshot />
      </div>

      {/* ROW 4: Campaigns + Tickets */}
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActiveCampaigns />
        </div>
        <TicketingSnapshot />
      </div>

      {/* ROW 5: Activity */}
      <div className="mt-3">
        <RecentActivity />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Region rank
function RegionalDistribution() {
  const [full, setFull] = useState(false);

  // Exit full screen on Escape and lock body scroll while open.
  useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [full]);

  const card = (
    <Card className={cn(full ? 'flex h-full flex-col' : 'lg:col-span-2')}>
      <CardHeader
        title="Regional Distribution"
        subtitle="Device distribution and health across India"
        icon={<MapPin size={15} />}
        action={
          <>
            <Button variant="ghost" size="sm" onClick={() => {}}>State view <ChevronDown size={13} /></Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFull((f) => !f)}
              aria-label={full ? 'Exit full screen' : 'View full screen'}
              title={full ? 'Exit full screen (Esc)' : 'View full screen'}
            >
              {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </Button>
          </>
        }
      />
      <div
        className={cn(
          'grid grid-cols-1 gap-2 p-4',
          full ? 'min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_280px]' : 'md:grid-cols-[minmax(0,1fr)_240px]',
        )}
      >
        <IndiaMap fullscreen={full} />
        <div className={full ? 'min-h-0 overflow-y-auto' : undefined}>
          <RegionRankList />
        </div>
      </div>
    </Card>
  );

  if (full) {
    return createPortal(
      <div className="fixed inset-0 z-[1000] bg-canvas/95 p-4 backdrop-blur-sm">{card}</div>,
      document.body,
    );
  }
  return card;
}

function RegionRankList() {
  const navigate = useNavigate();
  const list = [
    { name: 'Maharashtra', devices: 4180, health: 94.3 },
    { name: 'Uttar Pradesh', devices: 3620, health: 91.4 },
    { name: 'Karnataka', devices: 2960, health: 94.3 },
    { name: 'Delhi NCR', devices: 2840, health: 94.7 },
    { name: 'Tamil Nadu', devices: 2540, health: 92.9 },
    { name: 'Gujarat', devices: 2210, health: 94.1 },
  ];
  return (
    <div className="rounded-lg border border-line">
      <div className="border-b border-line px-3 py-2 text-2xs font-semibold uppercase tracking-wide text-ink-500">Top regions</div>
      <div className="divide-y divide-line">
        {list.map((r) => (
          <button
            key={r.name}
            onClick={() => navigate(`/devices?region=${encodeURIComponent(r.name)}`)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-neutralst-50/60"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-ink-800">{r.name}</div>
              <div className="text-2xs text-ink-400 tabular-nums">{fmt(r.devices)} devices</div>
            </div>
            <span className={cn('text-xs font-semibold tabular-nums', r.health >= 94 ? 'text-ok-600' : 'text-warn-600')}>{pct(r.health)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Alerts snapshot
function AlertsSnapshot() {
  const navigate = useNavigate();
  const icons = { critical: AlertOctagon, high: TriangleAlert, medium: Info, low: CircleDot };
  return (
    <Card className="flex flex-col">
      <CardHeader
        title="Alerts Snapshot"
        subtitle="Operational alerts by severity"
        icon={<Radio size={15} />}
        action={<span className="rounded-full bg-danger-50 px-2 py-0.5 text-2xs font-semibold text-danger-700">{FLEET.criticalAlerts} critical</span>}
      />
      <div className="flex-1 divide-y divide-line">
        {ALERT_SUMMARY.map((a) => {
          const t = severityTone(a.severity);
          const Icon = icons[a.severity];
          return (
            <button
              key={a.severity}
              onClick={() => navigate(`/alerts?severity=${a.severity}`)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-neutralst-50/60"
            >
              <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', t.bg, t.text)}>
                <Icon size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-semibold capitalize', t.text)}>{a.severity}</span>
                  <span className="tabular-nums text-2xs font-semibold text-ink-400">{a.count}</span>
                </div>
                <p className="mt-0.5 text-[13px] leading-snug text-ink-700">{a.label}</p>
              </div>
              <ArrowRight size={14} className="mt-1 text-ink-300" />
            </button>
          );
        })}
      </div>
      <button onClick={() => navigate('/alerts')} className="border-t border-line px-4 py-2.5 text-[13px] font-medium text-brand-600 hover:bg-brand-50/50">
        View all alerts →
      </button>
    </Card>
  );
}

// ---------------------------------------------------------------- Active campaigns
function ActiveCampaigns() {
  const navigate = useNavigate();
  const live = CAMPAIGNS.filter((c) => c.status === 'live');
  return (
    <Card>
      <CardHeader
        title="Active Campaigns"
        subtitle={`${live.length} campaigns currently delivering audio`}
        icon={<Megaphone size={15} />}
        action={<Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>All campaigns <ArrowRight size={13} /></Button>}
      />
      <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-3">
        {live.map((c) => {
          const t = campaignTone(c.status);
          return (
            <button
              key={c.id}
              onClick={() => navigate('/campaigns')}
              className="rounded-lg border border-line p-3 text-left transition-all hover:border-line-strong hover:shadow-card"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[13px] font-semibold leading-tight text-ink-900">{c.name}</span>
                <StatusBadge tone={t} pulse />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs">
                <Metric label="Devices" value={fmt(c.targetDevices)} />
                <Metric label="Plays" value={fmt(c.plays)} />
                <Metric label="Reach" value={pct(c.reach)} />
                <Metric label="Completion" value={pct(c.completion)} />
              </div>
              <div className="mt-2.5">
                <Progress value={c.completion} tone="ok" size="sm" />
                <div className="mt-1.5 flex items-center justify-between text-2xs text-ink-500">
                  <span>{c.language}</span>
                  <span>Ends in 2d 14h</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xs text-ink-400">{label}</div>
      <div className="font-semibold tabular-nums text-ink-900">{value}</div>
    </div>
  );
}

// ---------------------------------------------------------------- Ticketing snapshot
function TicketingSnapshot() {
  const navigate = useNavigate();
  const rows = [
    { label: 'Open Tickets', value: TICKET_SNAPSHOT.open, tone: 'text-ink-900' },
    { label: 'Critical', value: TICKET_SNAPSHOT.critical, tone: 'text-danger-600' },
    { label: 'High', value: TICKET_SNAPSHOT.high, tone: 'text-warn-600' },
    { label: 'SLA Breached', value: TICKET_SNAPSHOT.slaBreached, tone: 'text-danger-600' },
    { label: 'Due Today', value: TICKET_SNAPSHOT.dueToday, tone: 'text-ink-900' },
  ];
  return (
    <Card className="flex flex-col">
      <CardHeader title="Ticketing" subtitle="Support queue health" icon={<LifeBuoy size={15} />} action={<Button variant="ghost" size="sm" onClick={() => navigate('/tickets')}>Open <ArrowRight size={13} /></Button>} />
      <div className="flex-1 px-4 py-2">
        {rows.map((r, i) => (
          <div key={r.label} className={cn('flex items-center justify-between py-2', i < rows.length - 1 && 'border-b border-line')}>
            <span className="text-[13px] text-ink-600">{r.label}</span>
            <span className={cn('text-sm font-bold tabular-nums', r.tone)}>{r.value}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-line p-3">
        <div className="mb-1 text-2xs font-medium text-ink-500">Open vs closed · last 14 days</div>
        <BarTrend
          height={72}
          data={ticketTrend()}
          series={[
            { key: 'open', name: 'Open', color: '#D97706' },
            { key: 'closed', name: 'Closed', color: '#16A34A' },
          ]}
        />
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------- Recent activity
const ACT_ICON: Record<string, any> = {
  reboot: RotateCw, ota: HardDriveDownload, campaign: Megaphone, mapping: Store, block: ShieldAlert, ticket: LifeBuoy, permission: UserCog, alert: Radio,
};
const ACT_TONE: Record<string, string> = {
  reboot: 'bg-info-50 text-info-600', ota: 'bg-brand-50 text-brand-600', campaign: 'bg-ok-50 text-ok-600', mapping: 'bg-neutralst-100 text-ink-600', block: 'bg-danger-50 text-danger-600', ticket: 'bg-warn-50 text-warn-600', permission: 'bg-[#F6EDFE] text-[#7E22CE]', alert: 'bg-danger-50 text-danger-600',
};

function RecentActivity() {
  return (
    <Card>
      <CardHeader title="Recent Activity" subtitle="Latest operational events across the platform" action={<Button variant="ghost" size="sm">View audit log <ArrowRight size={13} /></Button>} />
      <div className="grid grid-cols-1 divide-y divide-line md:grid-cols-2 md:divide-y-0 md:divide-x">
        {[ACTIVITY.slice(0, 4), ACTIVITY.slice(4, 8)].map((col, ci) => (
          <div key={ci} className="divide-y divide-line">
            {col.map((e) => {
              const Icon = ACT_ICON[e.type];
              return (
                <div key={e.id} className="flex items-start gap-3 px-4 py-2.5">
                  <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', ACT_TONE[e.type])}>
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[13px] font-medium text-ink-900">{e.title}</span>
                      <span className="font-mono text-2xs text-brand-600">{e.entity}</span>
                    </div>
                    <p className="truncate text-xs text-ink-500">{e.detail}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-2xs text-ink-400">{timeAgo(e.minsAgo)}</div>
                    <div className="text-2xs text-ink-400">{e.user}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
