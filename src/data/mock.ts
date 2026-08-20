import type {
  Device,
  Region,
  Alert,
  Ticket,
  Campaign,
  AudioAsset,
  RmaItem,
  Dispatch,
  Merchant,
  DeviceCommand,
  ActivityEvent,
  OtaRollout,
  SystemService,
  DeviceStatus,
  Severity,
  Sku,
  DeviceGroup,
} from '@/types';

// Deterministic PRNG (mulberry32) so mock data is stable across renders.
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20260820);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

// ---------------------------------------------------------------------------
// Fleet-scale headline figures (SOW §71)
// ---------------------------------------------------------------------------
export const FLEET = {
  total: 24850,
  active: 22940,
  offline: 1120,
  faulty: 310,
  lowBattery: 480,
  unassigned: 80,
  inactive: 174,
  warning: 690,
  activeCampaigns: 12,
  openTickets: 128,
  slaBreaches: 7,
  criticalAlerts: 24,
};

export const HEALTH_BREAKDOWN = [
  { key: 'healthy', label: 'Healthy', value: 92.3, count: 22940, color: '#16A34A' },
  { key: 'warning', label: 'Warning', value: 2.8, count: 690, color: '#D97706' },
  { key: 'offline', label: 'Offline', value: 4.5, count: 1120, color: '#DC2626' },
  { key: 'faulty', label: 'Faulty', value: 1.2, count: 310, color: '#9333EA' },
  { key: 'inactive', label: 'Inactive', value: 0.7, count: 174, color: '#94A3B8' },
];

// ---------------------------------------------------------------------------
// Regions (schematic India map coordinates, %-based)
// ---------------------------------------------------------------------------
export const REGIONS: Region[] = [
  { id: 'dl', name: 'Delhi NCR', short: 'DL', devices: 2840, online: 2690, offline: 102, faulty: 48, lowBattery: 61, x: 40, y: 26 },
  { id: 'up', name: 'Uttar Pradesh', short: 'UP', devices: 3620, online: 3310, offline: 214, faulty: 96, lowBattery: 88, x: 49, y: 31 },
  { id: 'mh', name: 'Maharashtra', short: 'MH', devices: 4180, online: 3940, offline: 158, faulty: 82, lowBattery: 74, x: 35, y: 55 },
  { id: 'ka', name: 'Karnataka', short: 'KA', devices: 2960, online: 2790, offline: 108, faulty: 62, lowBattery: 55, x: 38, y: 70 },
  { id: 'tn', name: 'Tamil Nadu', short: 'TN', devices: 2540, online: 2360, offline: 121, faulty: 59, lowBattery: 48, x: 44, y: 82 },
  { id: 'gj', name: 'Gujarat', short: 'GJ', devices: 2210, online: 2080, offline: 84, faulty: 46, lowBattery: 40, x: 24, y: 45 },
  { id: 'rj', name: 'Rajasthan', short: 'RJ', devices: 1780, online: 1640, offline: 92, faulty: 48, lowBattery: 35, x: 30, y: 34 },
  { id: 'wb', name: 'West Bengal', short: 'WB', devices: 1690, online: 1560, offline: 84, faulty: 46, lowBattery: 33, x: 66, y: 45 },
  { id: 'ts', name: 'Telangana', short: 'TS', devices: 1520, online: 1420, offline: 66, faulty: 34, lowBattery: 28, x: 43, y: 62 },
  { id: 'mp', name: 'Madhya Pradesh', short: 'MP', devices: 1310, online: 1210, offline: 61, faulty: 29, lowBattery: 22, x: 42, y: 45 },
];

