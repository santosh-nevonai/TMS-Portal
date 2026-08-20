import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus, Store, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Button, StatusBadge, Badge } from '@/components/ui/primitives';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { MERCHANTS } from '@/data/mock';
import type { Merchant } from '@/types';
import { deviceTone, kycTone } from '@/lib/status';
import { shortAgo } from '@/lib/utils';

export default function Merchants() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const rows = MERCHANTS.filter((m) => !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()));

  const cols: Column<Merchant>[] = [
    { key: 'id', header: 'Merchant', sortValue: (m) => m.name, render: (m) => (
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Store size={15} /></span>
        <div><div className="text-[13px] font-semibold text-ink-900">{m.name}</div><div className="font-mono text-2xs text-ink-400">{m.id}</div></div>
      </div>
    ) },
    { key: 'category', header: 'Category', sortValue: (m) => m.category, render: (m) => <Badge>{m.category}</Badge> },
    { key: 'region', header: 'Region', sortValue: (m) => m.region, render: (m) => <span className="text-[13px] text-ink-600">{m.region}</span> },
    { key: 'kyc', header: 'KYC', sortValue: (m) => m.kyc, render: (m) => <StatusBadge tone={kycTone(m.kyc)} /> },
    { key: 'devices', header: 'Devices', align: 'right', sortValue: (m) => m.devices, render: (m) => <span className="tabular-nums font-medium text-ink-900">{m.devices}</span> },
    { key: 'online', header: 'Online', align: 'right', sortValue: (m) => m.online, render: (m) => <span className="tabular-nums text-ok-600">{m.online}</span> },
    { key: 'offline', header: 'Offline', align: 'right', sortValue: (m) => m.offline, render: (m) => <span className="tabular-nums text-danger-600">{m.offline || '—'}</span> },
    { key: 'status', header: 'Status', sortValue: (m) => m.status, render: (m) => <StatusBadge tone={deviceTone(m.status)} /> },
    { key: 'sync', header: 'Last Sync', align: 'right', sortValue: (m) => m.lastSyncMins, render: (m) => <span className="tabular-nums text-xs text-ink-500">{shortAgo(m.lastSyncMins)}</span> },
  ];

  return (
    <div>
      <PageHeader title="Merchants" subtitle="Airtel Payments Bank merchant locations and their assigned devices"
        actions={<><Button variant="secondary"><RefreshCw size={14} /> Sync Airtel</Button><Button variant="secondary"><Download size={14} /> Export</Button><Button variant="primary"><Plus size={14} /> Add Merchant</Button></>} />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Merchants" value={4820} icon={<Store size={15} />} tone="brand" />
        <StatCard label="Active" value={4610} sub="95.6%" tone="ok" />
        <StatCard label="With Issues" value={186} sub="offline/faulty devices" tone="warn" />
        <StatCard label="KYC Pending" value={42} tone="default" />
      </div>

      <Card>
        <div className="flex items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search merchant name or ID…" className="h-9 w-full rounded-lg border border-line-strong pl-8 pr-3 text-[13px] outline-none focus-visible:focus-ring" />
          </div>
        </div>
        <DataTable columns={cols} rows={rows} onRowClick={(m) => navigate(`/merchants/${m.id}`)} dense pageSize={12} />
      </Card>
    </div>
  );
}
