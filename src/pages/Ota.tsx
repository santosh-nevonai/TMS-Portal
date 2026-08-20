import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HardDriveDownload, Plus, Package, Clock, Loader2, CheckCircle2, XCircle, ChevronRight, Rocket, Layers } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button, StatusBadge, Badge, Progress } from '@/components/ui/primitives';
import { StatCard } from '@/components/ui/StatCard';
import { BarTrend } from '@/components/charts/Charts';
import { Modal } from '@/components/ui/overlay';
import { OTA_ROLLOUTS, OTA_SUMMARY, FIRMWARE_DISTRIBUTION, DEVICE_GROUPS } from '@/data/mock';
import type { OtaRollout } from '@/types';
import { cn, fmt, shortAgo } from '@/lib/utils';

const rolloutStatusTone: Record<OtaRollout['status'], any> = {
  in_progress: { dot: 'bg-info-500', text: 'text-info-600', bg: 'bg-info-50', border: 'border-info-100', label: 'In Progress' },
  paused: { dot: 'bg-warn-500', text: 'text-warn-700', bg: 'bg-warn-50', border: 'border-warn-100', label: 'Paused' },
  completed: { dot: 'bg-ok-500', text: 'text-ok-700', bg: 'bg-ok-50', border: 'border-ok-100', label: 'Completed' },
  failed: { dot: 'bg-danger-500', text: 'text-danger-700', bg: 'bg-danger-50', border: 'border-danger-100', label: 'Failed' },
  scheduled: { dot: 'bg-ink-400', text: 'text-ink-500', bg: 'bg-neutralst-50', border: 'border-line', label: 'Scheduled' },
};