// ---------------------------------------------------------------------------
// Merchants & Devices
// ---------------------------------------------------------------------------
const MERCHANT_NAMES = [
  'Sharma General Store', 'Metro Mart', 'Gupta Electronics', 'Fresh Point',
  'City Mobile Hub', 'Raj Traders', 'A1 Super Store', 'Verma Kirana',
  'Sunrise Bakery', 'Bharat Provision', 'Krishna Medicals', 'Maa Vaishno Store',
  'Royal Sweets', 'Annapurna Foods', 'Shri Ganesh Traders', 'Modern Bazaar',
  'Deepak Hardware', 'Sai Stationery', 'New India Restaurant', 'Green Grocery',
  'Patel Auto Parts', 'Om Sai Garments', 'National Book Depot', 'Balaji Enterprises',
];
const CATEGORIES = ['Grocery', 'Electronics', 'Pharmacy', 'Apparel', 'Food & Bev', 'Hardware', 'Services'];
const MODELS = ['SB-Pro-4G', 'SB-Lite-4G', 'SB-Max-WiFi', 'SB-Pro-4G-v2'];
const HW = ['HW-2.0', 'HW-2.1', 'HW-3.0'];
const FW_VERSIONS = ['v2.4.1', 'v2.4.0', 'v2.3.8', 'v2.5.0', 'v2.3.5'];
const USERS = ['Santosh Kumar', 'Priya Nair', 'Rahul Mehta', 'Anjali Rao', 'Vikram Singh', 'Neha Kapoor'];

// ---------------------------------------------------------------------------
// SKU catalog — product variants (SKU maps 1:1 to a device model)
// ---------------------------------------------------------------------------
export const SKUS: Sku[] = [
  { id: 'SKU-SBPRO4G', code: 'NV-SBPRO-4G-STD', name: 'Soundbox Pro 4G', model: 'SB-Pro-4G', variant: 'Standard', connectivity: '4G', hardware: 'HW-2.1', batteryMah: 2200, firmwareBaseline: 'v2.4.1', status: 'active', deployed: 9240, inStock: 1120 },
  { id: 'SKU-SBLITE4G', code: 'NV-SBLITE-4G-STD', name: 'Soundbox Lite 4G', model: 'SB-Lite-4G', variant: 'Lite', connectivity: '4G', hardware: 'HW-2.0', batteryMah: 1500, firmwareBaseline: 'v2.4.0', status: 'active', deployed: 6180, inStock: 860 },
  { id: 'SKU-SBMAXWIFI', code: 'NV-SBMAX-WIFI-GPS', name: 'Soundbox Max Wi-Fi', model: 'SB-Max-WiFi', variant: 'Max', connectivity: 'Wi-Fi', hardware: 'HW-3.0', batteryMah: 3000, firmwareBaseline: 'v2.5.0', status: 'active', deployed: 4210, inStock: 540 },
  { id: 'SKU-SBPRO4GV2', code: 'NV-SBPRO-4G-V2', name: 'Soundbox Pro 4G v2', model: 'SB-Pro-4G-v2', variant: 'Standard', connectivity: '4G', hardware: 'HW-3.0', batteryMah: 2600, firmwareBaseline: 'v2.5.0', status: 'active', deployed: 5220, inStock: 980 },
  { id: 'SKU-SBLITE3G', code: 'NV-SBLITE-3G-EOL', name: 'Soundbox Lite 3G', model: 'SB-Lite-3G', variant: 'Lite', connectivity: 'SIM', hardware: 'HW-1.4', batteryMah: 1200, firmwareBaseline: 'v1.9.2', status: 'eol', deployed: 320, inStock: 0 },
];
const MODEL_TO_SKU: Record<string, Sku> = Object.fromEntries(SKUS.map((s) => [s.model, s]));

