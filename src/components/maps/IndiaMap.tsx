import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Feature, FeatureCollection } from 'geojson';
import { fmt, pct, cn } from '@/lib/utils';
import {
  AreaStat,
  STATE_PROP,
  DIST_NAME_PROP,
  DIST_STATE_PROP,
  stateStat,
  buildDistrictStats,
  healthPct,
  healthTone,
  choroplethFill,
} from '@/data/geo';

const STATES_URL = `${import.meta.env.BASE_URL}geo/india-states.geojson`;
const DISTRICTS_URL = `${import.meta.env.BASE_URL}geo/india-districts.geojson`;

// zoom at/above which we switch from state choropleth to district choropleth
const DISTRICT_ZOOM = 7;
const INDIA_CENTER: [number, number] = [22.6, 80.9];

type Level = 'state' | 'district';

// ---------------------------------------------------------------------------
// Zoom watcher — reports the current zoom so we can flip state <-> district.
// Also fixes Leaflet's classic "0-width container" issue when the map mounts
// while its card is hidden (behind a route/tab) by recomputing size on mount
// and whenever the container resizes.
// ---------------------------------------------------------------------------
function MapController({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
  });
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const t = setTimeout(fix, 0);
    const ro = new ResizeObserver(fix);
    ro.observe(map.getContainer());
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, [map]);
  return null;
}

