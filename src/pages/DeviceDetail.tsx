import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, RotateCw, VolumeX, Volume2, Ban, MapPin, MoreHorizontal, ArrowLeft,
  Battery, Signal, Thermometer, Radio, Clock, Cpu, Wifi, HardDriveDownload,
  CheckCircle2, XCircle, Loader2, Send, ShieldAlert, Store, Activity, ScrollText, LifeBuoy, Megaphone, Layers, Tags,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button, StatusBadge, Badge, Progress } from '@/components/ui/primitives';
import { Tabs } from '@/components/ui/Tabs';
import { BatteryIndicator, SignalIndicator } from '@/components/ui/indicators';
import { AreaTrend, LineTrend } from '@/components/charts/Charts';
import { ConfirmDialog } from '@/components/ui/overlay';
import { DEVICES, COMMAND_HISTORY, telemetrySeries, DEVICE_GROUPS } from '@/data/mock';
import { deviceTone, commandTone } from '@/lib/status';
import { cn, fmt, shortAgo, timeAgo, durationSec } from '@/lib/utils';
import type { CommandStatus } from '@/types';

type Tab = 'overview' | 'telemetry' | 'events' | 'announcements' | 'commands' | 'firmware' | 'merchant' | 'tickets' | 'audit';

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const device = DEVICES.find((d) => d.id === id) ?? DEVICES[0];
  const [tab, setTab] = useState<Tab>('overview');
  const [confirmBlock, setConfirmBlock] = useState(false);
  const tone = deviceTone(device.status);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-3 flex items-center gap-1 text-xs text-ink-500">
        <Link to="/devices" className="hover:text-ink-800">Devices</Link>
        <ChevronRight size={13} className="text-ink-300" />
        <span className="font-mono font-medium text-ink-700">{device.id}</span>
      </div>

      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate('/devices')} className="mt-1 rounded-lg border border-line-strong p-1.5 text-ink-500 hover:bg-neutralst-50 lg:hidden">
            <ArrowLeft size={16} />
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm">
            <Radio size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-mono text-xl font-bold tracking-tight text-ink-900">{device.id}</h1>
              <StatusBadge tone={tone} pulse={device.status === 'online'} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-500">
              <span>Merchant: <Link to={`/merchants/${device.merchantId}`} className="font-medium text-brand-600 hover:underline">{device.merchant}</Link></span>
              <span className="text-ink-300">·</span>
              <span className="font-mono text-xs">{device.merchantId}</span>
              <span className="text-ink-300">·</span>
              <span className="inline-flex items-center gap-1"><MapPin size={12} /> {device.region}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="secondary" size="sm"><RotateCw size={14} /> Reboot</Button>
          <Button variant="secondary" size="sm"><VolumeX size={14} /> Mute</Button>
          <Button variant="secondary" size="sm"><Volume2 size={14} /> Volume</Button>
          <Button variant="secondary" size="sm" disabled={!device.hasGps}><MapPin size={14} /> Locate</Button>
          <Button variant="danger" size="sm" onClick={() => setConfirmBlock(true)}><Ban size={14} /> Block</Button>
          <Button variant="secondary" size="sm"><MoreHorizontal size={16} /></Button>
        </div>
      </div>

      {/* Health summary strip */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <HealthTile icon={<Battery size={15} />} label="Battery" value={`${device.battery}%`} tone={device.battery < 20 ? 'danger' : device.battery < 40 ? 'warn' : 'ok'} sub={device.charging ? 'Charging' : 'Discharging'} />
        <HealthTile icon={<Signal size={15} />} label="Signal" value={`${device.signal}/4`} tone={device.signal <= 1 ? 'danger' : device.signal === 2 ? 'warn' : 'ok'} sub={`${device.signalDbm} dBm`} />
        <HealthTile icon={<Wifi size={15} />} label="Network" value={device.connectivity} tone="ok" sub="Connected" />
        <HealthTile icon={<Volume2 size={15} />} label="Volume" value={`${device.volume}%`} tone="default" sub="Announcements" />
        <HealthTile icon={<Thermometer size={15} />} label="Temp" value={`${device.temperature}°C`} tone={device.temperature > 42 ? 'warn' : 'default'} sub="Nominal" />
        <HealthTile icon={<Clock size={15} />} label="Heartbeat" value={shortAgo(device.lastSyncMins)} tone={device.lastSyncMins < 5 ? 'ok' : 'warn'} sub="Last sync" />
      </div>

      <Card>
        <div className="px-3">
          <Tabs
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'overview', label: 'Overview' },
              { value: 'telemetry', label: 'Telemetry' },
              { value: 'commands', label: 'Command Center' },
              { value: 'events', label: 'Events' },
              { value: 'announcements', label: 'Announcements' },
              { value: 'firmware', label: 'Firmware' },
              { value: 'merchant', label: 'Merchant' },
              { value: 'tickets', label: 'Tickets', count: 2 },
              { value: 'audit', label: 'Audit' },
            ]}
          />
        </div>
        <div className="p-4">
          {tab === 'overview' && <OverviewTab device={device} />}
          {tab === 'telemetry' && <TelemetryTab />}
          {tab === 'commands' && <CommandsTab />}
          {tab === 'events' && <EventsTab />}
          {tab === 'announcements' && <AnnouncementsTab />}
          {tab === 'firmware' && <FirmwareTab device={device} />}
          {tab === 'merchant' && <MerchantTab device={device} />}
          {tab === 'tickets' && <TicketsTab device={device} />}
          {tab === 'audit' && <AuditTab device={device} />}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmBlock}
        onClose={() => setConfirmBlock(false)}
        onConfirm={() => {}}
        title="Block Soundbox?"
        description="This device will stop operating until it is reactivated. The merchant will not receive payment announcements while blocked."
        confirmLabel="Block Device"
        danger
        details={[
          { label: 'Device', value: device.id },
          { label: 'Merchant', value: device.merchant },
          { label: 'Region', value: device.region },
        ]}
      />
    </div>
  );
}

