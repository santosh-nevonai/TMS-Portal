// ============================================================================
// NevonAI Assistant service
// ----------------------------------------------------------------------------
// This is the single integration seam for the assistant. Today it returns a
// deterministic, fleet-aware MOCK reply so the UI is fully interactive.
//
// LATER — wire up the Anthropic (Claude) API here. Do NOT call Anthropic
// directly from the browser: the API key must never ship to the client.
// Instead POST to our own backend, which proxies to Anthropic:
//
//   export async function sendAssistantMessage(history: ChatMessage[]): Promise<string> {
//     const res = await fetch('/api/assistant', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ messages: history.map(({ role, content }) => ({ role, content })) }),
//     });
//     const data = await res.json();
//     return data.reply;
//   }
//
// The backend would use @anthropic-ai/sdk with the Messages API, a system
// prompt describing the fleet domain, and tool definitions that let Claude
// query live device/alert/ticket data (get_fleet_summary, list_offline_devices,
// etc.). Streaming can be layered on via SSE without changing this signature.
// ============================================================================

import {
  FLEET,
  ALERTS,
  DEVICES,
  CAMPAIGNS,
  TICKET_SNAPSHOT,
  REGIONS,
  OTA_ROLLOUTS,
  FIRMWARE_DISTRIBUTION,
} from '@/data/mock';
import { fmt, pct } from '@/lib/utils';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
  pending?: boolean;
}

export const ASSISTANT = {
  name: 'NevonAI Assistant',
  tagline: 'Your fleet operations copilot',
  model: 'Claude (Anthropic) — integration pending',
};

export const SUGGESTED_PROMPTS: { label: string; prompt: string }[] = [
  { label: 'Fleet status', prompt: 'Give me a quick summary of fleet health right now.' },
  { label: 'Offline devices', prompt: 'How many devices are offline and where?' },
  { label: 'Critical alerts', prompt: 'Summarize the critical alerts I should act on.' },
  { label: 'Low battery', prompt: 'Which devices have low battery?' },
  { label: 'Ticket load', prompt: 'How is the support ticket queue doing against SLA?' },
  { label: 'Campaigns', prompt: 'Which campaigns are live and how are they performing?' },
  { label: 'OTA rollouts', prompt: 'What is the status of firmware rollouts?' },
  { label: 'Worst regions', prompt: 'Which regions have the most problems?' },
];

