import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { cn, fmt } from '@/lib/utils';

const AXIS = { fontSize: 11, fill: '#94A3B8' };
const GRID = '#EEF1F4';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 shadow-pop">
      {label && <div className="mb-1 text-2xs font-semibold uppercase tracking-wide text-ink-400">{label}</div>}
      <div className="space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-ink-500">{p.name}</span>
            <span className="ml-auto font-semibold tabular-nums text-ink-900">{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AreaTrend({
  data,
  series,
  height = 240,
  yWidth = 40,
}: {
  data: any[];
  series: { key: string; name: string; color: string }[];
  height?: number;
  yWidth?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} minTickGap={24} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={yWidth} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
        <Tooltip content={<ChartTooltip />} />
        {series.map((s) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            fill={`url(#g-${s.key})`}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 2, stroke: '#fff' }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({
  data,
  series,
  height = 240,
}: {
  data: any[];
  series: { key: string; name: string; color: string }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} minTickGap={20} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
        <Tooltip content={<ChartTooltip />} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BarTrend({
  data,
  series,
  height = 240,
  stacked,
}: {
  data: any[];
  series: { key: string; name: string; color: string }[];
  height?: number;
  stacked?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap={stacked ? '20%' : '28%'}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} minTickGap={12} />
        <YAxis tick={AXIS} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} stackId={stacked ? 'a' : undefined} radius={stacked ? 0 : [3, 3, 0, 0]} maxBarSize={38} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({
  data,
  height = 200,
  inner = 58,
  outer = 82,
  center,
}: {
  data: { label: string; value: number; color: string; count?: number }[];
  height?: number;
  inner?: number;
  outer?: number;
  center?: React.ReactNode;
}) {
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={inner} outerRadius={outer} paddingAngle={1.5} stroke="none" startAngle={90} endAngle={-270}>
            {data.map((d) => (
              <Cell key={d.label} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }: any) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-line bg-white px-3 py-2 shadow-pop">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full" style={{ background: payload[0].payload.color }} />
                    <span className="text-ink-500">{payload[0].payload.label}</span>
                    <span className="ml-auto font-semibold text-ink-900">{payload[0].payload.value}%</span>
                  </div>
                </div>
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
      {center && <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">{center}</div>}
    </div>
  );
}