// ---------------------------------------------------------------------------
// A choropleth GeoJSON layer with permanent count labels + hover highlight
// ---------------------------------------------------------------------------
function ChoroplethLayer({
  data,
  statFor,
  maxDevices,
  onHover,
  onSelect,
}: {
  data: FeatureCollection;
  statFor: (f: Feature) => AreaStat | null;
  maxDevices: number;
  onHover: (s: AreaStat | null) => void;
  onSelect: (s: AreaStat | null) => void;
}) {
  const baseStyle = (f?: Feature): L.PathOptions => {
    const s = f ? statFor(f) : null;
    return {
      color: '#ffffff',
      weight: 1,
      fillColor: choroplethFill(s?.devices ?? 0, maxDevices),
      fillOpacity: s ? 0.82 : 0.35,
    };
  };

  return (
    <GeoJSON
      data={data}
      style={baseStyle as L.StyleFunction}
      onEachFeature={(feature, layer) => {
        const s = statFor(feature);
        if (s) {
          layer.bindTooltip(
            `<span class="mp-lbl-name">${s.name}</span><span class="mp-lbl-val">${fmt(s.devices)}</span>`,
            { permanent: true, direction: 'center', className: 'mp-count', opacity: 1 },
          );
        }
        layer.on({
          mouseover: (e) => {
            const l = e.target as L.Path;
            l.setStyle({ weight: 2.5, color: '#0f172a', fillOpacity: 0.95 });
            l.bringToFront();
            onHover(s);
          },
          mouseout: (e) => {
            (e.target as L.Path).setStyle(baseStyle(feature));
            onHover(null);
          },
          click: () => onSelect(s),
        });
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Detail card — online / offline / faulty breakdown for hovered/selected area
// ---------------------------------------------------------------------------
function DetailCard({ stat, level }: { stat: AreaStat; level: Level }) {
  const h = healthPct(stat);
  const tone = healthTone(h);
  return (
    <div className="pointer-events-none absolute right-3 top-3 z-[500] w-52 rounded-lg border border-line bg-white/95 p-3 shadow-pop backdrop-blur">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-[13px] font-semibold leading-tight text-ink-900">{stat.name}</div>
          <div className="text-2xs text-ink-400">
            {level === 'district' ? `${stat.state} · district` : 'State'}
          </div>
        </div>
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-2xs font-semibold"
          style={{ color: tone, background: `${tone}18` }}
        >
          {pct(h)}
        </span>
      </div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-2xs text-ink-400">Total devices</span>
        <span className="text-sm font-semibold tabular-nums text-ink-900">{fmt(stat.devices)}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-2xs">
        <StatRow dot="#16A34A" label="Online" value={stat.online} />
        <StatRow dot="#DC2626" label="Offline" value={stat.offline} />
        <StatRow dot="#7E22CE" label="Faulty" value={stat.faulty} />
        <StatRow dot="#D97706" label="Low batt" value={stat.lowBattery} />
      </div>
    </div>
  );
}

function StatRow({ dot, label, value }: { dot: string; label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1 text-ink-400">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
        {label}
      </span>
      <span className="font-semibold tabular-nums text-ink-900">{fmt(value)}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main map
// ---------------------------------------------------------------------------
export function IndiaMap({ fullscreen = false }: { fullscreen?: boolean }) {
  const [states, setStates] = useState<FeatureCollection | null>(null);
  const [districts, setDistricts] = useState<FeatureCollection | null>(null);
  const [distStats, setDistStats] = useState<Map<string, AreaStat> | null>(null);
  const [zoom, setZoom] = useState(5);
  const [hover, setHover] = useState<AreaStat | null>(null);
  const [pinned, setPinned] = useState<AreaStat | null>(null);
  const districtsLoading = useRef(false);

  const level: Level = zoom >= DISTRICT_ZOOM ? 'district' : 'state';

  // load state boundaries once
  useEffect(() => {
    let alive = true;
    fetch(STATES_URL)
      .then((r) => r.json())
      .then((g: FeatureCollection) => alive && setStates(g))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // lazily load district boundaries the first time we zoom in
  useEffect(() => {
    if (level !== 'district' || districts || districtsLoading.current) return;
    districtsLoading.current = true;
    fetch(DISTRICTS_URL)
      .then((r) => r.json())
      .then((g: FeatureCollection) => {
        setDistStats(buildDistrictStats(g.features as Feature[]));
        setDistricts(g);
      })
      .catch(() => {
        districtsLoading.current = false;
      });
  }, [level, districts]);

  const stateMax = useMemo(() => {
    if (!states) return 1;
    let m = 1;
    for (const f of states.features)
      m = Math.max(m, stateStat(String(f.properties?.[STATE_PROP] ?? ''))?.devices ?? 0);
    return m;
  }, [states]);

  const distMax = useMemo(() => {
    if (!distStats) return 1;
    let m = 1;
    for (const s of distStats.values()) m = Math.max(m, s.devices);
    return m;
  }, [distStats]);

  const stateStatFor = (f: Feature): AreaStat | null =>
    stateStat(String(f.properties?.[STATE_PROP] ?? ''));

  const distStatFor = (f: Feature): AreaStat | null => {
    if (!distStats) return null;
    const key = `${f.properties?.[DIST_STATE_PROP]}|${String(f.properties?.[DIST_NAME_PROP] ?? '').trim()}`;
    return distStats.get(key) ?? null;
  };

  const shown = hover ?? pinned;

  return (
    <div className={cn('relative w-full overflow-hidden rounded-lg border border-line', fullscreen ? 'h-full min-h-[460px]' : 'h-[460px]')}>
      <MapContainer
        center={INDIA_CENTER}
        zoom={5}
        minZoom={4}
        maxZoom={10}
        scrollWheelZoom
        zoomControl
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
      >
        <MapController onZoom={setZoom} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {level === 'state' && states && (
          <ChoroplethLayer
            key="states"
            data={states}
            statFor={stateStatFor}
            maxDevices={stateMax}
            onHover={setHover}
            onSelect={setPinned}
          />
        )}

        {level === 'district' && districts && distStats && (
          <ChoroplethLayer
            key="districts"
            data={districts}
            statFor={distStatFor}
            maxDevices={distMax}
            onHover={setHover}
            onSelect={setPinned}
          />
        )}
      </MapContainer>

      {/* level pill */}
      <div className="pointer-events-none absolute left-3 top-3 z-[500] flex items-center gap-1.5 rounded-md border border-line bg-white/95 px-2 py-1 text-2xs font-semibold text-ink-600 shadow-sm backdrop-blur">
        <span
          className={cn('h-1.5 w-1.5 rounded-full', level === 'district' ? 'bg-brand-500' : 'bg-ok-500')}
        />
        {level === 'district' ? 'District view' : 'State view'}
        {level === 'district' && !districts && <span className="text-ink-400">· loading…</span>}
      </div>

      {/* detail card */}
      {shown && <DetailCard stat={shown} level={level} />}

      {/* hint + legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-md border border-line bg-white/95 px-2.5 py-1.5 shadow-sm backdrop-blur">
        <div className="mb-1 text-2xs font-medium text-ink-500">Device density</div>
        <div className="flex items-center gap-1">
          {['#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'].map((c) => (
            <span key={c} className="h-2 w-5" style={{ background: c }} />
          ))}
        </div>
        <div className="mt-0.5 flex justify-between text-[9px] text-ink-400">
          <span>Low</span>
          <span>High</span>
        </div>
        <div className="mt-1 text-[9px] text-ink-400">Zoom in for districts · hover for details</div>
      </div>
    </div>
  );
}
