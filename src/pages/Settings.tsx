import { useState } from 'react';
import { Building2, Plug, Radio, Bell, ShieldCheck, Palette, Activity, SlidersHorizontal, Paintbrush } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Button, Badge } from '@/components/ui/primitives';
import { ThemeControls } from '@/components/theme/ThemeControls';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Paintbrush },
  { id: 'org', label: 'Organization', icon: Building2 },
  { id: 'airtel', label: 'Airtel Integration', icon: Plug },
  { id: 'iot', label: 'IoT Configuration', icon: Radio },
  { id: 'notif', label: 'Notification Defaults', icon: Bell },
  { id: 'alerts', label: 'Alert Rules', icon: SlidersHorizontal },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'security', label: 'Security', icon: ShieldCheck },
  { id: 'health', label: 'System Health', icon: Activity },
];

export default function Settings() {
  const [active, setActive] = useState('appearance');
  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure organization, integrations, IoT, notifications and security" />
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit p-1.5">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)} className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium', active === s.id ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-neutralst-50')}>
              <s.icon size={15} /> {s.label}
            </button>
          ))}
        </Card>

        <Card className="p-5">
          {active === 'appearance' && (
            <div>
              <h2 className="text-base font-bold text-ink-900">Appearance</h2>
              <p className="mt-0.5 text-[13px] text-ink-500">Personalize the interface. Changes apply instantly and are saved to this browser.</p>
              <div className="mt-5 max-w-md">
                <ThemeControls />
              </div>
            </div>
          )}
          {active === 'org' && (
            <Section title="Organization" desc="Basic details for your Service Provider account.">
              <Row label="Organization name"><input defaultValue="Nevon AI Technologies" className="input" /></Row>
              <Row label="Support email"><input defaultValue="ops@nevonai.com" className="input" /></Row>
              <Row label="Time zone"><select className="input"><option>Asia/Kolkata (IST)</option></select></Row>
              <Row label="Fleet scale"><input defaultValue="24,850 devices" className="input" disabled /></Row>
            </Section>
          )}
          {active === 'airtel' && (
            <Section title="Airtel Integration" desc="Connection to Airtel Payments Bank merchant systems.">
              <StatusRow label="Connection Status" value="Connected" tone="green" />
              <StatusRow label="API Status" value="Operational" tone="green" />
              <Row label="Last Sync"><span className="text-[13px] text-ink-800">6 minutes ago · 4,820 records</span></Row>
              <Row label="Sync Frequency"><select className="input"><option>Every 15 minutes</option><option>Hourly</option></select></Row>
              <StatusRow label="Webhook Status" value="Active" tone="green" />
            </Section>
          )}
          {active === 'iot' && (
            <Section title="IoT Configuration" desc="Device connectivity and telemetry settings (protocol-agnostic).">
              <Row label="Broker endpoint"><input defaultValue="mqtts://iot.nevonfleet.in:8883" className="input font-mono" /></Row>
              <Row label="Heartbeat interval"><select className="input"><option>30 seconds</option><option>60 seconds</option></select></Row>
              <Row label="Telemetry retention"><select className="input"><option>90 days</option><option>30 days</option></select></Row>
              <Row label="Offline threshold"><input defaultValue="5 minutes" className="input" /></Row>
            </Section>
          )}
          {active === 'notif' && (
            <Section title="Notification Defaults" desc="Default channels for platform notifications.">
              {['Critical alerts', 'OTA failures', 'SLA breaches', 'Campaign approvals'].map((n) => (
                <div key={n} className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
                  <span className="text-[13px] text-ink-800">{n}</span>
                  <div className="flex gap-1.5">{['Email', 'SMS', 'Push'].map((c, i) => <Badge key={c} tone={i < 2 ? 'blue' : 'gray'}>{c}</Badge>)}</div>
                </div>
              ))}
            </Section>
          )}
          {(active === 'security') && (
            <Section title="Security" desc="Authentication and session policy.">
              <StatusRow label="SSO (SAML)" value="Enabled" tone="green" />
              <StatusRow label="Multi-factor auth" value="Required" tone="green" />
              <Row label="Session timeout"><select className="input"><option>30 minutes</option><option>1 hour</option></select></Row>
              <Row label="IP allowlist"><input defaultValue="10.20.0.0/16" className="input font-mono" /></Row>
            </Section>
          )}
          {['alerts', 'branding', 'health'].includes(active) && (
            <Section title={SECTIONS.find((s) => s.id === active)!.label} desc="Configuration for this section shares the same design system.">
              <div className="rounded-lg border border-dashed border-line py-10 text-center text-[13px] text-ink-500">Settings for {SECTIONS.find((s) => s.id === active)!.label} appear here.</div>
            </Section>
          )}
        </Card>
      </div>
      <style>{`.input{height:36px;width:100%;max-width:360px;border:1px solid rgb(var(--c-line-strong));background:rgb(var(--c-surface));color:rgb(var(--c-ink-900));border-radius:8px;padding:0 10px;font-size:13px;outline:none}.input:focus{box-shadow:0 0 0 2px rgb(var(--c-brand-500) / .35)}`}</style>
    </div>
  );
}
function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-base font-bold text-ink-900">{title}</h2>
      <p className="mt-0.5 text-[13px] text-ink-500">{desc}</p>
      <div className="mt-4 space-y-3">{children}</div>
      <div className="mt-5 flex gap-2 border-t border-line pt-4"><Button variant="primary">Save Changes</Button><Button variant="secondary">Cancel</Button></div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid grid-cols-1 items-center gap-1 sm:grid-cols-[200px_1fr]"><label className="text-[13px] font-medium text-ink-700">{label}</label><div>{children}</div></div>;
}
function StatusRow({ label, value, tone }: { label: string; value: string; tone: 'green' | 'amber' | 'red' }) {
  return <div className="grid grid-cols-1 items-center gap-1 sm:grid-cols-[200px_1fr]"><span className="text-[13px] font-medium text-ink-700">{label}</span><Badge tone={tone}>{value}</Badge></div>;
}
