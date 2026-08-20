import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REGIONS } from '@/data/mock';
import type { Region } from '@/types';
import { cn, fmt, pct } from '@/lib/utils';

function health(r: Region) {
  return (r.online / r.devices) * 100;
}
function tone(h: number) {
  return h >= 94 ? '#16A34A' : h >= 90 ? '#D97706' : '#DC2626';
}

// Simplified, stylised India silhouette (decorative backdrop, not survey-accurate).
const INDIA_PATH =
  'M38 13 L44 14 L46 20 L54 22 L62 30 L60 34 L68 36 L64 40 L67 45 L60 46 L58 54 L52 64 L50 72 L45 85 L40 74 L36 64 L33 56 L28 50 L20 46 L24 42 L22 38 L28 36 L30 28 L34 22 Z';

export function IndiaMap({ statusFilter }: { statusFilter?: string }) {
  const [hover, setHover] = useState<Region | null>(null);
  const navigate = useNavigate();
  const maxDevices = Math.max(...REGIONS.map((r) => r.devices));

  return (
    <div className="relative">
      <div className="relative aspect-[4/5] w-full grid-dots rounded-lg">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <path d={INDIA_PATH} fill="#EEF2F7" stroke="#DCE3EB" strokeWidth="0.4" />
          {/* connecting hub lines */}
          {REGIONS.map((r) => (
            <line key={`l-${r.id}`} x1="45" y1="48" x2={r.x} y2={r.y} stroke="#E2E8F0" strokeWidth="0.2" strokeDasharray="0.6 0.6" />
          ))}
          {REGIONS.map((r) => {
            const h = health(r);
            const radius = 2.2 + (r.devices / maxDevices) * 3.8;
            const c = tone(h);
            const isHover = hover?.id === r.id;
            return (
              <g
                key={r.id}
                className="cursor-pointer"
                onMouseEnter={() => setHover(r)}
                onMouseLeave={() => setHover(null)}
                onClick={() => navigate(`/devices?region=${encodeURIComponent(r.name)}`)}
              >
                <circle cx={r.x} cy={r.y} r={radius + 1.6} fill={c} opacity={isHover ? 0.22 : 0.12} />
                <circle cx={r.x} cy={r.y} r={radius} fill={c} opacity={0.9} stroke="#fff" strokeWidth="0.5" />
                <text x={r.x} y={r.y + radius + 2.6} textAnchor="middle" className="fill-ink-500" style={{ fontSize: 2.4, fontWeight: 600 }}>
                  {r.short}
                </text>
              </g>
            );
          })}
        </svg>

        {hover && (
          <div
            className="pointer-events-none absolute z-20 w-44 rounded-lg border border-line bg-white p-2.5 shadow-pop"
            style={{ left: `min(${hover.x}%, 62%)`, top: `${Math.max(4, hover.y - 18)}%` }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-ink-900">{hover.name}</span>
              <span className="rounded px-1 py-0.5 text-2xs font-semibold" style={{ color: tone(health(hover)), background: `${tone(health(hover))}18` }}>
                {pct(health(hover))}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-2xs">
              <Row label="Devices" value={fmt(hover.devices)} />
              <Row label="Online" value={fmt(hover.online)} tone="text-ok-600" />
              <Row label="Offline" value={fmt(hover.offline)} tone="text-danger-600" />
              <Row label="Faulty" value={fmt(hover.faulty)} tone="text-[#7E22CE]" />
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-4 text-2xs text-ink-500">
        <Legend color="#16A34A" label="≥ 94% healthy" />
        <Legend color="#D97706" label="90–94%" />
        <Legend color="#DC2626" label="< 90%" />
        <span className="text-ink-400">· bubble size = fleet count</span>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-400">{label}</span>
      <span className={cn('font-semibold tabular-nums', tone ?? 'text-ink-900')}>{value}</span>
    </div>
  );
}
function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