// ---------------------------------------------------------------------------
// Device groups — logical targeting cohorts for campaigns & OTA
// ---------------------------------------------------------------------------
export const DEVICE_GROUPS: DeviceGroup[] = [
  { id: 'GRP-001', name: 'Metro Tier-1 Merchants', description: 'High-traffic stores in metro cities', type: 'static', devices: 8420, online: 8010, scope: 'Delhi NCR, Mumbai, Bengaluru', createdBy: 'Santosh Kumar', updatedMins: 180, usedIn: 4 },
  { id: 'GRP-002', name: 'Low-battery Watchlist', description: 'Devices reporting < 25% battery in last 24h', type: 'dynamic', criteria: 'battery < 25%', devices: 512, online: 470, scope: 'All India', createdBy: 'Priya Nair', updatedMins: 12, usedIn: 1 },
  { id: 'GRP-003', name: 'Pro 4G Fleet', description: 'All devices on SKU Soundbox Pro 4G', type: 'dynamic', criteria: 'sku = NV-SBPRO-4G-STD', devices: 9240, online: 8720, scope: 'All India', createdBy: 'Rahul Mehta', updatedMins: 60, usedIn: 3 },
  { id: 'GRP-004', name: 'Maharashtra Pilot', description: 'Firmware pilot cohort — Maharashtra', type: 'static', devices: 1200, online: 1150, scope: 'Maharashtra', createdBy: 'Vikram Singh', updatedMins: 420, usedIn: 2 },
  { id: 'GRP-005', name: 'South Region Campaigns', description: 'KA, TN, TS merchants for regional audio', type: 'static', devices: 7020, online: 6640, scope: 'Karnataka, Tamil Nadu, Telangana', createdBy: 'Anjali Rao', updatedMins: 1440, usedIn: 5 },
  { id: 'GRP-006', name: 'Legacy 3G — Migrate', description: 'EOL SKU devices scheduled for replacement', type: 'dynamic', criteria: 'sku = NV-SBLITE-3G-EOL', devices: 320, online: 210, scope: 'All India', createdBy: 'Santosh Kumar', updatedMins: 2880, usedIn: 1 },
  { id: 'GRP-007', name: 'New Onboarding (30d)', description: 'Devices activated in the last 30 days', type: 'dynamic', criteria: 'activation < 30 days', devices: 2140, online: 2020, scope: 'All India', createdBy: 'Neha Kapoor', updatedMins: 240, usedIn: 2 },
];

function statusWeighted(): DeviceStatus {
  const r = rand();
  if (r < 0.9) return 'online';
  if (r < 0.94) return 'warning';
  if (r < 0.985) return 'offline';
  if (r < 0.997) return 'faulty';
  return 'inactive';
}

export const MERCHANTS: Merchant[] = Array.from({ length: 60 }, (_, i) => {
  const region = pick(REGIONS);
  const devices = int(1, 6);
  const offline = int(0, Math.max(0, Math.floor(devices * 0.2)));
  const faulty = rand() < 0.15 ? 1 : 0;
  const online = Math.max(0, devices - offline - faulty);
  const st: DeviceStatus = offline > 0 || faulty > 0 ? (faulty > 0 ? 'faulty' : 'warning') : 'online';
  return {
    id: `APB${100000 + i * 137}`,
    name: MERCHANT_NAMES[i % MERCHANT_NAMES.length] + (i >= MERCHANT_NAMES.length ? ` ${Math.floor(i / MERCHANT_NAMES.length) + 1}` : ''),
    category: pick(CATEGORIES),
    region: region.name,
    state: region.name,
    kyc: rand() < 0.85 ? 'verified' : rand() < 0.5 ? 'pending' : 'rejected',
    devices,
    online,
    offline,
    faulty,
    status: st,
    lastSyncMins: int(0, 240),
    onboarded: `${int(2023, 2026)}-0${int(1, 9)}-1${int(0, 9)}`,
  };
});

