import {
  LayoutDashboard, Cpu, Store, BellRing, LifeBuoy, Layers,
  Megaphone, Music, CheckSquare, CalendarDays,
  HardDriveDownload, Boxes, Truck, Wrench, Tags,
  BarChart3, LineChart,
  Users, ScrollText, Plug, Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: number;
  badgeTone?: 'danger' | 'warn' | 'brand';
}
export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    title: 'Operations',
    items: [
      { label: 'Overview', to: '/', icon: LayoutDashboard },
      { label: 'Devices', to: '/devices', icon: Cpu },
      { label: 'Device Groups', to: '/groups', icon: Layers },
      { label: 'Merchants', to: '/merchants', icon: Store },
      { label: 'Alerts', to: '/alerts', icon: BellRing, badge: 24, badgeTone: 'danger' },
      { label: 'Tickets', to: '/tickets', icon: LifeBuoy, badge: 12, badgeTone: 'warn' },
    ],
  },
  {
    title: 'Campaigns',
    items: [
      { label: 'Campaigns', to: '/campaigns', icon: Megaphone },
      { label: 'Content Library', to: '/content', icon: Music },
      { label: 'Approval Queue', to: '/approvals', icon: CheckSquare, badge: 5, badgeTone: 'brand' },
      { label: 'Campaign Calendar', to: '/calendar', icon: CalendarDays },
    ],
  },
  {
    title: 'Fleet',
    items: [
      { label: 'Firmware / OTA', to: '/ota', icon: HardDriveDownload, badge: 2, badgeTone: 'brand' },
      { label: 'SKU Catalog', to: '/skus', icon: Tags },
      { label: 'Inventory', to: '/inventory', icon: Boxes },
      { label: 'Dispatch', to: '/dispatch', icon: Truck },
      { label: 'RMA / Refurb', to: '/rma', icon: Wrench },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Reports', to: '/reports', icon: BarChart3 },
      { label: 'Analytics', to: '/analytics', icon: LineChart },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users & Roles', to: '/users', icon: Users },
      { label: 'Audit Log', to: '/audit', icon: ScrollText },
      { label: 'Integrations', to: '/integrations', icon: Plug },
      { label: 'Settings', to: '/settings', icon: Settings },
    ],
  },
];
