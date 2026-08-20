import { useState } from 'react';
import { Cpu, Tags, Info } from 'lucide-react';
import { Modal } from '@/components/ui/overlay';
import { Button, Badge } from '@/components/ui/primitives';
import { SKUS, REGIONS, DEVICE_GROUPS, MERCHANTS } from '@/data/mock';
import { cn } from '@/lib/utils';

export function AddDeviceForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [skuId, setSkuId] = useState(SKUS[0].id);
  const [groups, setGroups] = useState<string[]>([]);
  const sku = SKUS.find((s) => s.id === skuId)!;

  const toggleGroup = (id: string) => setGroups((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  return (
    <Modal open={open} onClose={onClose} size="lg" title="Add Device" subtitle="Register a new Soundbox device and provision it to the fleet"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={onClose}><Cpu size={14} /> Add Device</Button></>}>
      <div className="space-y-5">
        {/* Identity */}
        <Section title="Device Identity">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Device ID" required><input placeholder="NV-SB-0421" className="fld font-mono" /></Field>
            <Field label="Serial Number" required><input placeholder="SN241421" className="fld font-mono" /></Field>
            <Field label="IMEI" required><input placeholder="8690XXXXXXXXXXX" className="fld font-mono" /></Field>
            <Field label="SIM / ICCID"><input placeholder="8991000XXXXXXXXXX" className="fld font-mono" /></Field>
          </div>
        </Section>

        {/* SKU */}
        <Section title="SKU & Hardware">
          <Field label="SKU" required>
            <select value={skuId} onChange={(e) => setSkuId(e.target.value)} className="fld">
              {SKUS.filter((s) => s.status !== 'eol').map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.code}</option>
              ))}
            </select>
          </Field>
          {/* Auto-derived attributes from SKU */}
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-line bg-neutralst-50/60 px-3 py-2">
            <Tags size={14} className="text-brand-600" />
            <span className="text-2xs text-ink-500">Derived from SKU:</span>
            <Badge>Model {sku.model}</Badge>
            <Badge>{sku.connectivity}</Badge>
            <Badge>{sku.hardware}</Badge>
            <Badge>{sku.batteryMah} mAh</Badge>
            <Badge tone="blue">FW {sku.firmwareBaseline}</Badge>
          </div>
        </Section>

        {/* Assignment */}
        <Section title="Assignment">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Region"><select className="fld">{REGIONS.map((r) => <option key={r.id}>{r.name}</option>)}</select></Field>
            <Field label="Assign to merchant (optional)">
              <select className="fld"><option value="">— Leave unassigned —</option>{MERCHANTS.slice(0, 12).map((m) => <option key={m.id}>{m.name} ({m.id})</option>)}</select>
            </Field>
          </div>
        </Section>

        {/* Device Groups */}
        <Section title="Device Groups (optional)">
          <div className="flex flex-wrap gap-1.5">
            {DEVICE_GROUPS.map((g) => (
              <button key={g.id} onClick={() => toggleGroup(g.id)} type="button"
                className={cn('rounded-md border px-2 py-1 text-2xs font-medium transition-colors', groups.includes(g.id) ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-line text-ink-600 hover:bg-neutralst-50')}>
                {g.name}
              </button>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-2xs text-ink-400"><Info size={12} /> Dynamic groups auto-include this device if it matches their criteria.</p>
        </Section>
      </div>
      <style>{`.fld{height:36px;width:100%;border:1px solid #D6DBE1;border-radius:8px;padding:0 10px;font-size:13px;outline:none;background:#fff}.fld:focus{box-shadow:0 0 0 2px rgba(46,91,230,.35)}`}</style>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">{title}</h3>
      {children}
    </div>
  );
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[13px] font-medium text-ink-700">{label}{required && <span className="text-danger-500"> *</span>}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
