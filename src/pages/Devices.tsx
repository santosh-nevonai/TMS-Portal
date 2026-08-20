import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, SlidersHorizontal, Columns3, Download, Plus, MoreHorizontal,
  RotateCw, VolumeX, Volume2, Ban, Radio, X, Bookmark, ChevronDown, Cpu,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button, IconButton, StatusBadge, Badge } from '@/components/ui/primitives';
import { Card } from '@/components/ui/primitives';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { BatteryIndicator, SignalIndicator } from '@/components/ui/indicators';
import { EmptyState } from '@/components/ui/states';
import { ConfirmDialog } from '@/components/ui/overlay';
import { AddDeviceForm } from '@/components/forms/AddDeviceForm';
import { DEVICES, DEVICE_GROUPS } from '@/data/mock';
import type { Device, DeviceStatus } from '@/types';
import { deviceTone } from '@/lib/status';
import { cn, shortAgo } from '@/lib/utils';

const STATUS_FILTERS: { value: DeviceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'warning', label: 'Warning' },
  { value: 'offline', label: 'Offline' },
  { value: 'faulty', label: 'Faulty' },
  { value: 'inactive', label: 'Inactive' },
];

const SAVED_FILTERS = ['Offline devices > 24h', 'Low battery < 20%', 'Faulty — Maharashtra', 'Unassigned inventory'];

