import type { DeviceStatus, Severity, CommandStatus, CampaignStatus, TicketStatus } from '@/types';

// Central status-semantics registry (SOW §57). Every status carries a dot color,
// text/bg classes, and an accessible label — never color alone.
type Tone = {
  dot: string;
  text: string;
  bg: string;
  border: string;
  label: string;
  ring: string;
};

const TONES: Record<string, Tone> = {
  green: { dot: 'bg-ok-500', text: 'text-ok-700', bg: 'bg-ok-50', border: 'border-ok-100', ring: 'ring-ok-500/30', label: '' },
  amber: { dot: 'bg-warn-500', text: 'text-warn-700', bg: 'bg-warn-50', border: 'border-warn-100', ring: 'ring-warn-500/30', label: '' },
  red: { dot: 'bg-danger-500', text: 'text-danger-700', bg: 'bg-danger-50', border: 'border-danger-100', ring: 'ring-danger-500/30', label: '' },
  purple: { dot: 'bg-[#9333EA]', text: 'text-[#7E22CE]', bg: 'bg-[#F6EDFE]', border: 'border-[#E9D5FF]', ring: 'ring-[#9333EA]/30', label: '' },
  blue: { dot: 'bg-info-500', text: 'text-info-600', bg: 'bg-info-50', border: 'border-info-100', ring: 'ring-info-500/30', label: '' },
  gray: { dot: 'bg-ink-400', text: 'text-ink-500', bg: 'bg-neutralst-50', border: 'border-line', ring: 'ring-ink-400/30', label: '' },
};

export function deviceTone(s: DeviceStatus): Tone & { label: string } {
  const map: Record<DeviceStatus, [keyof typeof TONES, string]> = {
    online: ['green', 'Online'],
    warning: ['amber', 'Warning'],
    offline: ['red', 'Offline'],
    faulty: ['purple', 'Faulty'],
    inactive: ['gray', 'Inactive'],
  };
  const [tone, label] = map[s];
  return { ...TONES[tone], label };
}

export function severityTone(s: Severity): Tone & { label: string } {
  const map: Record<Severity, [keyof typeof TONES, string]> = {
    critical: ['red', 'Critical'],
    high: ['amber', 'High'],
    medium: ['blue', 'Medium'],
    low: ['gray', 'Low'],
  };
  const [tone, label] = map[s];
  return { ...TONES[tone], label };
}

export function commandTone(s: CommandStatus): Tone & { label: string } {
  const map: Record<CommandStatus, [keyof typeof TONES, string]> = {
    sent: ['blue', 'Sent'],
    pending: ['amber', 'Pending'],
    delivered: ['blue', 'Delivered'],
    executed: ['green', 'Executed'],
    failed: ['red', 'Failed'],
    expired: ['gray', 'Expired'],
  };
  const [tone, label] = map[s];
  return { ...TONES[tone], label };
}

export function campaignTone(s: CampaignStatus): Tone & { label: string } {
  const map: Record<CampaignStatus, [keyof typeof TONES, string]> = {
    draft: ['gray', 'Draft'],
    pending: ['amber', 'Pending Approval'],
    approved: ['blue', 'Approved'],
    scheduled: ['blue', 'Scheduled'],
    live: ['green', 'Live'],
    completed: ['gray', 'Completed'],
    rejected: ['red', 'Rejected'],
  };
  const [tone, label] = map[s];
  return { ...TONES[tone], label };
}

export function ticketTone(s: TicketStatus): Tone & { label: string } {
  const map: Record<TicketStatus, [keyof typeof TONES, string]> = {
    open: ['blue', 'Open'],
    in_progress: ['amber', 'In Progress'],
    pending: ['amber', 'Pending'],
    resolved: ['green', 'Resolved'],
    closed: ['gray', 'Closed'],
  };
  const [tone, label] = map[s];
  return { ...TONES[tone], label };
}

export function kycTone(s: 'verified' | 'pending' | 'rejected') {
  const map = { verified: ['green', 'Verified'], pending: ['amber', 'Pending'], rejected: ['red', 'Rejected'] } as const;
  const [tone, label] = map[s];
  return { ...TONES[tone], label };
}

export function serviceTone(s: 'operational' | 'degraded' | 'down') {
  const map = { operational: ['green', 'Operational'], degraded: ['amber', 'Degraded'], down: ['red', 'Down'] } as const;
  const [tone, label] = map[s];
  return { ...TONES[tone], label };
}
