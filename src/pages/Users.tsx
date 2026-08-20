import { useState } from 'react';
import { Users as UsersIcon, Plus, Check, Minus, Shield } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardHeader, Button, Badge, Avatar } from '@/components/ui/primitives';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';

const USERS = [
  { name: 'Santosh Kumar', email: 'santosh.kumar@nevonai.com', role: 'Admin', org: 'Nevon (Internal)', status: 'active', last: '2 min ago' },
  { name: 'Priya Nair', email: 'priya.nair@nevonai.com', role: 'Operations', org: 'Nevon (Internal)', status: 'active', last: '18 min ago' },
  { name: 'Rahul Mehta', email: 'rahul.mehta@nevonai.com', role: 'Operations', org: 'Nevon (Internal)', status: 'active', last: '1h ago' },
  { name: 'Neha Kapoor', email: 'neha.kapoor@nevonai.com', role: 'Support', org: 'Nevon (Internal)', status: 'active', last: '3h ago' },
  { name: 'Arjun Reddy', email: 'arjun.reddy@airtel.com', role: 'Campaign Approver', org: 'Airtel', status: 'active', last: '5h ago' },
  { name: 'Meera Iyer', email: 'meera.iyer@airtel.com', role: 'Regional Manager', org: 'Airtel', status: 'active', last: '1d ago' },
  { name: 'Vikram Singh', email: 'vikram.singh@nevonai.com', role: 'Operations', org: 'Nevon (Internal)', status: 'inactive', last: '12d ago' },
];

const MODULES = ['Devices', 'Merchants', 'Campaigns', 'Alerts', 'Tickets', 'OTA', 'Inventory', 'Reports', 'Users'];
const ACTIONS = ['View', 'Create', 'Edit', 'Approve', 'Export'];
// permission matrix per role
const MATRIX: Record<string, Record<string, boolean[]>> = {
  Admin: Object.fromEntries(MODULES.map((m) => [m, [true, true, true, true, true]])),
  Operations: Object.fromEntries(MODULES.map((m) => [m, [true, true, true, false, true]])),
  Support: Object.fromEntries(MODULES.map((m) => [m, [true, m === 'Tickets', m === 'Tickets', false, true]])),
  'Campaign Approver': Object.fromEntries(MODULES.map((m) => [m, [m === 'Campaigns' || m === 'Reports', false, false, m === 'Campaigns', m === 'Reports']])),
};

export default function Users() {
  const [tab, setTab] = useState<'users' | 'roles'>('users');
  const [role, setRole] = useState('Operations');
  return (
    <div>
      <PageHeader title="Users & Roles" subtitle="Role-based access control for internal and Airtel users"
        actions={<Button variant="primary"><Plus size={14} /> Invite User</Button>} />

      <Card>
        <div className="px-3 pt-1"><Tabs value={tab} onChange={setTab} tabs={[{ value: 'users', label: 'Users', count: USERS.length }, { value: 'roles', label: 'Roles & Permissions' }]} /></div>

        {tab === 'users' ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead><tr className="border-b border-line bg-neutralst-50/80 text-2xs uppercase tracking-wide text-ink-500">{['User', 'Organization', 'Role', 'Status', 'Last active'].map((h) => <th key={h} className="px-4 py-2 font-semibold">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">
                {USERS.map((u) => (
                  <tr key={u.email} className="hover:bg-neutralst-50/60">
                    <td className="px-4 py-2.5"><div className="flex items-center gap-2.5"><Avatar initials={u.name.split(' ').map((s) => s[0]).slice(0, 2).join('')} size="sm" /><div><div className="font-medium text-ink-900">{u.name}</div><div className="text-2xs text-ink-400">{u.email}</div></div></div></td>
                    <td className="px-4 py-2.5"><Badge tone={u.org === 'Airtel' ? 'red' : 'blue'}>{u.org}</Badge></td>
                    <td className="px-4 py-2.5 text-ink-700">{u.role}</td>
                    <td className="px-4 py-2.5"><Badge tone={u.status === 'active' ? 'green' : 'gray'}>{u.status}</Badge></td>
                    <td className="px-4 py-2.5 text-ink-500">{u.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-ink-500">Role:</span>
              {Object.keys(MATRIX).map((r) => (
                <button key={r} onClick={() => setRole(r)} className={cn('flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[13px] font-medium', role === r ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-line text-ink-600 hover:bg-neutralst-50')}>
                  <Shield size={13} /> {r}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto rounded-lg border border-line">
              <table className="w-full min-w-[600px] text-left text-[13px]">
                <thead><tr className="border-b border-line bg-neutralst-50/80 text-2xs uppercase tracking-wide text-ink-500">
                  <th className="px-4 py-2 font-semibold">Module</th>
                  {ACTIONS.map((a) => <th key={a} className="px-3 py-2 text-center font-semibold">{a}</th>)}
                </tr></thead>
                <tbody className="divide-y divide-line">
                  {MODULES.map((m) => (
                    <tr key={m} className="hover:bg-neutralst-50/40">
                      <td className="px-4 py-2 font-medium text-ink-800">{m}</td>
                      {MATRIX[role][m].map((allowed, i) => (
                        <td key={i} className="px-3 py-2 text-center">
                          {allowed ? <Check size={15} className="mx-auto text-ok-600" /> : <Minus size={14} className="mx-auto text-ink-300" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-2xs text-ink-400">Airtel roles cannot access Service Provider internal operational tools unless explicitly granted. Changes are audited.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
