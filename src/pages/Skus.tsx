import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tags, Plus, Download, Cpu, Package, Search, Wifi, Radio } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Button, StatusBadge, Badge } from '@/components/ui/primitives';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/overlay';
import { SKUS } from '@/data/mock';
import type { Sku } from '@/types';
import { fmt } from '@/lib/utils';

const statusTone = (s: Sku['status']) =>
  s === 'active'
    ? { dot: 'bg-ok-500', text: 'text-ok-700', bg: 'bg-ok-50', border: 'border-ok-100', label: 'Active' }
    : s === 'eol'
    ? { dot: 'bg-danger-500', text: 'text-danger-700', bg: 'bg-danger-50', border: 'border-danger-100', label: 'End of Life' }
    : { dot: 'bg-ink-400', text: 'text-ink-500', bg: 'bg-neutralst-50', border: 'border-line', label: 'Draft' };

export default function Skus() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const rows = SKUS.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.code.toLowerCase().includes(search.toLowerCase()) || s.model.toLowerCase().includes(search.toLowerCase()));

  const totalDeployed = SKUS.reduce((a, s) => a + s.deployed, 0);
  const totalStock = SKUS.reduce((a, s) => a + s.inStock, 0);

  const cols: Column<Sku>[] = [
    { key: 'code', header: 'SKU', sortValue: (s) => s.code, render: (s) => (
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Tags size={15} /></span>
        <div><div className="text-[13px] font-semibold text-ink-900">{s.name}</div><div className="font-mono text-2xs text-ink-400">{s.code}</div></div>
      </div>
    ) },
    { key: 'model', header: 'Model', sortValue: (s) => s.model, render: (s) => <span className="font-mono text-xs text-ink-700">{s.model}</span> },
    { key: 'variant', header: 'Variant', sortValue: (s) => s.variant, render: (s) => <Badge>{s.variant}</Badge> },
    { key: 'connectivity', header: 'Connectivity', render: (s) => <span className="inline-flex items-center gap-1 text-[13px] text-ink-600">{s.connectivity === 'Wi-Fi' ? <Wifi size={13} /> : <Radio size={13} />} {s.connectivity}</span> },
    { key: 'hardware', header: 'HW', render: (s) => <span className="font-mono text-xs text-ink-500">{s.hardware}</span> },
    { key: 'battery', header: 'Battery', align: 'right', sortValue: (s) => s.batteryMah, render: (s) => <span className="tabular-nums text-[13px] text-ink-700">{fmt(s.batteryMah)} mAh</span> },
    { key: 'fw', header: 'FW Baseline', render: (s) => <span className="font-mono text-xs text-ink-600">{s.firmwareBaseline}</span> },
    { key: 'deployed', header: 'Deployed', align: 'right', sortValue: (s) => s.deployed, render: (s) => <button onClick={(e) => { e.stopPropagation(); navigate(`/devices?sku=${encodeURIComponent(s.code)}`); }} className="tabular-nums font-medium text-brand-600 hover:underline">{fmt(s.deployed)}</button> },
    { key: 'stock', header: 'In Stock', align: 'right', sortValue: (s) => s.inStock, render: (s) => <span className="tabular-nums text-ink-700">{fmt(s.inStock)}</span> },
    { key: 'status', header: 'Status', sortValue: (s) => s.status, render: (s) => <StatusBadge tone={statusTone(s.status)} /> },
  ];

  return (
    <div>
      <PageHeader title="SKU Catalog" subtitle="Product variants (SKUs) for the Soundbox device portfolio — each SKU maps to a device model"
        actions={<><Button variant="secondary"><Download size={14} /> Export</Button><Button variant="primary" onClick={() => setAddOpen(true)}><Plus size={14} /> Add SKU</Button></>} />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total SKUs" value={SKUS.length} icon={<Tags size={15} />} tone="brand" />
        <StatCard label="Active SKUs" value={SKUS.filter((s) => s.status === 'active').length} tone="ok" />
        <StatCard label="Devices Deployed" value={totalDeployed} icon={<Cpu size={15} />} tone="default" />
        <StatCard label="Units in Stock" value={totalStock} icon={<Package size={15} />} tone="warn" />
      </div>

      <Card>
        <div className="flex items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SKU, model, code…" className="h-9 w-full rounded-lg border border-line-strong pl-8 pr-3 text-[13px] outline-none focus-visible:focus-ring" />
          </div>
        </div>
        <DataTable columns={cols} rows={rows} dense pageSize={10} />
      </Card>

      <AddSkuModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function AddSkuModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} size="lg" title="Add SKU" subtitle="Define a new product variant for the device portfolio"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={onClose}>Create SKU</Button></>}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="SKU name"><input placeholder="Soundbox Pro 5G" className="inp" /></Field>
        <Field label="SKU code"><input placeholder="NV-SBPRO-5G-STD" className="inp font-mono" /></Field>
        <Field label="Device model"><input placeholder="SB-Pro-5G" className="inp font-mono" /></Field>
        <Field label="Variant"><select className="inp"><option>Standard</option><option>Lite</option><option>Max</option></select></Field>
        <Field label="Connectivity"><select className="inp"><option>4G</option><option>Wi-Fi</option><option>SIM</option></select></Field>
        <Field label="Hardware revision"><input placeholder="HW-3.1" className="inp font-mono" /></Field>
        <Field label="Battery (mAh)"><input type="number" placeholder="2600" className="inp" /></Field>
        <Field label="Firmware baseline"><input placeholder="v2.5.0" className="inp font-mono" /></Field>
      </div>
      <style>{`.inp{height:36px;width:100%;border:1px solid #D6DBE1;border-radius:8px;padding:0 10px;font-size:13px;outline:none}.inp:focus{box-shadow:0 0 0 2px rgba(46,91,230,.35)}`}</style>
    </Modal>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="text-[13px] font-medium text-ink-700">{label}</label><div className="mt-1">{children}</div></div>;
}
