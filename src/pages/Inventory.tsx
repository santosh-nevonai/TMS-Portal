import { Boxes, Download, Plus, Warehouse } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button, Progress } from '@/components/ui/primitives';
import { StatCard } from '@/components/ui/StatCard';
import { BarTrend } from '@/components/charts/Charts';
import { INVENTORY, WAREHOUSES } from '@/data/mock';
import { fmt } from '@/lib/utils';

export default function Inventory() {
  const kpis = [
    { label: 'Total Stock', value: INVENTORY.total, tone: 'brand' as const },
    { label: 'Available', value: INVENTORY.available, tone: 'ok' as const },
    { label: 'Allocated', value: INVENTORY.allocated, tone: 'default' as const },
    { label: 'Dispatched', value: INVENTORY.dispatched, tone: 'default' as const },
    { label: 'In Transit', value: INVENTORY.inTransit, tone: 'default' as const },
    { label: 'Returned', value: INVENTORY.returned, tone: 'warn' as const },
    { label: 'Faulty', value: INVENTORY.faulty, tone: 'danger' as const },
    { label: 'Refurbishing', value: INVENTORY.refurbishing, tone: 'purple' as const },
  ];
  return (
    <div>
      <PageHeader title="Inventory" subtitle="Warehouse stock, allocation and device lifecycle across distribution centers"
        actions={<><Button variant="secondary"><Download size={14} /> Export</Button><Button variant="primary"><Plus size={14} /> Receive Stock</Button></>} />

      <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
        {kpis.map((k) => <StatCard key={k.label} label={k.label} value={k.value} tone={k.tone} />)}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader title="Stock by Warehouse" subtitle="Available, allocated and faulty per DC" icon={<Warehouse size={15} />} />
          <div className="divide-y divide-line">
            {WAREHOUSES.map((w) => {
              const total = w.available + w.allocated + w.faulty;
              return (
                <div key={w.name} className="px-4 py-3">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-ink-900">{w.name}</span>
                    <span className="tabular-nums text-2xs text-ink-500">{fmt(total)} units</span>
                  </div>
                  <div className="flex h-2.5 overflow-hidden rounded-full">
                    <div className="bg-ok-500" style={{ width: `${(w.available / total) * 100}%` }} />
                    <div className="bg-info-500" style={{ width: `${(w.allocated / total) * 100}%` }} />
                    <div className="bg-danger-500" style={{ width: `${(w.faulty / total) * 100}%` }} />
                  </div>
                  <div className="mt-1.5 flex gap-4 text-2xs text-ink-500">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-ok-500" /> {w.available} avail</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-info-500" /> {w.allocated} allocated</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-danger-500" /> {w.faulty} faulty</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <CardHeader title="Stock Movement" subtitle="Received vs dispatched · last 14 days" />
          <div className="p-3">
            <BarTrend height={240} data={Array.from({ length: 14 }, (_, i) => ({ label: `D-${14 - i}`, received: 40 + (i % 4) * 30, dispatched: 30 + (i % 5) * 25 }))}
              series={[{ key: 'received', name: 'Received', color: '#16A34A' }, { key: 'dispatched', name: 'Dispatched', color: '#2E5BE6' }]} />
          </div>
        </Card>
      </div>
    </div>
  );
}