export const DEVICES: Device[] = Array.from({ length: 420 }, (_, i) => {
  const region = pick(REGIONS);
  const merchant = pick(MERCHANTS);
  const status = statusWeighted();
  const model = pick(MODELS);
  const sku = MODEL_TO_SKU[model];
  const battery = status === 'offline' ? int(0, 40) : rand() < 0.12 ? int(3, 19) : int(28, 100);
  const signal = status === 'offline' ? 0 : int(1, 4);
  const assigned = rand() > 0.03;
  const hasGps = model.includes('Max') || rand() < 0.35;
  // Assign 1–2 device groups (Pro-4G fleet group auto-applies to matching SKU).
  const groups: string[] = [];
  if (sku.code === 'NV-SBPRO-4G-STD') groups.push('GRP-003');
  if (battery < 25) groups.push('GRP-002');
  if (region.name === 'Maharashtra' && rand() < 0.4) groups.push('GRP-004');
  if (['Karnataka', 'Tamil Nadu', 'Telangana'].includes(region.name) && rand() < 0.5) groups.push('GRP-005');
  if (rand() < 0.15) groups.push('GRP-001');
  return {
    id: `NV-SB-${String(i + 1).padStart(3, '0')}`,
    serial: `SN24${String(1000 + i)}`,
    imei: `8690${int(10000000, 99999999)}${int(100, 999)}`,
    iccid: `8991000${int(100000000, 999999999)}`,
    model,
    sku: sku.code,
    skuName: sku.name,
    deviceGroups: groups,
    hardware: pick(HW),
    firmware: status === 'faulty' ? pick(FW_VERSIONS) : rand() < 0.7 ? 'v2.4.1' : pick(FW_VERSIONS),
    status,
    battery,
    charging: rand() < 0.25,
    signal,
    signalDbm: -1 * (60 + (4 - signal) * 12 + int(0, 8)),
    connectivity: pick(['4G', '4G', 'Wi-Fi', 'SIM'] as const),
    volume: int(30, 90),
    temperature: int(28, 44),
    merchantId: merchant.id,
    merchant: merchant.name,
    merchantCategory: merchant.category,
    region: region.name,
    state: region.name,
    city: region.name.split(' ')[0],
    hasGps,
    lat: hasGps ? 20 + rand() * 8 : undefined,
    lng: hasGps ? 73 + rand() * 8 : undefined,
    lastSyncMins: status === 'online' ? int(0, 2) : status === 'warning' ? int(3, 30) : int(60, 4320),
    lastTxnMins: int(1, 600),
    activationDate: `${int(2023, 2026)}-0${int(1, 9)}-${int(10, 28)}`,
    assigned,
    rmaStatus: status === 'faulty' && rand() < 0.6 ? 'diagnosis' : null,
    uptime30d: status === 'online' ? 95 + rand() * 4.9 : status === 'offline' ? 40 + rand() * 30 : 80 + rand() * 15,
  };
});

// A curated "hero" device for the detail page.
export const HERO_DEVICE = DEVICES[0];

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------
const ALERT_TYPES = [
  { type: 'Offline' as const, sev: 'critical' as Severity, title: 'Device offline for >24 hours' },
  { type: 'Command Failure' as const, sev: 'high' as Severity, title: 'Repeated command failures' },
  { type: 'Low Battery' as const, sev: 'medium' as Severity, title: 'Battery below 20% threshold' },
  { type: 'Connectivity' as const, sev: 'low' as Severity, title: 'SIM connectivity warning' },
  { type: 'Tamper' as const, sev: 'critical' as Severity, title: 'Tamper switch triggered' },
  { type: 'SIM Swap' as const, sev: 'high' as Severity, title: 'Unexpected SIM swap detected' },
  { type: 'Firmware Failure' as const, sev: 'high' as Severity, title: 'Firmware update failed' },
];

export const ALERTS: Alert[] = Array.from({ length: 46 }, (_, i) => {
  const t = pick(ALERT_TYPES);
  const d = pick(DEVICES);
  return {
    id: `ALT-${4200 + i}`,
    severity: t.sev,
    type: t.type,
    title: t.title,
    deviceId: d.id,
    merchant: d.merchant,
    region: d.region,
    triggeredMins: int(2, 2880),
    durationMins: int(10, 1600),
    assignedTo: rand() < 0.5 ? pick(USERS) : undefined,
    status: rand() < 0.6 ? 'open' : rand() < 0.5 ? 'acknowledged' : 'resolved',
  };
});

export const ALERT_SUMMARY = [
  { severity: 'critical' as Severity, count: 24, label: '24 devices offline for >24 hours' },
  { severity: 'high' as Severity, count: 17, label: '17 devices with repeated command failures' },
  { severity: 'medium' as Severity, count: 183, label: '183 devices below 20% battery' },
  { severity: 'low' as Severity, count: 42, label: '42 SIM connectivity warnings' },
];

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------
const TICKET_SUBJECTS = [
  'Soundbox not announcing payments', 'Device stuck on boot screen', 'Low volume complaint',
  'Repeated disconnections', 'Battery drains overnight', 'SIM not detected',
  'Firmware update failed', 'Device physically damaged', 'Wrong merchant mapping',
  'No power / not charging', 'Speaker distortion', 'Frequent reboots',
];