export default function Devices() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<null | 'block'>(null);
  const [addOpen, setAddOpen] = useState(false);

  const statusParam = (params.get('status') as DeviceStatus | null) ?? 'all';
  const regionParam = params.get('region');
  const batteryParam = params.get('battery');
  const assignedParam = params.get('assigned');
  const skuParam = params.get('sku');
  const groupParam = params.get('group');

  const setStatus = (s: string) => {
    const next = new URLSearchParams(params);
    if (s === 'all') next.delete('status');
    else next.set('status', s);
    setParams(next, { replace: true });
  };
  const clearFilter = (key: string) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    return DEVICES.filter((d) => {
      if (statusParam !== 'all' && d.status !== statusParam) return false;
      if (regionParam && d.region !== regionParam) return false;
      if (batteryParam === 'low' && d.battery >= 20) return false;
      if (assignedParam === 'no' && d.assigned) return false;
      if (skuParam && d.sku !== skuParam) return false;
      if (groupParam && !d.deviceGroups.includes(groupParam)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(d.id.toLowerCase().includes(q) || d.serial.toLowerCase().includes(q) || d.imei.includes(q) || d.merchant.toLowerCase().includes(q) || d.merchantId.toLowerCase().includes(q) || d.sku.toLowerCase().includes(q)))
          return false;
      }
      return true;
    });
  }, [statusParam, regionParam, batteryParam, assignedParam, skuParam, groupParam, search]);

  const groupName = groupParam ? DEVICE_GROUPS.find((g) => g.id === groupParam)?.name ?? groupParam : null;
  const activeChips = [
    regionParam && { key: 'region', label: `Region: ${regionParam}` },
    batteryParam === 'low' && { key: 'battery', label: 'Battery < 20%' },
    assignedParam === 'no' && { key: 'assigned', label: 'Unassigned' },
    skuParam && { key: 'sku', label: `SKU: ${skuParam}` },
    groupParam && { key: 'group', label: `Group: ${groupName}` },
  ].filter(Boolean) as { key: string; label: string }[];

  const columns: Column<Device>[] = [
    {
      key: 'id',
      header: 'Device ID',
      width: '150px',
      sortValue: (d) => d.id,
      render: (d) => (
        <div>
          <div className="font-mono text-[13px] font-semibold text-ink-900">{d.id}</div>
          <div className="font-mono text-2xs text-ink-400">{d.serial}</div>
        </div>
      ),
    },
    { key: 'imei', header: 'IMEI', render: (d) => <span className="font-mono text-xs text-ink-500">{d.imei}</span> },
    {
      key: 'merchant',
      header: 'Merchant',
      sortValue: (d) => d.merchant,
      render: (d) => (
        <div className="max-w-[160px]">
          <div className="truncate text-[13px] font-medium text-ink-800">{d.merchant}</div>
          <div className="font-mono text-2xs text-ink-400">{d.merchantId}</div>
        </div>
      ),
    },
    { key: 'region', header: 'Region', sortValue: (d) => d.region, render: (d) => <span className="text-[13px] text-ink-600">{d.region}</span> },
    {
      key: 'sku',
      header: 'SKU',
      sortValue: (d) => d.sku,
      render: (d) => (
        <div className="max-w-[150px]">
          <div className="truncate text-[13px] text-ink-700">{d.skuName}</div>
          <div className="font-mono text-2xs text-ink-400">{d.sku}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (d) => d.status,
      render: (d) => <StatusBadge tone={deviceTone(d.status)} pulse={d.status === 'online'} />,
    },
    { key: 'battery', header: 'Battery', sortValue: (d) => d.battery, render: (d) => <BatteryIndicator value={d.battery} charging={d.charging} showBar={false} /> },
    { key: 'signal', header: 'Signal', sortValue: (d) => d.signal, render: (d) => <SignalIndicator bars={d.signal} dbm={d.signalDbm} connectivity={d.connectivity} /> },
    { key: 'firmware', header: 'Firmware', sortValue: (d) => d.firmware, render: (d) => <span className="font-mono text-xs text-ink-600">{d.firmware}</span> },
    {
      key: 'lastSync',
      header: 'Last Sync',
      align: 'right',
      sortValue: (d) => d.lastSyncMins,
      render: (d) => <span className={cn('tabular-nums text-xs', d.lastSyncMins < 5 ? 'text-ink-500' : 'text-warn-600')}>{shortAgo(d.lastSyncMins)}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Devices"
        subtitle={`${filtered.length.toLocaleString('en-IN')} of ${DEVICES.length.toLocaleString('en-IN')} devices shown · fleet of 24,850`}
        actions={
          <>
            <Button variant="secondary"><Download size={14} /> Export</Button>
            <Button variant="primary" onClick={() => setAddOpen(true)}><Plus size={14} /> Add Device</Button>
          </>
        }
      />

      <Card>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, serial, IMEI, merchant…"
              className="h-9 w-full rounded-lg border border-line-strong bg-white pl-8 pr-3 text-[13px] outline-none focus-visible:focus-ring"
            />
          </div>
          <Button variant="secondary" size="sm"><SlidersHorizontal size={14} /> Filters</Button>
          <Button variant="secondary" size="sm"><Columns3 size={14} /> Columns</Button>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="hidden text-2xs text-ink-400 sm:inline">Saved:</span>
            <button className="inline-flex items-center gap-1 rounded-lg border border-line-strong bg-white px-2 py-1.5 text-2xs font-medium text-ink-600 hover:bg-neutralst-50">
              <Bookmark size={12} /> Offline &gt; 24h
            </button>
            <button className="inline-flex items-center gap-1 rounded-lg border border-dashed border-line-strong px-2 py-1.5 text-2xs font-medium text-ink-500 hover:bg-neutralst-50">
              <Plus size={12} /> Save filter
            </button>
          </div>
        </div>

        {/* Status segmented + chips */}
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
          <div className="inline-flex items-center rounded-lg border border-line bg-neutralst-50 p-0.5">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  statusParam === s.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          {activeChips.map((c) => (
            <span key={c.key} className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-2xs font-medium text-brand-700">
              {c.label}
              <button onClick={() => clearFilter(c.key)} className="hover:text-brand-900"><X size={11} /></button>
            </span>
          ))}
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-brand-100 bg-brand-50/60 px-3 py-2 animate-fade-in">
            <span className="text-[13px] font-semibold text-brand-800">{selected.size} selected</span>
            <div className="h-4 w-px bg-brand-200" />
            <BulkBtn icon={<RotateCw size={13} />} label="Reboot" />
            <BulkBtn icon={<VolumeX size={13} />} label="Mute" />
            <BulkBtn icon={<Volume2 size={13} />} label="Set Volume" />
            <BulkBtn icon={<Radio size={13} />} label="Push Firmware" />
            <button onClick={() => setConfirm('block')} className="inline-flex items-center gap-1 rounded-lg border border-danger-200 bg-white px-2 py-1 text-2xs font-medium text-danger-600 hover:bg-danger-50">
              <Ban size={13} /> Block
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-2xs font-medium text-ink-500 hover:text-ink-700">Clear selection</button>
          </div>
        )}

        <DataTable
          columns={columns}
          rows={filtered}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          onRowClick={(d) => navigate(`/devices/${d.id}`)}
          dense
          pageSize={13}
          rowActions={() => <IconButton label="Actions" onClick={() => {}}><MoreHorizontal size={16} /></IconButton>}
          emptyState={
            <EmptyState
              icon={<Cpu size={22} />}
              title="No devices match these filters"
              description="Try clearing filters or adjusting your search to see more of the fleet."
              action={<Button size="sm" variant="secondary" onClick={() => { setSearch(''); setParams({}); }}>Reset filters</Button>}
            />
          }
        />
      </Card>

      <ConfirmDialog
        open={confirm === 'block'}
        onClose={() => setConfirm(null)}
        onConfirm={() => setSelected(new Set())}
        title={`Block ${selected.size} devices?`}
        description="This will prevent these devices from operating until they are reactivated. Merchants will stop receiving payment announcements."
        confirmLabel="Block devices"
        danger
        requireText="BLOCK"
      />

      <AddDeviceForm open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}

function BulkBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="inline-flex items-center gap-1 rounded-lg border border-line-strong bg-white px-2 py-1 text-2xs font-medium text-ink-700 hover:bg-neutralst-50">
      {icon} {label}
    </button>
  );
}