function HealthTile({ icon, label, value, sub, tone }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: 'ok' | 'warn' | 'danger' | 'default' }) {
  const toneCls = { ok: 'text-ok-600 bg-ok-50', warn: 'text-warn-600 bg-warn-50', danger: 'text-danger-600 bg-danger-50', default: 'text-ink-500 bg-neutralst-100' }[tone];
  return (
    <Card className="px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', toneCls)}>{icon}</span>
        <span className="text-2xs font-medium uppercase tracking-wide text-ink-400">{label}</span>
      </div>
      <div className="mt-1.5 text-lg font-bold tabular-nums text-ink-900">{value}</div>
      <div className="text-2xs text-ink-500">{sub}</div>
    </Card>
  );
}

// ------------------------------------------------------------------ Overview tab
function OverviewTab({ device }: { device: typeof DEVICES[0] }) {
  const info: [string, string][] = [
    ['Device ID', device.id],
    ['Serial Number', device.serial],
    ['IMEI', device.imei],
    ['SIM / ICCID', device.iccid],
    ['SKU', device.sku],
    ['Model', device.model],
    ['Firmware', device.firmware],
    ['Hardware', device.hardware],
  ];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionTitle>Device Information</SectionTitle>
        <div className="grid grid-cols-1 gap-x-6 gap-y-0 rounded-lg border border-line sm:grid-cols-2">
          {info.map(([k, v], i) => (
            <div key={k} className={cn('flex items-center justify-between px-3 py-2.5 text-[13px]', i < info.length - (info.length % 2 === 0 ? 2 : 1) && 'border-b border-line')}>
              <span className="text-ink-500">{k}</span>
              <span className="font-mono font-medium text-ink-900">{v}</span>
            </div>
          ))}
        </div>

        <SectionTitle className="mt-5">30-Day Uptime</SectionTitle>
        <div className="rounded-lg border border-line p-4">
          <div className="flex items-end justify-between">
            <div className="text-3xl font-bold tabular-nums text-ink-900">{device.uptime30d.toFixed(1)}%</div>
            <Badge tone="green">SLA target 99.0%</Badge>
          </div>
          <Progress value={device.uptime30d} tone={device.uptime30d > 99 ? 'ok' : 'warn'} className="mt-3" />
          <div className="mt-2 flex items-center justify-between text-2xs text-ink-500">
            <span>Downtime: {Math.round((100 - device.uptime30d) * 43.2)} min this month</span>
            <span>Last incident: 4 days ago</span>
          </div>
        </div>
      </div>

      <div>
        <SectionTitle>Current Status</SectionTitle>
        <div className="rounded-lg border border-line p-4">
          <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', deviceTone(device.status).dot)} />
            <span className="text-sm font-semibold capitalize text-ink-900">{deviceTone(device.status).label}</span>
          </div>
          <p className="mt-1 text-xs text-ink-500">Last seen {timeAgo(device.lastSyncMins)}</p>
          <div className="mt-4 space-y-2.5">
            <MiniStat label="SKU" value={device.skuName} />
            <MiniStat label="Last transaction" value={shortAgo(device.lastTxnMins) + ' ago'} />
            <MiniStat label="Connectivity" value={device.connectivity} />
            <MiniStat label="GPS" value={device.hasGps ? 'Available' : 'Not available'} />
            <MiniStat label="Assigned" value={device.assigned ? 'Yes' : 'Unassigned'} />
          </div>
          <div className="mt-4 border-t border-line pt-3">
            <div className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-500">Device Groups</div>
            {device.deviceGroups.length ? (
              <div className="flex flex-wrap gap-1.5">
                {device.deviceGroups.map((gid) => {
                  const g = DEVICE_GROUPS.find((x) => x.id === gid);
                  return (
                    <Link key={gid} to={`/groups`} className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-2xs font-medium text-brand-700 hover:bg-brand-100">
                      <Layers size={11} /> {g?.name ?? gid}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <span className="text-2xs text-ink-400">Not in any group</span>
            )}
          </div>
        </div>

        {device.hasGps && (
          <>
            <SectionTitle className="mt-5">Location</SectionTitle>
            <div className="relative h-40 overflow-hidden rounded-lg border border-line grid-dots bg-neutralst-50">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <span className="absolute -inset-3 animate-ping rounded-full bg-brand-400/30" />
                  <MapPin size={26} className="relative fill-brand-500 text-white" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-2xs text-ink-600 shadow-sm backdrop-blur">
                {device.lat?.toFixed(4)}, {device.lng?.toFixed(4)} · updated {shortAgo(device.lastSyncMins)} ago
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Telemetry tab
function TelemetryTab() {
  const [range, setRange] = useState('24h');
  const data = telemetrySeries(24);
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <SectionTitle className="mb-0">Live Telemetry</SectionTitle>
        <div className="inline-flex items-center rounded-lg border border-line bg-neutralst-50 p-0.5">
          {['1H', '6H', '24H', '7D', '30D'].map((r) => (
            <button key={r} onClick={() => setRange(r)} className={cn('rounded-md px-2 py-1 text-2xs font-medium', range === r ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500')}>{r}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TeleCard title="Battery %" color="#16A34A">
          <AreaTrend height={180} data={data} series={[{ key: 'battery', name: 'Battery', color: '#16A34A' }]} />
        </TeleCard>
        <TeleCard title="Signal Strength (bars)" color="#2E5BE6">
          <LineTrend height={180} data={data} series={[{ key: 'signal', name: 'Signal', color: '#2E5BE6' }]} />
        </TeleCard>
        <TeleCard title="Temperature °C" color="#D97706">
          <AreaTrend height={180} data={data} series={[{ key: 'temperature', name: 'Temp', color: '#D97706' }]} />
        </TeleCard>
        <TeleCard title="Volume %" color="#7E22CE">
          <LineTrend height={180} data={data} series={[{ key: 'volume', name: 'Volume', color: '#7E22CE' }]} />
        </TeleCard>
      </div>
    </div>
  );
}
function TeleCard({ title, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="mb-1 text-xs font-medium text-ink-600">{title}</div>
      {children}
    </div>
  );
}

// ------------------------------------------------------------------ Command center
const FLOW_STEPS: { key: CommandStatus; label: string }[] = [
  { key: 'sent', label: 'Sent' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'executed', label: 'Executed' },
];
function CommandsTab() {
  const [running, setRunning] = useState<{ cmd: string; step: number } | null>(null);

  const runCommand = (cmd: string) => {
    setRunning({ cmd, step: 0 });
    let step = 0;
    const iv = setInterval(() => {
      step++;
      setRunning({ cmd, step });
      if (step >= 3) {
        clearInterval(iv);
        setTimeout(() => setRunning(null), 2500);
      }
    }, 900);
  };

  const commands = [
    { label: 'Reboot Device', icon: RotateCw, tone: 'default' },
    { label: 'Mute', icon: VolumeX, tone: 'default' },
    { label: 'Unmute', icon: Volume2, tone: 'default' },
    { label: 'Set Volume', icon: Volume2, tone: 'default' },
    { label: 'Locate Device', icon: MapPin, tone: 'default' },
    { label: 'Push Firmware', icon: HardDriveDownload, tone: 'brand' },
    { label: 'Deactivate', icon: ShieldAlert, tone: 'danger' },
    { label: 'Block Device', icon: Ban, tone: 'danger' },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Command panel */}
      <div className="lg:col-span-2">
        <SectionTitle>Command Center</SectionTitle>
        <div className="rounded-lg border border-navy-800 bg-navy-900 p-4">
          <div className="grid grid-cols-2 gap-2">
            {commands.map((c) => (
              <button
                key={c.label}
                onClick={() => runCommand(c.label)}
                disabled={!!running}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[13px] font-medium transition-colors disabled:opacity-50',
                  c.tone === 'danger'
                    ? 'border-danger-500/30 bg-danger-500/10 text-danger-300 hover:bg-danger-500/20'
                    : c.tone === 'brand'
                    ? 'border-brand-400/30 bg-brand-500/15 text-brand-200 hover:bg-brand-500/25'
                    : 'border-navy-700 bg-navy-850 text-navy-100 hover:bg-navy-800',
                )}
              >
                <c.icon size={15} /> {c.label}
              </button>
            ))}
          </div>

          {/* Live command flow */}
          <div className="mt-4 rounded-lg border border-navy-700 bg-navy-850 p-3.5">
            {!running ? (
              <div className="flex items-center gap-2 text-xs text-navy-400">
                <Send size={14} /> Select a command to dispatch to the device over MQTT.
              </div>
            ) : (
              <div>
                <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-white">
                  <Loader2 size={14} className={cn(running.step < 3 && 'animate-spin', 'text-brand-300')} /> {running.cmd}
                </div>
                <div className="flex items-center">
                  {FLOW_STEPS.map((s, i) => {
                    const done = running.step > i;
                    const active = running.step === i;
                    return (
                      <div key={s.key} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn('flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors',
                            done ? 'border-ok-500 bg-ok-500 text-white' : active ? 'border-brand-400 bg-brand-500/20 text-brand-200' : 'border-navy-600 text-navy-500')}>
                            {done ? <CheckCircle2 size={15} /> : active ? <Loader2 size={13} className="animate-spin" /> : i + 1}
                          </span>
                          <span className={cn('text-2xs font-medium', done || active ? 'text-navy-100' : 'text-navy-500')}>{s.label}</span>
                          <span className="font-mono text-[10px] text-navy-400">{done || active ? `10:42:${10 + i}` : '—'}</span>
                        </div>
                        {i < FLOW_STEPS.length - 1 && <div className={cn('mx-1 h-0.5 flex-1 rounded', running.step > i ? 'bg-ok-500' : 'bg-navy-700')} />}
                      </div>
                    );
                  })}
                </div>
                {running.step >= 3 && <div className="mt-3 rounded-md bg-ok-500/15 px-2.5 py-1.5 text-2xs font-medium text-ok-300">✓ Command acknowledged by device — completed in 3s</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Command history */}
      <div className="lg:col-span-3">
        <SectionTitle>Command History</SectionTitle>
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-neutralst-50/80 text-2xs uppercase tracking-wide text-ink-500">
                <th className="px-3 py-2 font-semibold">Command</th>
                <th className="px-3 py-2 font-semibold">Requested By</th>
                <th className="px-3 py-2 font-semibold">When</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 text-right font-semibold">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {COMMAND_HISTORY.map((c) => (
                <tr key={c.id} className="hover:bg-neutralst-50/60">
                  <td className="px-3 py-2 font-medium text-ink-800">{c.command}</td>
                  <td className="px-3 py-2 text-ink-600">{c.requestedBy}</td>
                  <td className="px-3 py-2 text-ink-500">{shortAgo(c.requestedMins)} ago</td>
                  <td className="px-3 py-2"><StatusBadge tone={commandTone(c.status)} /></td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-ink-500">
                    {c.executedSec ? `${c.executedSec}s` : c.deliveredSec ? `${c.deliveredSec}s` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Events tab
const EVENTS = [
  { time: '10:42:13', title: 'Device reboot completed', tone: 'ok', icon: CheckCircle2 },
  { time: '10:41:58', title: 'Reboot command delivered', tone: 'blue', icon: Send },
  { time: '10:41:56', title: 'Reboot command sent by Santosh Kumar', tone: 'blue', icon: Send },
  { time: '10:15:04', title: 'Battery changed 21% → 20% (low battery threshold)', tone: 'warn', icon: Battery },
  { time: '09:42:11', title: 'Heartbeat received · signal 3/4', tone: 'gray', icon: Activity },
  { time: '09:12:44', title: 'Payment announcement played — ₹450', tone: 'gray', icon: Radio },
  { time: '08:30:02', title: 'Firmware verified v2.4.1', tone: 'gray', icon: HardDriveDownload },
];
function EventsTab() {
  const toneCls: Record<string, string> = { ok: 'bg-ok-50 text-ok-600', blue: 'bg-info-50 text-info-600', warn: 'bg-warn-50 text-warn-600', gray: 'bg-neutralst-100 text-ink-500' };
  return (
    <div>
      <SectionTitle>Device Event Log</SectionTitle>
      <div className="relative pl-1">
        {EVENTS.map((e, i) => (
          <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
            {i < EVENTS.length - 1 && <div className="absolute left-[13px] top-7 h-full w-px bg-line" />}
            <span className={cn('z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full', toneCls[e.tone])}>
              <e.icon size={14} />
            </span>
            <div className="pt-0.5">
              <div className="text-[13px] text-ink-800">{e.title}</div>
              <div className="font-mono text-2xs text-ink-400">Today · {e.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Announcements / Firmware / Merchant / Tickets / Audit
function AnnouncementsTab() {
  const rows = [
    { time: '09:12:44', amount: '₹450', type: 'UPI Payment', status: 'Played' },
    { time: '09:05:11', amount: '₹120', type: 'UPI Payment', status: 'Played' },
    { time: '08:58:30', amount: '—', type: 'Campaign: Festive Cashback', status: 'Played' },
    { time: '08:41:02', amount: '₹1,250', type: 'UPI Payment', status: 'Played' },
    { time: '08:22:19', amount: '₹75', type: 'UPI Payment', status: 'Played' },
  ];
  return (
    <div>
      <SectionTitle>Recent Announcements</SectionTitle>
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-[13px]">
          <thead><tr className="border-b border-line bg-neutralst-50/80 text-2xs uppercase tracking-wide text-ink-500"><th className="px-3 py-2">Time</th><th className="px-3 py-2">Type</th><th className="px-3 py-2">Amount</th><th className="px-3 py-2">Status</th></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-neutralst-50/60">
                <td className="px-3 py-2 font-mono text-xs text-ink-500">{r.time}</td>
                <td className="px-3 py-2 text-ink-800">{r.type}</td>
                <td className="px-3 py-2 font-semibold tabular-nums text-ink-900">{r.amount}</td>
                <td className="px-3 py-2"><Badge tone="green">{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function FirmwareTab({ device }: { device: typeof DEVICES[0] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-line p-4">
        <SectionTitle>Firmware</SectionTitle>
        <div className="flex items-center justify-between rounded-lg bg-neutralst-50 px-3 py-3">
          <div>
            <div className="text-2xs text-ink-500">Current version</div>
            <div className="font-mono text-lg font-bold text-ink-900">{device.firmware}</div>
          </div>
          <ChevronRight className="text-ink-300" />
          <div>
            <div className="text-2xs text-ink-500">Latest available</div>
            <div className="font-mono text-lg font-bold text-brand-600">v2.5.0</div>
          </div>
        </div>
        {device.firmware !== 'v2.5.0' ? (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-warn-100 bg-warn-50 px-3 py-2.5">
            <span className="text-[13px] text-warn-700">Update available</span>
            <Button size="sm" variant="primary"><HardDriveDownload size={13} /> Push v2.5.0</Button>
          </div>
        ) : (
          <div className="mt-3 rounded-lg border border-ok-100 bg-ok-50 px-3 py-2.5 text-[13px] text-ok-700">Device is on the latest firmware.</div>
        )}
      </div>
      <div className="rounded-lg border border-line p-4">
        <SectionTitle>Firmware History</SectionTitle>
        <div className="space-y-2 text-[13px]">
          {[['v2.4.1', '12 Aug 2026', 'Success'], ['v2.4.0', '22 Jul 2026', 'Success'], ['v2.3.8', '30 Jun 2026', 'Success']].map(([v, d, s]) => (
            <div key={v} className="flex items-center justify-between border-b border-line pb-2 last:border-0">
              <span className="font-mono font-medium text-ink-800">{v}</span>
              <span className="text-ink-500">{d}</span>
              <Badge tone="green">{s}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function MerchantTab({ device }: { device: typeof DEVICES[0] }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-line p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Store size={20} /></span>
          <div>
            <div className="text-sm font-semibold text-ink-900">{device.merchant}</div>
            <div className="font-mono text-xs text-ink-500">{device.merchantId}</div>
          </div>
        </div>
        <div className="mt-4 space-y-2.5">
          <MiniStat label="Category" value={device.merchantCategory} />
          <MiniStat label="Region" value={device.region} />
          <MiniStat label="KYC Status" value="Verified" />
          <MiniStat label="Assigned since" value={device.activationDate} />
        </div>
        <Link to={`/merchants/${device.merchantId}`} className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-brand-600 hover:underline">
          View merchant profile <ChevronRight size={14} />
        </Link>
      </div>
      <div className="rounded-lg border border-line p-4">
        <SectionTitle>Mapping History</SectionTitle>
        <div className="space-y-2.5 text-[13px]">
          {[['Assigned to ' + device.merchant, device.activationDate, 'Santosh Kumar'], ['Dispatched from Gurugram DC', '2026-06-18', 'System'], ['Provisioned', '2026-06-15', 'System']].map(([t, d, u], i) => (
            <div key={i} className="flex items-start gap-2 border-b border-line pb-2 last:border-0">
              <div className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-400" />
              <div className="flex-1">
                <div className="text-ink-800">{t}</div>
                <div className="text-2xs text-ink-400">{d} · {u}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function TicketsTab({ device }: { device: typeof DEVICES[0] }) {
  const rows = [
    { id: 'TKT-9102', subject: 'Low volume complaint', status: 'in_progress', pr: 'high' },
    { id: 'TKT-8890', subject: 'Device not announcing payments', status: 'resolved', pr: 'critical' },
  ];
  return (
    <div>
      <SectionTitle>Linked Tickets</SectionTitle>
      <div className="space-y-2">
        {rows.map((t) => (
          <Link to="/tickets" key={t.id} className="flex items-center gap-3 rounded-lg border border-line px-3 py-2.5 hover:border-line-strong hover:bg-neutralst-50/50">
            <LifeBuoy size={16} className="text-ink-400" />
            <span className="font-mono text-xs font-semibold text-brand-600">{t.id}</span>
            <span className="flex-1 text-[13px] text-ink-800">{t.subject}</span>
            <Badge tone={t.status === 'resolved' ? 'green' : 'amber'}>{t.status === 'resolved' ? 'Resolved' : 'In Progress'}</Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
function AuditTab({ device }: { device: typeof DEVICES[0] }) {
  const rows = [
    { user: 'Santosh Kumar', action: 'Changed volume', before: '50', after: '70', time: '20 Aug 2026, 10:42 AM' },
    { user: 'Priya Nair', action: 'Reboot device', before: '—', after: '—', time: '20 Aug 2026, 09:15 AM' },
    { user: 'System', action: 'Firmware push', before: 'v2.4.0', after: 'v2.4.1', time: '12 Aug 2026, 02:10 AM' },
  ];
  return (
    <div>
      <SectionTitle>Audit Trail</SectionTitle>
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full text-left text-[13px]">
          <thead><tr className="border-b border-line bg-neutralst-50/80 text-2xs uppercase tracking-wide text-ink-500"><th className="px-3 py-2">User</th><th className="px-3 py-2">Action</th><th className="px-3 py-2">Before</th><th className="px-3 py-2">After</th><th className="px-3 py-2 text-right">When</th></tr></thead>
          <tbody className="divide-y divide-line">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-neutralst-50/60">
                <td className="px-3 py-2 font-medium text-ink-800">{r.user}</td>
                <td className="px-3 py-2 text-ink-700">{r.action}</td>
                <td className="px-3 py-2 font-mono text-xs text-ink-500">{r.before}</td>
                <td className="px-3 py-2 font-mono text-xs text-ink-900">{r.after}</td>
                <td className="px-3 py-2 text-right text-2xs text-ink-400">{r.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ shared
function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('mb-2.5 text-xs font-semibold uppercase tracking-wide text-ink-500', className)}>{children}</h3>;
}
function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}