export const TICKETS: Ticket[] = Array.from({ length: 40 }, (_, i) => {
  const d = pick(DEVICES);
  const pr = pick(['critical', 'high', 'medium', 'low', 'medium', 'high'] as Severity[]);
  const status = pick(['open', 'in_progress', 'pending', 'resolved', 'open', 'in_progress'] as const);
  return {
    id: `TKT-${9100 + i}`,
    priority: pr,
    subject: pick(TICKET_SUBJECTS),
    merchant: d.merchant,
    deviceId: d.id,
    region: d.region,
    assignee: pick(USERS),
    slaMins: rand() < 0.18 ? -int(20, 400) : int(30, 1440),
    status,
    createdMins: int(20, 5000),
    category: pick(['Hardware', 'Connectivity', 'Firmware', 'Mapping', 'Battery']),
  };
});

export const TICKET_SNAPSHOT = { open: 128, critical: 4, high: 21, slaBreached: 7, dueToday: 16 };

// ---------------------------------------------------------------------------
// Campaigns & Content
// ---------------------------------------------------------------------------
export const CAMPAIGNS: Campaign[] = [
  { id: 'CMP-501', name: 'Festive Cashback Campaign', audio: 'Festive Cashback — Hindi', language: 'Hindi', status: 'live', targetDevices: 8420, plays: 125840, reach: 96.4, completion: 91.2, start: '2026-08-15', end: '2026-08-22', createdBy: 'Priya Nair', priority: 'high' },
  { id: 'CMP-502', name: 'UPI Autopay Awareness', audio: 'Autopay Info — Hindi', language: 'Hindi', status: 'live', targetDevices: 12400, plays: 98210, reach: 88.1, completion: 84.6, start: '2026-08-12', end: '2026-08-25', createdBy: 'Rahul Mehta', priority: 'standard' },
  { id: 'CMP-503', name: 'Monsoon Merchant Offer', audio: 'Monsoon Offer — Marathi', language: 'Marathi', status: 'live', targetDevices: 4180, plays: 46120, reach: 92.7, completion: 88.9, start: '2026-08-14', end: '2026-08-21', createdBy: 'Anjali Rao', priority: 'standard' },
  { id: 'CMP-504', name: 'Independence Day Greetings', audio: 'I-Day Wishes — Hindi', language: 'Hindi', status: 'completed', targetDevices: 24000, plays: 480000, reach: 98.2, completion: 96.4, start: '2026-08-15', end: '2026-08-15', createdBy: 'Santosh Kumar', priority: 'override' },
  { id: 'CMP-505', name: 'Tamil New Merchant Drive', audio: 'Onboarding — Tamil', language: 'Tamil', status: 'scheduled', targetDevices: 2540, plays: 0, reach: 0, completion: 0, start: '2026-08-24', end: '2026-08-30', createdBy: 'Vikram Singh', priority: 'standard' },
  { id: 'CMP-506', name: 'Diwali Mega Sale Teaser', audio: 'Diwali Teaser — Hindi', language: 'Hindi', status: 'pending', targetDevices: 18600, plays: 0, reach: 0, completion: 0, start: '2026-09-01', end: '2026-09-10', createdBy: 'Priya Nair', submittedMins: 240, priority: 'high' },
  { id: 'CMP-507', name: 'Karnataka Loyalty Rewards', audio: 'Loyalty — Kannada', language: 'Kannada', status: 'pending', targetDevices: 2960, plays: 0, reach: 0, completion: 0, start: '2026-08-28', end: '2026-09-05', createdBy: 'Neha Kapoor', submittedMins: 620, priority: 'standard' },
  { id: 'CMP-508', name: 'Gujarat Wholesale Offer', audio: 'Wholesale — Gujarati', language: 'Gujarati', status: 'approved', targetDevices: 2210, plays: 0, reach: 0, completion: 0, start: '2026-08-26', end: '2026-09-02', createdBy: 'Rahul Mehta', priority: 'standard' },
  { id: 'CMP-509', name: 'Refer & Earn Push', audio: 'Refer Earn — Hindi', language: 'Hindi', status: 'draft', targetDevices: 0, plays: 0, reach: 0, completion: 0, start: '', end: '', createdBy: 'Santosh Kumar', priority: 'standard' },
  { id: 'CMP-510', name: 'Late-night Store Promo', audio: 'Night Promo — Hindi', language: 'Hindi', status: 'rejected', targetDevices: 5400, plays: 0, reach: 0, completion: 0, start: '2026-08-20', end: '2026-08-27', createdBy: 'Vikram Singh', submittedMins: 1440, priority: 'standard' },
];

