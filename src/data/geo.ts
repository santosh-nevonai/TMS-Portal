// ============================================================================
// Geo helpers for the Leaflet map — state-name mapping + deterministic mock
// district-level device stats derived from the state (REGIONS) totals.
// ============================================================================
import { REGIONS } from '@/data/mock';
import type { Region } from '@/types';

export interface AreaStat {
  key: string; // unique id (state or "state|district")
  name: string; // display name
  state: string; // parent state (geojson st_nm)
  devices: number;
  online: number;
  offline: number;
  faulty: number;
  lowBattery: number;
}

// GeoJSON property names
export const STATE_PROP = 'ST_NM'; // india-states.geojson
export const DIST_NAME_PROP = 'district'; // india-districts.geojson
export const DIST_STATE_PROP = 'st_nm';

// Region.name -> geojson ST_NM (most already match; only a couple differ)
const REGION_TO_GEO: Record<string, string> = {
  'Delhi NCR': 'Delhi',
};

// Reverse: geojson state name -> Region
const REGION_BY_GEO: Record<string, Region> = {};
for (const r of REGIONS) {
  REGION_BY_GEO[REGION_TO_GEO[r.name] ?? r.name] = r;
}

export function regionForState(stateName: string): Region | undefined {
  return REGION_BY_GEO[stateName];
}

/** Stable string hash -> [0,1). */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // to unsigned then normalise
  return ((h >>> 0) % 100000) / 100000;
}

/** State-level stat straight from REGIONS. */
export function stateStat(stateName: string): AreaStat | null {
  const r = regionForState(stateName);
  if (!r) return null;
  return {
    key: stateName,
    name: r.name,
    state: stateName,
    devices: r.devices,
    online: r.online,
    offline: r.offline,
    faulty: r.faulty,
    lowBattery: r.lowBattery,
  };
}

/**
 * Build deterministic district stats for every district feature, distributing
 * each state's REGIONS totals across its districts by a stable per-district
 * weight so the district numbers always sum back to the state total.
 */
export function buildDistrictStats(
  features: Array<{ properties: Record<string, unknown> | null }>,
): Map<string, AreaStat> {
  // group district names by state
  const byState = new Map<string, string[]>();
  for (const f of features) {
    const p = f.properties ?? {};
    const state = String(p[DIST_STATE_PROP] ?? '');
    const name = String(p[DIST_NAME_PROP] ?? '').trim();
    if (!state || !name) continue;
    const arr = byState.get(state) ?? [];
    arr.push(name);
    byState.set(state, arr);
  }

  const out = new Map<string, AreaStat>();
  for (const [state, districts] of byState) {
    const region = regionForState(state);
    if (!region) continue; // no data for this state -> skip (renders as "no data")

    // stable weights
    const weights = districts.map((d) => 0.35 + hash01(state + '::' + d));
    const total = weights.reduce((a, b) => a + b, 0);

    // proportional split, keeping running remainder so sums stay exact-ish
    let devLeft = region.devices;
    let onLeft = region.online;
    let offLeft = region.offline;
    let fltLeft = region.faulty;
    let lowLeft = region.lowBattery;

    districts.forEach((d, i) => {
      const last = i === districts.length - 1;
      const share = weights[i] / total;
      const devices = last ? devLeft : Math.max(1, Math.round(region.devices * share));
      const online = last ? onLeft : Math.min(devices, Math.round(region.online * share));
      const offline = last ? offLeft : Math.round(region.offline * share);
      const faulty = last ? fltLeft : Math.round(region.faulty * share);
      const lowBattery = last ? lowLeft : Math.round(region.lowBattery * share);

      devLeft -= devices;
      onLeft -= online;
      offLeft -= offline;
      fltLeft -= faulty;
      lowLeft -= lowBattery;

      out.set(state + '|' + d, {
        key: state + '|' + d,
        name: d,
        state,
        devices,
        online: Math.max(0, online),
        offline: Math.max(0, offline),
        faulty: Math.max(0, faulty),
        lowBattery: Math.max(0, lowBattery),
      });
    });
  }
  return out;
}

export function healthPct(s: { online: number; devices: number }): number {
  return s.devices ? (s.online / s.devices) * 100 : 0;
}

export function healthTone(h: number): string {
  return h >= 94 ? '#16A34A' : h >= 90 ? '#D97706' : '#DC2626';
}

/** Blue sequential choropleth fill by value relative to the layer max. */
export function choroplethFill(value: number, max: number): string {
  if (!value || !max) return '#eef2f7';
  const r = value / max;
  return r > 0.8
    ? '#1d4ed8'
    : r > 0.6
      ? '#2563eb'
      : r > 0.4
        ? '#3b82f6'
        : r > 0.22
          ? '#60a5fa'
          : r > 0.08
            ? '#93c5fd'
            : '#bfdbfe';
}
