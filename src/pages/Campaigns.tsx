import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Plus, Play, Pause, Music, Target, Calendar, TrendingUp, LayoutGrid, List, X, ChevronRight, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button, StatusBadge, Badge, Progress, SegmentedControl } from '@/components/ui/primitives';
import { Tabs } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/overlay';
import { AreaTrend, BarTrend } from '@/components/charts/Charts';
import { CAMPAIGNS, AUDIO_ASSETS, healthTrend, REGIONS, DEVICE_GROUPS } from '@/data/mock';
import { Layers } from 'lucide-react';
import type { Campaign, CampaignStatus } from '@/types';
import { campaignTone } from '@/lib/status';
import { cn, fmt, pct } from '@/lib/utils';

const TABS: { value: CampaignStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'draft', label: 'Draft' }, { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' }, { value: 'scheduled', label: 'Scheduled' }, { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Completed' }, { value: 'rejected', label: 'Rejected' },
];

export default function Campaigns() {
  const [tab, setTab] = useState<CampaignStatus | 'all'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [wizard, setWizard] = useState(false);
  const rows = tab === 'all' ? CAMPAIGNS : CAMPAIGNS.filter((c) => c.status === tab);

  return (
    <div>
      <PageHeader title="Campaigns" subtitle="Create, schedule and track audio announcement campaigns across the fleet"
        actions={<><SegmentedControl value={view} onChange={setView} options={[{ value: 'grid', label: <LayoutGrid size={13} /> }, { value: 'list', label: <List size={13} /> }]} /><Button variant="primary" onClick={() => setWizard(true)}><Plus size={14} /> Create Campaign</Button></>} />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Live Now" value={CAMPAIGNS.filter((c) => c.status === 'live').length} icon={<Play size={15} />} tone="ok" />
        <Stat label="Pending Approval" value={CAMPAIGNS.filter((c) => c.status === 'pending').length} icon={<Megaphone size={15} />} tone="warn" />
        <Stat label="Total Plays (30d)" value="1.28M" icon={<TrendingUp size={15} />} tone="brand" />
        <Stat label="Avg Completion" value="89.4%" icon={<CheckCircle2 size={15} />} tone="default" />
      </div>

      <Card>
        <div className="px-3 pt-1"><Tabs value={tab} onChange={setTab} tabs={TABS.map((t) => ({ ...t, count: t.value === 'all' ? CAMPAIGNS.length : CAMPAIGNS.filter((c) => c.status === t.value).length }))} /></div>
        <div className="p-3">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map((c) => <CampaignCard key={c.id} c={c} />)}
            </div>
          ) : (
            <CampaignList rows={rows} />
          )}
        </div>
      </Card>

      <CreateCampaignWizard open={wizard} onClose={() => setWizard(false)} />
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: React.ReactNode; icon: React.ReactNode; tone: string }) {
  const cls: Record<string, string> = { ok: 'text-ok-600 bg-ok-50', warn: 'text-warn-600 bg-warn-50', brand: 'text-brand-600 bg-brand-50', default: 'text-ink-500 bg-neutralst-100' };
  return <Card className="flex items-center gap-3 px-4 py-3"><span className={cn('flex h-9 w-9 items-center justify-center rounded-lg', cls[tone])}>{icon}</span><div><div className="text-xl font-bold tabular-nums text-ink-900">{value}</div><div className="text-2xs text-ink-500">{label}</div></div></Card>;
}

