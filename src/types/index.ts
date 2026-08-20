// ============================================================================
// Domain types for the Soundbox Fleet Management platform
// ============================================================================

export type DeviceStatus =
  | 'online'
  | 'offline'
  | 'warning'
  | 'faulty'
  | 'inactive';

export type Connectivity = '4G' | 'Wi-Fi' | 'SIM';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Device {
  id: string; // NV-SB-001
  serial: string;
  imei: string;
  iccid: string;
  model: string;
  sku: string; // SKU code, e.g. NV-SBPRO-4G-STD
  skuName: string; // human name, e.g. Soundbox Pro 4G
  deviceGroups: string[]; // device group ids this device belongs to
  hardware: string;
  firmware: string;
  status: DeviceStatus;
  battery: number; // 0-100
  charging: boolean;
  signal: number; // 0-4 bars
  signalDbm: number;
  connectivity: Connectivity;
  volume: number; // 0-100
  temperature: number; // C
  merchantId: string;
  merchant: string;
  merchantCategory: string;
  region: string;
  state: string;
  city: string;
  lat?: number;
  lng?: number;
  hasGps: boolean;
  lastSyncMins: number; // minutes since last heartbeat
  lastTxnMins: number;
  activationDate: string;
  assigned: boolean;
  rmaStatus?: RmaStage | null;
  uptime30d: number; // %
}

export interface Region {
  id: string;
  name: string;
  short: string;
  devices: number;
  online: number;
  offline: number;
  faulty: number;
  lowBattery: number;
  x: number; // % position on schematic map
  y: number;
}

export interface Alert {
  id: string;
  severity: Severity;
  type:
    | 'Low Battery'
    | 'Offline'
    | 'Tamper'
    | 'SIM Swap'
    | 'Command Failure'
    | 'Connectivity'
    | 'Firmware Failure';
  title: string;
  deviceId: string;
  merchant: string;
  region: string;
  triggeredMins: number;
  durationMins: number;
  assignedTo?: string;
  status: 'open' | 'acknowledged' | 'resolved';
}

export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';

export interface Ticket {
  id: string;
  priority: Severity;
  subject: string;
  merchant: string;
  deviceId: string;
  region: string;
  assignee: string;
  slaMins: number; // minutes remaining (negative = breached)
  status: TicketStatus;
  createdMins: number;
  category: string;
}

export type CampaignStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'scheduled'
  | 'live'
  | 'completed'
  | 'rejected';

export interface Campaign {
  id: string;
  name: string;
  audio: string;
  language: string;
  status: CampaignStatus;
  targetDevices: number;
  plays: number;
  reach: number; // %
  completion: number; // %
  start: string;
  end: string;
  createdBy: string;
  submittedMins?: number;
  priority: 'standard' | 'high' | 'override';
}

export interface AudioAsset {
  id: string;
  name: string;
  language: string;
  durationSec: number;
  category: string;
  sizeKb: number;
  uploadedBy: string;
  status: 'approved' | 'pending' | 'rejected';
  created: string;
}

export type RmaStage =
  | 'fault_reported'
  | 'received'
  | 'diagnosis'
  | 'repair'
  | 'refurbished'
  | 'ready'
  | 'scrap';

export interface RmaItem {
  id: string;
  deviceId: string;
  merchant: string;
  region: string;
  fault: string;
  stage: RmaStage;
  reportedDays: number;
  turnaroundDays: number;
}

export interface Dispatch {
  id: string;
  warehouse: string;
  destination: string;
  devices: number;
  courier: string;
  tracking: string;
  dispatchDate: string;
  eta: string;
  status: 'preparing' | 'dispatched' | 'in_transit' | 'delivered' | 'failed' | 'returned';
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  region: string;
  state: string;
  kyc: 'verified' | 'pending' | 'rejected';
  devices: number;
  online: number;
  offline: number;
  faulty: number;
  status: DeviceStatus;
  lastSyncMins: number;
  onboarded: string;
}

export type CommandStatus =
  | 'sent'
  | 'pending'
  | 'delivered'
  | 'executed'
  | 'failed'
  | 'expired';

export interface DeviceCommand {
  id: string;
  command: string;
  requestedBy: string;
  requestedMins: number;
  status: CommandStatus;
  deliveredSec?: number;
  executedSec?: number;
}

export interface ActivityEvent {
  id: string;
  type:
    | 'reboot'
    | 'ota'
    | 'campaign'
    | 'mapping'
    | 'block'
    | 'ticket'
    | 'permission'
    | 'alert';
  title: string;
  detail: string;
  entity: string;
  minsAgo: number;
  user: string;
}

export interface OtaRollout {
  id: string;
  firmware: string;
  fromVersion: string;
  status: 'in_progress' | 'paused' | 'completed' | 'failed' | 'scheduled';
  total: number;
  pending: number;
  inProgress: number;
  success: number;
  failed: number;
  strategy: string;
  startedMins: number;
}

export interface SystemService {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latencyMs: number;
  errorRate: number;
  queueDepth?: number;
  lastHeartbeatSec: number;
  detail: string;
}

export interface Sku {
  id: string; // SKU-SBPRO4G
  code: string; // NV-SBPRO-4G-STD
  name: string; // Soundbox Pro 4G
  model: string; // SB-Pro-4G
  variant: string; // Standard / Lite / Max
  connectivity: Connectivity;
  hardware: string;
  batteryMah: number;
  firmwareBaseline: string;
  status: 'active' | 'eol' | 'draft';
  deployed: number; // devices in field
  inStock: number; // warehouse units
}

export interface DeviceGroup {
  id: string; // GRP-001
  name: string;
  description: string;
  type: 'static' | 'dynamic';
  criteria?: string; // rule expression for dynamic groups
  devices: number;
  online: number;
  scope: string; // e.g. "All India", "Maharashtra"
  createdBy: string;
  updatedMins: number;
  usedIn: number; // campaigns/rollouts referencing it
}
