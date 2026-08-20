import { useState } from 'react';
import { CheckSquare, Play, Check, X, MessageSquareWarning, Target, Clock, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button, StatusBadge, Badge } from '@/components/ui/primitives';
import { Modal } from '@/components/ui/overlay';
import { CAMPAIGNS } from '@/data/mock';
import { campaignTone } from '@/lib/status';
import { fmt, shortAgo } from '@/lib/utils';

export default function Approvals() {
  const pending = CAMPAIGNS.filter((c) => c.status === 'pending');
  const [reject, setReject] = useState<string | null>(null);

  return (
    <div>
      <PageHeader title="Campaign Approval Queue" subtitle="Airtel Payments Bank review — approve, reject or request changes to submitted campaigns"
        meta={<Badge tone="amber">{pending.length} awaiting review</Badge>} />

      <div className="space-y-3">
        {pending.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
              <div className="flex flex-1 items-start gap-3">
                <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700"><Play size={16} className="ml-0.5" /></button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="text-sm font-semibold text-ink-900">{c.name}</span><StatusBadge tone={campaignTone(c.status)} /></div>
                  <div className="mt-0.5 text-2xs text-ink-400">{c.id} · {c.audio} · {c.language}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-ink-500">
                    <span className="flex items-center gap-1"><Target size={12} /> {fmt(c.targetDevices)} devices</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {c.start} → {c.end}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> Submitted {shortAgo(c.submittedMins ?? 0)} ago by {c.createdBy}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 lg:shrink-0">
                <Button variant="secondary" size="sm" onClick={() => setReject(c.id)}><MessageSquareWarning size={14} /> Request Changes</Button>
                <Button variant="danger" size="sm" onClick={() => setReject(c.id)}><X size={14} /> Reject</Button>
                <Button variant="primary" size="sm"><Check size={14} /> Approve</Button>
              </div>
            </div>
          </Card>
        ))}
        {pending.length === 0 && <Card><div className="p-10 text-center text-ink-500">No campaigns awaiting approval.</div></Card>}
      </div>

      <Modal open={!!reject} onClose={() => setReject(null)} size="md" title="Reject / Request Changes" subtitle="Provide comments so the campaign creator can revise and resubmit"
        footer={<><Button variant="secondary" onClick={() => setReject(null)}>Cancel</Button><Button variant="danger" onClick={() => setReject(null)}>Submit Response</Button></>}>
        <label className="text-[13px] font-medium text-ink-700">Reason / comments <span className="text-danger-500">*</span></label>
        <textarea rows={4} placeholder="Explain what needs to change before this campaign can be approved…" className="mt-1.5 w-full rounded-lg border border-line-strong px-3 py-2 text-[13px] outline-none focus-visible:focus-ring" />
        <p className="mt-2 text-2xs text-ink-400">Comments are required when rejecting or requesting changes. The creator will be notified.</p>
      </Modal>
    </div>
  );
}