// ----------------------------------------------------------------------------
// Deterministic mock "reasoning" over the fleet mock data.
// Replace the body of sendAssistantMessage() with the API proxy call above.
// ----------------------------------------------------------------------------
function mockReply(input: string): string {
  const q = input.toLowerCase();

  const has = (...terms: string[]) => terms.some((t) => q.includes(t));

  if (has('offline')) {
    const worst = [...REGIONS].sort((a, b) => b.offline - a.offline).slice(0, 3);
    return [
      `**${fmt(FLEET.offline)} devices** are currently offline (${pct((FLEET.offline / FLEET.total) * 100)} of the fleet).`,
      '',
      'Regions with the most offline devices:',
      ...worst.map((r) => `- **${r.name}** — ${fmt(r.offline)} offline of ${fmt(r.devices)}`),
      '',
      `${FLEET.criticalAlerts} of these have been offline for more than 24h and are flagged critical. Want me to open the filtered device list or draft a support ticket batch?`,
    ].join('\n');
  }

  if (has('battery')) {
    return [
      `**${fmt(FLEET.lowBattery)} devices** are below the 20% battery threshold.`,
      '',
      'Recommended next steps:',
      '- Notify the assigned merchants to keep devices on charge',
      '- Add them to the **Low-battery Watchlist** device group for monitoring',
      '- Raise proactive tickets for any that have been low for >30 min',
      '',
      'I can open Devices filtered to `battery < 20%` for you.',
    ].join('\n');
  }

  if (has('critical', 'alert')) {
    const crit = ALERTS.filter((a) => a.severity === 'critical').slice(0, 4);
    return [
      `There are **${FLEET.criticalAlerts} critical alerts** open right now. Top items:`,
      '',
      ...crit.map((a) => `- **${a.type}** — ${a.deviceId} (${a.merchant}, ${a.region})`),
      '',
      'The most common critical cause is devices offline >24h. Shall I acknowledge these or assign them to an operator?',
    ].join('\n');
  }

  if (has('ticket', 'sla', 'support')) {
    return [
      `Support queue snapshot:`,
      '',
      `- **${TICKET_SNAPSHOT.open} open tickets** (${TICKET_SNAPSHOT.critical} critical, ${TICKET_SNAPSHOT.high} high)`,
      `- **${TICKET_SNAPSHOT.slaBreached} tickets have breached SLA** — these need immediate attention`,
      `- **${TICKET_SNAPSHOT.dueToday} due today**`,
      '',
      'SLA compliance is holding around 93%. Want me to list the breached tickets by region?',
    ].join('\n');
  }

  if (has('campaign')) {
    const live = CAMPAIGNS.filter((c) => c.status === 'live');
    return [
      `**${live.length} campaigns are live** right now:`,
      '',
      ...live.map((c) => `- **${c.name}** — ${fmt(c.plays)} plays, ${pct(c.reach)} reach, ${pct(c.completion)} completion`),
      '',
      `${CAMPAIGNS.filter((c) => c.status === 'pending').length} campaigns are awaiting Airtel approval. Want a performance breakdown by region?`,
    ].join('\n');
  }

  if (has('ota', 'firmware', 'rollout', 'update')) {
    const active = OTA_ROLLOUTS.find((r) => r.status === 'in_progress');
    const latest = FIRMWARE_DISTRIBUTION[1];
    return [
      active
        ? `Active rollout **${active.firmware}** is at ${pct((active.success / active.total) * 100, 0)} — ${fmt(active.success)} succeeded, ${fmt(active.failed)} failed, ${fmt(active.pending)} pending.`
        : 'No rollout is currently in progress.',
      '',
      `Fleet firmware baseline is **${FIRMWARE_DISTRIBUTION[0].version}** (${FIRMWARE_DISTRIBUTION[0].pct}% of devices); **${latest.version}** adoption is at ${latest.pct}%.`,
      '',
      'I can target the failed devices for a retry rollout, or scope a new one by device group.',
    ].join('\n');
  }

  if (has('region', 'state', 'worst', 'problem')) {
    const ranked = [...REGIONS]
      .map((r) => ({ r, health: (r.online / r.devices) * 100 }))
      .sort((a, b) => a.health - b.health)
      .slice(0, 4);
    return [
      'Regions ranked by health (lowest first):',
      '',
      ...ranked.map(({ r, health }) => `- **${r.name}** — ${pct(health)} healthy · ${fmt(r.offline)} offline, ${fmt(r.faulty)} faulty`),
      '',
      'Want me to open the device list filtered to the worst region?',
    ].join('\n');
  }

  if (has('summary', 'status', 'health', 'overview', 'how are', "what's up", 'hello', 'hi ', 'hey')) {
    return [
      `Here's your fleet at a glance:`,
      '',
      `- **${fmt(FLEET.total)} total devices**, **${fmt(FLEET.active)} active** (${pct((FLEET.active / FLEET.total) * 100)})`,
      `- **${fmt(FLEET.offline)} offline**, **${fmt(FLEET.faulty)} faulty**, **${fmt(FLEET.lowBattery)} low battery**`,
      `- **${FLEET.criticalAlerts} critical alerts** and **${TICKET_SNAPSHOT.slaBreached} SLA breaches** need attention`,
      `- **${FLEET.activeCampaigns} campaigns** running`,
      '',
      'Ask me about offline devices, alerts, tickets, campaigns, OTA, or a specific region — I can also draft actions for you.',
    ].join('\n');
  }

  // Fallback
  return [
    `I'm your fleet operations copilot. Once connected to the Anthropic (Claude) API I'll answer this using live device, alert, ticket and campaign data.`,
    '',
    'Right now I can help with things like:',
    '- Fleet health summaries and KPIs',
    '- Offline / low-battery / faulty device breakdowns',
    '- Critical alerts and SLA-breaching tickets',
    '- Campaign and OTA rollout status by region or device group',
    '',
    'Try one of the suggested prompts above.',
  ].join('\n');
}

/** Simulated latency so the typing indicator feels real. */
export function sendAssistantMessage(history: ChatMessage[]): Promise<string> {
  const last = [...history].reverse().find((m) => m.role === 'user');
  const reply = mockReply(last?.content ?? '');
  const delay = 500 + Math.min(1400, reply.length * 4);
  return new Promise((resolve) => setTimeout(() => resolve(reply), delay));
}
