import { Truck, Plus, Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, Button, StatusBadge, Badge } from '@/components/ui/primitives';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { DISPATCHES } from '@/data/mock';
import type { Dispatch as DispatchT } from '@/types';

const tone: Record<DispatchT['status'], any> = {
  preparing: { dot: 'bg-ink-400', text: 'text-ink-600', bg: 'bg-neutralst-50', border: 'border-line', label: 'Preparing' },
  dispatched: { dot: 'bg-info-500', text: 'text-info-600', bg: 'bg-info-50', border: 'border-info-100', label: 'Dispatched' },
  in_transit: { dot: 'bg-warn-500', text: 'text-warn-700', bg: 'bg-warn-50', border: 'border-warn-100', label: 'In Transit' },
  delivered: { dot: 'bg-ok-500', text: 'text-ok-700', bg: 'bg-ok-50', border: 'border-ok-100', label: 'Delivered' },
  failed: { dot: 'bg-danger-500', text: 'text-danger-700', bg: 'bg-danger-50', border: 'border-danger-100', label: 'Failed' },
  returned: { dot: 'bg-[#9333EA]', text: 'text-[#7E22CE]', bg: 'bg-[#F6EDFE]', border: 'border-[#E9D5FF]', label: 'Returned' },
};

export default function Dispatch() {
  const cols: Column<DispatchT>[] = [
    { key: 'id', header: 'Dispatch ID', sortValue: (d) => d.id, render: (d) => <span className="font-mono text-[13px] font-semibold text-ink-900">{d.id}</span> },
    { key: 'warehouse', header: 'Warehouse', sortValue: (d) => d.warehouse, render: (d) => <span className="text-[13px] text-ink-700">{d.warehouse}</span> },
    { key: 'dest', header: 'Destination', render: (d) => <span className="text-[13px] text-ink-700">{d.destination}</span> },
    { key: 'devices', header: 'Devices', align: 'right', sortValue: (d) => d.devices, render: (d) => <span className="tabular-nums font-medium text-ink-900">{d.devices}</span> },
    { key: 'courier', header: 'Courier', render: (d) => <Badge>{d.courier}</Badge> },
    { key: 'tracking', header: 'Tracking', render: (d) => <span className="font-mono text-xs text-brand-600">{d.tracking}</span> },
    { key: 'eta', header: 'ETA', sortValue: (d) => d.eta, render: (d) => <span className="text-[13px] text-ink-600">{d.eta}</span> },
    { key: 'status', header: 'Status', sortValue: (d) => d.status, render: (d) => <StatusBadge tone={tone[d.status]} /> },
  ];
  return (
    <div>
      <PageHeader title="Dispatch" subtitle="Track device shipments from warehouses to regional hubs and merchants"
        actions={<><Button variant="secondary"><Download size={14} /> Export</Button><Button variant="primary"><Plus size={14} /> New Dispatch</Button></>} />
      <Card>
        <DataTable columns={cols} rows={DISPATCHES} dense pageSize={12} />
      </Card>
    </div>
  );
}