function CampaignCard({ c }: { c: Campaign }) {
  const t = campaignTone(c.status);
  const live = c.status === 'live';
  return (
    <div className="group flex flex-col rounded-lg border border-line p-3.5 transition-all hover:border-line-strong hover:shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink-900">{c.name}</div>
          <div className="mt-0.5 font-mono text-2xs text-ink-400">{c.id} · {c.createdBy}</div>
        </div>
        <StatusBadge tone={t} pulse={live} />
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-neutralst-50 px-2.5 py-1.5">
        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white"><Play size={12} className="ml-0.5" /></button>
        <div className="min-w-0 flex-1"><div className="truncate text-xs font-medium text-ink-800">{c.audio}</div><div className="text-2xs text-ink-400">{c.language}</div></div>
        <span className="font-mono text-2xs text-ink-400">0:18</span>
      </div>
      {live || c.status === 'completed' ? (
        <>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            <Mini label="Devices" value={fmt(c.targetDevices)} />
            <Mini label="Plays" value={c.plays > 9999 ? `${(c.plays / 1000).toFixed(0)}k` : fmt(c.plays)} />
            <Mini label="Reach" value={pct(c.reach)} />
            <Mini label="Done" value={pct(c.completion)} />
          </div>
          <div className="mt-2.5"><Progress value={c.completion} tone={c.status === 'completed' ? 'ok' : 'brand'} size="sm" /></div>
        </>
      ) : (
        <div className="mt-3 flex items-center gap-4 text-2xs text-ink-500">
          <span className="flex items-center gap-1"><Target size={12} /> {c.targetDevices ? fmt(c.targetDevices) : '—'} devices</span>
          <span className="flex items-center gap-1"><Calendar size={12} /> {c.start || 'Not scheduled'}</span>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between border-t border-line pt-2.5">
        <span className="text-2xs text-ink-400">{c.priority === 'override' ? 'Override priority' : c.priority === 'high' ? 'High priority' : 'Standard'}</span>
        <button className="flex items-center gap-0.5 text-2xs font-medium text-brand-600 hover:underline">Details <ChevronRight size={12} /></button>
      </div>
    </div>
  );
}
function Mini({ label, value }: { label: string; value: string }) {
  return <div><div className="text-sm font-bold tabular-nums text-ink-900">{value}</div><div className="text-[10px] text-ink-400">{label}</div></div>;
}

function CampaignList({ rows }: { rows: Campaign[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full text-left text-[13px]">
        <thead><tr className="border-b border-line bg-neutralst-50/80 text-2xs uppercase tracking-wide text-ink-500">
          {['Campaign', 'Audio', 'Target', 'Schedule', 'Status', 'Reach', 'Completion'].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}
        </tr></thead>
        <tbody className="divide-y divide-line">
          {rows.map((c) => (
            <tr key={c.id} className="hover:bg-neutralst-50/60">
              <td className="px-3 py-2"><div className="font-medium text-ink-900">{c.name}</div><div className="font-mono text-2xs text-ink-400">{c.id}</div></td>
              <td className="px-3 py-2 text-ink-600">{c.language}</td>
              <td className="px-3 py-2 tabular-nums text-ink-700">{c.targetDevices ? fmt(c.targetDevices) : '—'}</td>
              <td className="px-3 py-2 text-ink-500">{c.start || '—'}</td>
              <td className="px-3 py-2"><StatusBadge tone={campaignTone(c.status)} /></td>
              <td className="px-3 py-2 tabular-nums text-ink-700">{c.reach ? pct(c.reach) : '—'}</td>
              <td className="px-3 py-2 w-28">{c.completion ? <Progress value={c.completion} size="sm" tone="ok" /> : <span className="text-ink-400">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------------------------------------------------------------------ Wizard
const STEPS = ['Content', 'Targeting', 'Schedule', 'Priority', 'Review'];
function CreateCampaignWizard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [target, setTarget] = useState('Region');
  const [pickedGroups, setPickedGroups] = useState<string[]>(['GRP-005']);
  const reset = () => { setStep(0); setTarget('Region'); setPickedGroups(['GRP-005']); onClose(); };
  const toggleGroup = (id: string) => setPickedGroups((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));
  return (
    <Modal open={open} onClose={reset} size="xl" title="Create Campaign" subtitle="Design and schedule an audio announcement campaign"
      footer={
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-ink-500">Step {step + 1} of {STEPS.length}</span>
          <div className="flex gap-2">
            {step > 0 && <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>}
            {step < STEPS.length - 1 ? <Button variant="primary" onClick={() => setStep((s) => s + 1)}>Continue</Button> : <Button variant="primary" onClick={reset}>Submit for Airtel Approval</Button>}
          </div>
        </div>
      }>
      {/* Stepper */}
      <div className="mb-5 flex items-center">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-2xs font-bold', i < step ? 'bg-ok-500 text-white' : i === step ? 'bg-brand-600 text-white' : 'bg-neutralst-100 text-ink-400')}>
                {i < step ? <CheckCircle2 size={15} /> : i + 1}
              </span>
              <span className={cn('text-2xs font-medium', i <= step ? 'text-ink-800' : 'text-ink-400')}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn('mx-2 h-0.5 flex-1 rounded', i < step ? 'bg-ok-500' : 'bg-line')} />}
          </div>
        ))}
      </div>

      <div className="min-h-[240px]">
        {step === 0 && (
          <div>
            <h4 className="mb-2 text-[13px] font-semibold text-ink-800">Select approved audio</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {AUDIO_ASSETS.filter((a) => a.status === 'approved').map((a) => (
                <label key={a.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 hover:border-brand-300 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
                  <input type="radio" name="audio" className="text-brand-600" />
                  <Music size={15} className="text-ink-400" />
                  <div className="flex-1"><div className="text-[13px] font-medium text-ink-900">{a.name}</div><div className="text-2xs text-ink-400">{a.language} · {a.durationSec}s · {a.category}</div></div>
                </label>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <h4 className="mb-2 text-[13px] font-semibold text-ink-800">Target audience</h4>
            <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {['All Devices', 'Region', 'State', 'Device Group', 'Merchant Category', 'Merchant List', 'Specific Devices'].map((o) => (
                <label key={o} onClick={() => setTarget(o)} className={cn('flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-[13px]', target === o ? 'border-brand-400 bg-brand-50' : 'border-line hover:border-brand-300')}>
                  <input type="radio" name="target" checked={target === o} onChange={() => setTarget(o)} className="text-brand-600" />
                  {o === 'Device Group' && <Layers size={13} className="text-ink-400" />} {o}
                </label>
              ))}
            </div>
            {target === 'Device Group' ? (
              <div className="rounded-lg border border-line p-3">
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
                <div className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-[13px] text-brand-700">Estimated reach: <span className="font-bold">{fmt(DEVICE_GROUPS.filter((g) => pickedGroups.includes(g.id)).reduce((a, g) => a + g.devices, 0))} devices</span> across {pickedGroups.length} group{pickedGroups.length !== 1 ? 's' : ''}</div>
              </div>
            ) : (
              <div className="rounded-lg border border-line p-3">
                <div className="mb-2 text-2xs font-semibold uppercase tracking-wide text-ink-500">{target === 'Region' || target === 'State' ? 'Select regions' : `Refine ${target.toLowerCase()}`}</div>
                <div className="flex flex-wrap gap-1.5">
                  {REGIONS.map((r, i) => <span key={r.id} className={cn('cursor-pointer rounded-md border px-2 py-1 text-2xs font-medium', i < 3 ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-line text-ink-600')}>{r.name}</span>)}
                </div>
                <div className="mt-3 rounded-md bg-brand-50 px-3 py-2 text-[13px] text-brand-700">Estimated reach: <span className="font-bold">8,420 devices</span> across 3 regions</div>
              </div>
            )}
          </div>
        )}
        {step === 2 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[['Start Date', 'date', '2026-08-24'], ['End Date', 'date', '2026-08-30'], ['Time Window Start', 'time', '09:00'], ['Time Window End', 'time', '21:00']].map(([l, t, v]) => (
              <div key={l}><label className="text-[13px] font-medium text-ink-700">{l}</label><input type={t} defaultValue={v} className="mt-1 h-9 w-full rounded-lg border border-line-strong px-2.5 text-sm outline-none focus-visible:focus-ring" /></div>
            ))}
            <div className="sm:col-span-2"><label className="text-[13px] font-medium text-ink-700">Repeat frequency</label>
              <select className="mt-1 h-9 w-full rounded-lg border border-line-strong px-2.5 text-sm outline-none"><option>Every payment announcement</option><option>Once per hour</option><option>Twice per day</option></select>
            </div>
          </div>
        )}
        {step === 3 && (
          <div>
            <h4 className="mb-2 text-[13px] font-semibold text-ink-800">Priority relative to transaction announcements</h4>
            <div className="space-y-2">
              {[['Standard', 'Plays in normal rotation, never interrupts a payment announcement', true], ['High', 'Prioritised in the queue but still yields to payment confirmations', false], ['Override', 'Reserved for critical announcements — requires elevated approval', false]].map(([l, d, def]) => (
                <label key={l as string} className="flex cursor-pointer items-start gap-3 rounded-lg border border-line px-3 py-2.5 hover:border-brand-300 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
                  <input type="radio" name="pri" defaultChecked={def as boolean} className="mt-0.5 text-brand-600" />
                  <div><div className="text-[13px] font-semibold text-ink-900">{l}</div><div className="text-xs text-ink-500">{d}</div></div>
                </label>
              ))}
            </div>
          </div>
        )}
        {step === 4 && (
          <div className="rounded-lg border border-line">
            <div className="border-b border-line bg-neutralst-50 px-4 py-2.5 text-[13px] font-semibold text-ink-800">Campaign Summary</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-0 p-4 text-[13px]">
              {[['Audio', 'Tamil New Merchant Drive'], ['Language', 'Tamil'], ['Target', target === 'Device Group' ? `${pickedGroups.length} device group${pickedGroups.length !== 1 ? 's' : ''} · ${fmt(DEVICE_GROUPS.filter((g) => pickedGroups.includes(g.id)).reduce((a, g) => a + g.devices, 0))} devices` : '8,420 devices · 3 regions'], ['Schedule', '24 Aug – 30 Aug 2026'], ['Time Window', '09:00 – 21:00'], ['Priority', 'Standard'], ['Repeat', 'Every announcement'], ['Approval', 'Airtel required']].map(([k, v], i) => (
                <div key={k} className={cn('flex justify-between py-2', i < 6 && 'border-b border-line')}><span className="text-ink-500">{k}</span><span className="font-medium text-ink-900">{v}</span></div>
              ))}
            </div>
            <div className="m-4 flex items-center gap-2 rounded-lg bg-warn-50 px-3 py-2 text-[13px] text-warn-700"><Megaphone size={15} /> This campaign will be submitted to Airtel Payments Bank for approval before going live.</div>
          </div>
        )}
      </div>
    </Modal>
  );
}