export const AUDIO_ASSETS: AudioAsset[] = [
  { id: 'AUD-01', name: 'Festive Cashback — Hindi', language: 'Hindi', durationSec: 18, category: 'Promotion', sizeKb: 288, uploadedBy: 'Priya Nair', status: 'approved', created: '2026-08-10' },
  { id: 'AUD-02', name: 'Autopay Info — Hindi', language: 'Hindi', durationSec: 22, category: 'Awareness', sizeKb: 352, uploadedBy: 'Rahul Mehta', status: 'approved', created: '2026-08-08' },
  { id: 'AUD-03', name: 'Monsoon Offer — Marathi', language: 'Marathi', durationSec: 16, category: 'Promotion', sizeKb: 256, uploadedBy: 'Anjali Rao', status: 'approved', created: '2026-08-09' },
  { id: 'AUD-04', name: 'Diwali Teaser — Hindi', language: 'Hindi', durationSec: 20, category: 'Promotion', sizeKb: 320, uploadedBy: 'Priya Nair', status: 'pending', created: '2026-08-18' },
  { id: 'AUD-05', name: 'Onboarding — Tamil', language: 'Tamil', durationSec: 24, category: 'Onboarding', sizeKb: 384, uploadedBy: 'Vikram Singh', status: 'approved', created: '2026-08-11' },
  { id: 'AUD-06', name: 'Loyalty — Kannada', language: 'Kannada', durationSec: 19, category: 'Loyalty', sizeKb: 304, uploadedBy: 'Neha Kapoor', status: 'pending', created: '2026-08-17' },
  { id: 'AUD-07', name: 'Wholesale — Gujarati', language: 'Gujarati', durationSec: 21, category: 'Promotion', sizeKb: 336, uploadedBy: 'Rahul Mehta', status: 'approved', created: '2026-08-12' },
  { id: 'AUD-08', name: 'Night Promo — Hindi', language: 'Hindi', durationSec: 17, category: 'Promotion', sizeKb: 272, uploadedBy: 'Vikram Singh', status: 'rejected', created: '2026-08-16' },
];

// ---------------------------------------------------------------------------
// Device commands (for command center + history)
// ---------------------------------------------------------------------------
export const COMMAND_HISTORY: DeviceCommand[] = [
  { id: 'CMD-01', command: 'Reboot', requestedBy: 'Santosh Kumar', requestedMins: 3, status: 'executed', deliveredSec: 2, executedSec: 3 },
  { id: 'CMD-02', command: 'Set Volume → 70', requestedBy: 'Priya Nair', requestedMins: 48, status: 'executed', deliveredSec: 1, executedSec: 2 },
  { id: 'CMD-03', command: 'Mute', requestedBy: 'Rahul Mehta', requestedMins: 130, status: 'executed', deliveredSec: 2, executedSec: 3 },
  { id: 'CMD-04', command: 'Push Firmware v2.4.1', requestedBy: 'Santosh Kumar', requestedMins: 320, status: 'failed', deliveredSec: 4 },
  { id: 'CMD-05', command: 'Locate Device', requestedBy: 'Anjali Rao', requestedMins: 460, status: 'executed', deliveredSec: 1, executedSec: 6 },
  { id: 'CMD-06', command: 'Unmute', requestedBy: 'Rahul Mehta', requestedMins: 720, status: 'expired' },
];

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------
export const ACTIVITY: ActivityEvent[] = [
  { id: 'a1', type: 'ota', title: 'Firmware updated', detail: 'v2.1.4 → v2.1.5', entity: 'NV-SB-001', minsAgo: 2, user: 'Santosh Kumar' },
  { id: 'a2', type: 'reboot', title: 'Device rebooted', detail: 'Reboot completed successfully', entity: 'NV-SB-118', minsAgo: 6, user: 'Priya Nair' },
  { id: 'a3', type: 'campaign', title: 'Campaign approved', detail: 'Festive Cashback Campaign', entity: 'CMP-501', minsAgo: 25, user: 'Airtel Approver' },
  { id: 'a4', type: 'mapping', title: 'Merchant mapping changed', detail: 'Reassigned to Metro Mart', entity: 'NV-SB-204', minsAgo: 41, user: 'Rahul Mehta' },
  { id: 'a5', type: 'block', title: 'Device blocked', detail: 'Tamper alert — blocked pending review', entity: 'NV-SB-087', minsAgo: 58, user: 'Vikram Singh' },
  { id: 'a6', type: 'ticket', title: 'Ticket escalated', detail: 'TKT-9112 escalated to L2', entity: 'TKT-9112', minsAgo: 72, user: 'Neha Kapoor' },
  { id: 'a7', type: 'permission', title: 'User permission changed', detail: 'Granted Campaign Approver role', entity: 'anjali.rao', minsAgo: 96, user: 'Santosh Kumar' },
  { id: 'a8', type: 'ota', title: 'OTA deployment completed', detail: 'Rollout v2.4.1 finished — 7,800 devices', entity: 'OTA-330', minsAgo: 120, user: 'System' },
];

