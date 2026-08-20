import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Timer, Paperclip, Send, Cpu, Store, Radio, Battery, Signal, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, Button, StatusBadge, Badge, Avatar } from '@/components/ui/primitives';
import { TICKETS, DEVICES } from '@/data/mock';
import { ticketTone, severityTone, deviceTone } from '@/lib/status';
import { cn, slaLabel } from '@/lib/utils';

export default function TicketDetail() {
  const { id } = useParams();
  const ticket = TICKETS.find((t) => t.id === id) ?? TICKETS[0];
  const device = DEVICES.find((d) => d.id === ticket.deviceId) ?? DEVICES[0];
  const sla = slaLabel(ticket.slaMins);

  const timeline = [
    { who: 'Merchant', name: ticket.merchant, time: '3h ago', text: 'The soundbox stopped announcing payments since this morning. Customers are confused.', type: 'in' },
    { who: 'Agent', name: ticket.assignee, time: '2h ago', text: 'Thanks for reporting. I can see the device is online but volume is set very low. Sending a remote volume command now.', type: 'out' },
    { who: 'System', name: 'System', time: '2h ago', text: 'Command "Set Volume → 80" executed successfully on ' + device.id, type: 'sys' },
    { who: 'Agent', name: ticket.assignee, time: '1h ago', text: 'Volume has been restored. Could you confirm announcements are now audible?', type: 'out' },
  ];

  return (
    <div>
      <div className="mb-3 flex items-center gap-1 text-xs text-ink-500">
        <Link to="/tickets" className="hover:text-ink-800">Tickets</Link>
        <ChevronRight size={13} className="text-ink-300" />
        <span className="font-mono font-medium text-ink-700">{ticket.id}</span>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-ink-900">{ticket.subject}</h1>
            <StatusBadge tone={ticketTone(ticket.status)} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-[13px] text-ink-500">
            <span className="font-mono">{ticket.id}</span><span className="text-ink-300">·</span>
            <StatusBadge tone={severityTone(ticket.priority)} /><span className="text-ink-300">·</span>
            <span>{ticket.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="secondary" size="sm">Reassign</Button>
          <Button variant="secondary" size="sm">Escalate</Button>
          <Button variant="primary" size="sm">Resolve</Button>
        </div>
      </div>

      {/* SLA banner */}
      <div className={cn('mb-4 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium', sla.breached ? 'border-danger-100 bg-danger-50 text-danger-700' : 'border-warn-100 bg-warn-50 text-warn-700')}>
        {sla.breached ? <AlertTriangle size={15} /> : <Timer size={15} />}
        {sla.breached ? `SLA breached — ${sla.text}` : `SLA breach in ${sla.text}`}
        <span className="ml-auto font-mono text-2xs opacity-70">Priority SLA: {ticket.priority === 'critical' ? '2h' : ticket.priority === 'high' ? '4h' : '8h'}</span>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        {/* Left: ticket info */}
        <Card className="lg:col-span-1">
          <CardHeader title="Ticket Information" />
          <div className="space-y-3 p-4 text-[13px]">
            {[['Priority', null], ['Status', null], ['Assignee', ticket.assignee], ['Region', ticket.region], ['Category', ticket.category], ['Created', '3h ago']].map(([k, v], i) => (
              <div key={k as string} className="flex items-center justify-between">
                <span className="text-ink-500">{k}</span>
                {k === 'Priority' ? <StatusBadge tone={severityTone(ticket.priority)} /> : k === 'Status' ? <StatusBadge tone={ticketTone(ticket.status)} /> : <span className="font-medium text-ink-900">{v}</span>}
              </div>
            ))}
          </div>
        </Card>

        {/* Center: conversation */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader title="Conversation" subtitle="Timeline of updates and actions" />
          <div className="flex-1 space-y-4 p-4">
            {timeline.map((m, i) => (
              <div key={i} className={cn('flex gap-2.5', m.type === 'out' && 'flex-row-reverse')}>
                {m.type === 'sys' ? (
                  <div className="mx-auto flex items-center gap-2 rounded-full bg-neutralst-100 px-3 py-1 text-2xs text-ink-500"><Radio size={12} /> {m.text} · {m.time}</div>
                ) : (
                  <>
                    <Avatar initials={m.name.split(' ').map((s) => s[0]).slice(0, 2).join('')} size="sm" />
                    <div className={cn('max-w-[80%] rounded-xl px-3 py-2', m.type === 'out' ? 'bg-brand-600 text-white' : 'bg-neutralst-50 text-ink-800')}>
                      <div className={cn('mb-0.5 flex items-center gap-2 text-2xs', m.type === 'out' ? 'text-brand-100' : 'text-ink-400')}>
                        <span className="font-semibold">{m.name}</span><span>{m.time}</span>
                      </div>
                      <p className="text-[13px] leading-snug">{m.text}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-line p-3">
            <div className="flex items-center gap-2 rounded-lg border border-line-strong px-3 py-2">
              <input placeholder="Type a reply…" className="flex-1 bg-transparent text-[13px] outline-none" />
              <button className="text-ink-400 hover:text-ink-600"><Paperclip size={16} /></button>
              <Button size="sm" variant="primary"><Send size={13} /> Send</Button>
            </div>
          </div>
        </Card>

        {/* Right: linked context */}
        <div className="space-y-3 lg:col-span-1">
          <Card>
            <CardHeader title="Linked Device" />
            <Link to={`/devices/${device.id}`} className="block p-4 hover:bg-neutralst-50/50">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white"><Cpu size={16} /></span>
                <div><div className="font-mono text-[13px] font-semibold text-ink-900">{device.id}</div><StatusBadge tone={deviceTone(device.status)} /></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-2xs">
                <div className="flex items-center gap-1 text-ink-600"><Battery size={12} /> {device.battery}%</div>
                <div className="flex items-center gap-1 text-ink-600"><Signal size={12} /> {device.signal}/4</div>
              </div>
            </Link>
          </Card>
          <Card>
            <CardHeader title="Linked Merchant" />
            <Link to={`/merchants/${device.merchantId}`} className="flex items-center gap-2.5 p-4 hover:bg-neutralst-50/50">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Store size={16} /></span>
              <div><div className="text-[13px] font-semibold text-ink-900">{device.merchant}</div><div className="font-mono text-2xs text-ink-400">{device.merchantId}</div></div>
            </Link>
          </Card>
          <Card>
            <CardHeader title="Recent Alerts" />
            <div className="space-y-1.5 p-3 text-2xs">
              <div className="flex items-center gap-1.5 rounded-md bg-warn-50 px-2 py-1.5 text-warn-700"><AlertTriangle size={12} /> Low battery 18% · 2h ago</div>
              <div className="flex items-center gap-1.5 rounded-md bg-neutralst-50 px-2 py-1.5 text-ink-600"><Radio size={12} /> Connectivity warning · 1d ago</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