export default function Ota() {
  const navigate = useNavigate();
  const [wizard, setWizard] = useState(false);

  return (
    <div>
      <PageHeader title="Firmware & OTA" subtitle="Manage firmware versions and over-the-air rollouts across the fleet"
        actions={<Button variant="primary" onClick={() => setWizard(true)}><Rocket size={14} /> New Rollout</Button>} />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Current Version" value={OTA_SUMMARY.currentVersion} icon={<Package size={15} />} tone="brand" />
        <StatCard label="Latest Version" value={OTA_SUMMARY.latestVersion} icon={<HardDriveDownload size={15} />} tone="default" />
        <StatCard label="Pending" value={OTA_SUMMARY.pending} icon={<Clock size={15} />} tone="warn" />
        <StatCard label="In Progress" value={OTA_SUMMARY.inProgress} icon={<Loader2 size={15} />} tone="default" />
        <StatCard label="Successful" value={OTA_SUMMARY.success} icon={<CheckCircle2 size={15} />} tone="ok" />
        <StatCard label="Failed" value={OTA_SUMMARY.failed} icon={<XCircle size={15} />} tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Active & Recent Rollouts" subtitle="Firmware deployment campaigns" />
          <div className="divide-y divide-line">
            {OTA_ROLLOUTS.map((r) => {
              const progress = Math.round((r.success / r.total) * 100);
              return (
                <button key={r.id} onClick={() => navigate(`/ota/${r.id}`)} className="flex w-full flex-col gap-2 px-4 py-3 text-left hover:bg-neutralst-50/60 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[13px] font-semibold text-ink-900">{r.firmware}</span>
                      <StatusBadge tone={rolloutStatusTone[r.status]} pulse={r.status === 'in_progress'} />
                      <span className="text-2xs text-ink-400">from {r.fromVersion}</span>
                    </div>
                    <div className="mt-0.5 text-2xs text-ink-400">{r.id} · {r.strategy} · started {shortAgo(r.startedMins)} ago</div>
                  </div>
                  <div className="w-full sm:w-64">
                    <div className="mb-1 flex items-center justify-between text-2xs">
                      <span className="tabular-nums text-ink-500">{fmt(r.success)} / {fmt(r.total)}</span>
                      <span className="font-semibold text-ink-800">{progress}%</span>
                    </div>
                    <Progress value={progress} tone={r.status === 'failed' ? 'danger' : r.status === 'completed' ? 'ok' : 'brand'} size="sm" />
                  </div>
                  <ChevronRight size={16} className="hidden shrink-0 text-ink-300 sm:block" />
                </button>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Firmware Distribution" subtitle="Devices per version across the fleet" />
          <div className="p-4">
            <div className="space-y-2.5">
              {FIRMWARE_DISTRIBUTION.map((f) => (
                <div key={f.version}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-mono font-medium text-ink-800">{f.version}</span>
                    <span className="tabular-nums text-ink-500">{fmt(f.devices)} · {f.pct}%</span>
                  </div>
                  <Progress value={f.pct} tone={f.version === 'v2.5.0' ? 'ok' : 'brand'} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <NewRolloutWizard open={wizard} onClose={() => setWizard(false)} />
    </div>
  );
}

const STEPS = ['Firmware', 'Targets', 'Strategy', 'Schedule', 'Review'];
function NewRolloutWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [confirm, setConfirm] = useState(false);
  const [target, setTarget] = useState('On version < v2.4.1');
  const [pickedGroups, setPickedGroups] = useState<string[]>(['GRP-004']);
  const toggleGroup = (id: string) => setPickedGroups((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  const groupReach = DEVICE_GROUPS.filter((g) => pickedGroups.includes(g.id)).reduce((a, g) => a + g.devices, 0);
  const reach = target === 'By Device Group' ? groupReach : 5240;
  const reset = () => { setStep(0); setConfirm(false); setTarget('On version < v2.4.1'); setPickedGroups(['GRP-004']); onClose(); };
  return (
    <Modal open={open} onClose={reset} size="lg" title="Create OTA Rollout" subtitle="Deploy new firmware to targeted devices with a staged strategy"
      footer={<div className="flex w-full items-center justify-between"><span className="text-xs text-ink-500">Step {step + 1} of {STEPS.length}</span>
        <div className="flex gap-2">{step > 0 && <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>}
          {step < STEPS.length - 1 ? <Button variant="primary" onClick={() => setStep((s) => s + 1)}>Continue</Button> : <Button variant="primary" onClick={() => setConfirm(true)}><Rocket size={14} /> Start Rollout</Button>}</div></div>}>
      <div className="mb-5 flex items-center">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-2xs font-bold', i < step ? 'bg-ok-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-neutralst-100 text-ink-400')}>{i < step ? <CheckCircle2 size={15} /> : i + 1}</span>
              <span className={cn('text-2xs font-medium', i <= step ? 'text-ink-800' : 'text-ink-400')}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn('mx-2 h-0.5 flex-1 rounded', i < step ? 'bg-ok-500' : 'bg-line')} />}
          </div>
        ))}
      </div>
      <div className="min-h-[220px]">
        {step === 0 && <div className="space-y-2">{['v2.5.0 — Latest (recommended)', 'v2.4.1 — Stable', 'v2.4.0 — Previous'].map((v, i) => (
          <label key={v} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50"><input type="radio" name="fw" defaultChecked={i === 0} className="text-brand-600" /><Package size={15} className="text-ink-400" /><span className="text-[13px] font-medium text-ink-900">{v}</span></label>))}</div>}
        {step === 1 && <div><h4 className="mb-2 text-[13px] font-semibold text-ink-800">Target devices</h4><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{['All devices', 'By Region', 'By Device Model', 'By Device Group', 'By Merchant Category', 'Specific devices', 'On version < v2.4.1'].map((o) => (<label key={o} onClick={() => setTarget(o)} className={cn('flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px]', target === o ? 'border-brand-400 bg-brand-50' : 'border-line')}><input type="radio" name="tg" checked={target === o} onChange={() => setTarget(o)} className="text-brand-600" />{o === 'By Device Group' && <Layers size={13} className="text-ink-400" />} {o}</label>))}</div>
          {target === 'By Device Group' ? (
            <div className="mt-3 rounded-lg border border-line p-3">
              <div className="mb-2 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-500"><Layers size={12} /> Select device groups</div>
              <div className="space-y-1.5">
                {DEVICE_GROUPS.map((g) => (
                  <label key={g.id} onClick={() => toggleGroup(g.id)} className={cn('flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2', pickedGroups.includes(g.id) ? 'border-brand-400 bg-brand-50' : 'border-line hover:bg-neutralst-50')}>
                    <input type="checkbox" checked={pickedGroups.includes(g.id)} onChange={() => toggleGroup(g.id)} className="h-3.5 w-3.5 rounded border-line-strong text-brand-600" />
                    <div className="flex-1"><div className="text-[13px] font-medium text-ink-900">{g.name}</div><div className="text-2xs text-ink-400">{g.type === 'dynamic' ? 'Dynamic · ' + g.criteria : 'Static'} · {g.scope}</div></div>
                    <span className="tabular-nums text-2xs font-semibold text-ink-600">{fmt(g.devices)}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-[13px] text-brand-700">Matches <span className="font-bold">{fmt(groupReach)} devices</span> across {pickedGroups.length} group{pickedGroups.length !== 1 ? 's' : ''}</div>
            </div>
          ) : (
            <div className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-[13px] text-brand-700">Matches <span className="font-bold">5,240 devices</span></div>
          )}
        </div>}
        {step === 2 && <div><h4 className="mb-2 text-[13px] font-semibold text-ink-800">Rollout strategy</h4><div className="space-y-2">{[['Canary 10%', 'Deploy to 10% first, then expand after health checks', false], ['Staged 10% → 25% → 50% → 100%', 'Gradual staged rollout with automatic health gating', true], ['Immediate 100%', 'Deploy to all targeted devices at once', false]].map(([l, d, def]) => (<label key={l as string} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line px-3 py-2.5 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50"><input type="radio" name="st" defaultChecked={def as boolean} className="mt-0.5 text-brand-600" /><div><div className="text-[13px] font-semibold text-ink-900">{l}</div><div className="text-xs text-ink-500">{d}</div></div></label>))}</div></div>}
        {step === 3 && <div className="grid grid-cols-2 gap-3"><div><label className="text-[13px] font-medium text-ink-700">Start</label><input type="datetime-local" defaultValue="2026-08-21T02:00" className="mt-1 h-9 w-full rounded-lg border border-line-strong px-2.5 text-sm" /></div><div><label className="text-[13px] font-medium text-ink-700">Maintenance window</label><select className="mt-1 h-9 w-full rounded-lg border border-line-strong px-2.5 text-sm"><option>02:00 – 05:00 IST (low traffic)</option><option>Anytime</option></select></div></div>}
        {step === 4 && <div className="rounded-lg border border-line"><div className="border-b border-line bg-neutralst-50 px-4 py-2.5 text-[13px] font-semibold text-ink-800">Rollout Summary</div><div className="grid grid-cols-2 gap-x-6 p-4 text-[13px]">{[['Firmware', 'v2.5.0'], ['Targets', target === 'By Device Group' ? `${pickedGroups.length} group${pickedGroups.length !== 1 ? 's' : ''} · ${fmt(reach)} devices` : `${fmt(reach)} devices`], ['Strategy', '10% → 25% → 50% → 100%'], ['Start', '21 Aug, 02:00 IST'], ['Rollback', 'Auto on >5% failure'], ['Approval', 'Ops Admin']].map(([k, v], i) => (<div key={k} className={cn('flex justify-between py-2', i < 4 && 'border-b border-line')}><span className="text-ink-500">{k}</span><span className="font-medium text-ink-900">{v}</span></div>))}</div></div>}
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} size="sm" title={`Deploy firmware to ${fmt(reach)} devices?`} subtitle="This begins a staged rollout that cannot be fully undone once devices update."
        footer={<><Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button><Button variant="primary" onClick={reset}>Start Rollout</Button></>}>
        <div className="rounded-lg border border-line bg-canvas px-3 py-2 text-[13px]"><div className="flex justify-between py-1"><span className="text-ink-500">Rollout</span><span className="font-medium text-ink-900">10% → 25% → 50% → 100%</span></div><div className="flex justify-between py-1"><span className="text-ink-500">Firmware</span><span className="font-mono font-medium text-ink-900">v2.5.0</span></div></div>
      </Modal>
    </Modal>
  );
}