// ---------------------------------------------------------------------------
// OTA
// ---------------------------------------------------------------------------
export const OTA_ROLLOUTS: OtaRollout[] = [
  { id: 'OTA-341', firmware: 'v2.5.0', fromVersion: 'v2.4.1', status: 'in_progress', total: 10000, pending: 1200, inProgress: 400, success: 7800, failed: 600, strategy: '10% → 25% → 50% → 100%', startedMins: 180 },
  { id: 'OTA-338', firmware: 'v2.4.1', fromVersion: 'v2.4.0', status: 'completed', total: 8600, pending: 0, inProgress: 0, success: 8540, failed: 60, strategy: '25% → 50% → 100%', startedMins: 2880 },
  { id: 'OTA-335', firmware: 'v2.4.0', fromVersion: 'v2.3.8', status: 'paused', total: 5400, pending: 3200, inProgress: 0, success: 2100, failed: 100, strategy: 'Canary 10%', startedMins: 620 },
];

export const OTA_SUMMARY = {
  currentVersion: 'v2.4.1',
  latestVersion: 'v2.5.0',
  pending: 1200,
  inProgress: 400,
  success: 7800,
  failed: 600,
};

export const FIRMWARE_DISTRIBUTION = [
  { version: 'v2.4.1', devices: 16420, pct: 66.1 },
  { version: 'v2.5.0', devices: 4210, pct: 16.9 },
  { version: 'v2.4.0', devices: 2680, pct: 10.8 },
  { version: 'v2.3.8', devices: 1050, pct: 4.2 },
  { version: 'v2.3.5', devices: 490, pct: 2.0 },
];

// ---------------------------------------------------------------------------
// Inventory / Dispatch / RMA
// ---------------------------------------------------------------------------
export const INVENTORY = {
  total: 3840,
  available: 1420,
  allocated: 640,
  dispatched: 980,
  inTransit: 310,
  returned: 210,
  faulty: 180,
  refurbishing: 100,
};

export const WAREHOUSES = [
  { name: 'Gurugram DC', available: 620, allocated: 240, faulty: 60 },
  { name: 'Pune DC', available: 410, allocated: 180, faulty: 48 },
  { name: 'Bengaluru DC', available: 260, allocated: 130, faulty: 42 },
  { name: 'Kolkata DC', available: 130, allocated: 90, faulty: 30 },
];

export const DISPATCHES: Dispatch[] = Array.from({ length: 14 }, (_, i) => {
  const region = pick(REGIONS);
  return {
    id: `DSP-${2200 + i}`,
    warehouse: pick(WAREHOUSES).name,
    destination: `${region.name} Hub`,
    devices: int(20, 320),
    courier: pick(['BlueDart', 'Delhivery', 'DTDC', 'Ecom Express']),
    tracking: `TRK${int(100000000, 999999999)}`,
    dispatchDate: `2026-08-${String(int(10, 20)).padStart(2, '0')}`,
    eta: `2026-08-${String(int(21, 28)).padStart(2, '0')}`,
    status: pick(['preparing', 'dispatched', 'in_transit', 'delivered', 'in_transit', 'delivered'] as const),
  };
});

export const RMA_ITEMS: RmaItem[] = Array.from({ length: 16 }, (_, i) => {
  const d = pick(DEVICES);
  return {
    id: `RMA-${1500 + i}`,
    deviceId: d.id,
    merchant: d.merchant,
    region: d.region,
    fault: pick(['Speaker dead', 'Battery swollen', 'Charging port broken', 'Water damage', 'Board failure', 'Mic fault']),
    stage: pick(['fault_reported', 'received', 'diagnosis', 'repair', 'refurbished', 'ready'] as const),
    reportedDays: int(1, 22),
    turnaroundDays: int(1, 14),
  };
});

// ---------------------------------------------------------------------------
// System health
// ---------------------------------------------------------------------------
export const SYSTEM_SERVICES: SystemService[] = [
  { name: 'IoT Gateway (MQTT)', status: 'operational', latencyMs: 42, errorRate: 0.02, queueDepth: 1280, lastHeartbeatSec: 2, detail: '24,676 devices connected' },
  { name: 'API Service', status: 'operational', latencyMs: 118, errorRate: 0.08, lastHeartbeatSec: 1, detail: 'p95 218ms' },
  { name: 'Database (Postgres)', status: 'operational', latencyMs: 9, errorRate: 0.0, lastHeartbeatSec: 1, detail: 'Replication healthy' },
  { name: 'Redis Cache', status: 'operational', latencyMs: 3, errorRate: 0.0, lastHeartbeatSec: 1, detail: 'Hit rate 98.4%' },
  { name: 'Job Queue', status: 'degraded', latencyMs: 0, errorRate: 1.4, queueDepth: 18400, lastHeartbeatSec: 4, detail: 'Backlog building — OTA jobs' },
  { name: 'Notification Service', status: 'operational', latencyMs: 64, errorRate: 0.3, lastHeartbeatSec: 3, detail: 'Email/SMS/Push nominal' },
  { name: 'Airtel Integration', status: 'operational', latencyMs: 240, errorRate: 0.5, lastHeartbeatSec: 38, detail: 'Last sync 6 min ago' },
  { name: 'Object Storage', status: 'operational', latencyMs: 88, errorRate: 0.0, lastHeartbeatSec: 5, detail: 'Audio assets — 2.4 TB' },
];

// ---------------------------------------------------------------------------
// Time-series helpers for charts
// ---------------------------------------------------------------------------
export function healthTrend(points = 30) {
  const tr = rng(555);
  return Array.from({ length: points }, (_, i) => {
    const day = points - i;
    const base = 22000 + Math.sin(i / 3) * 400;
    return {
      label: `D-${day}`,
      online: Math.round(base + tr() * 600),
      offline: Math.round(1000 + tr() * 200 + Math.cos(i / 4) * 120),
      lowBattery: Math.round(360 + tr() * 90),
      faulty: Math.round(280 + tr() * 40),
    };
  });
}

export function telemetrySeries(points = 24) {
  const tr = rng(777);
  let battery = 87;
  return Array.from({ length: points }, (_, i) => {
    battery = Math.max(20, battery - tr() * 2.4);
    return {
      label: `${String((points - i) - 1).padStart(2, '0')}h`,
      battery: Math.round(battery),
      signal: Math.round(2.6 + tr() * 1.4),
      volume: 70,
      temperature: Math.round(32 + tr() * 8),
    };
  });
}

export function sparkline(seed: number, points = 16, base = 50, amp = 20) {
  const tr = rng(seed);
  return Array.from({ length: points }, (_, i) => ({ i, v: Math.round(base + Math.sin(i / 2) * amp * 0.5 + tr() * amp) }));
}

export function ticketTrend() {
  const tr = rng(909);
  return Array.from({ length: 14 }, (_, i) => ({
    label: `D-${14 - i}`,
    open: Math.round(110 + tr() * 40),
    closed: Math.round(90 + tr() * 45),
  }));
}

export const CURRENT_USER = {
  name: 'Santosh Kumar',
  role: 'Operations Admin',
  email: 'santosh.kumar@nevonai.com',
  initials: 'SK',
};
