import { Battery, BatteryLow, BatteryWarning, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------- Battery
export function BatteryIndicator({ value, charging, showBar = true }: { value: number; charging?: boolean; showBar?: boolean }) {
  const tone = value < 20 ? 'danger' : value < 40 ? 'warn' : 'ok';
  const toneText = { ok: 'text-ok-600', warn: 'text-warn-600', danger: 'text-danger-600' }[tone];
  const toneBar = { ok: 'bg-ok-500', warn: 'bg-warn-500', danger: 'bg-danger-500' }[tone];
  const Icon = value < 20 ? BatteryWarning : value < 40 ? BatteryLow : Battery;
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={14} className={cn('shrink-0', toneText)} />
      <span className={cn('tnum text-[13px] font-medium tabular-nums', toneText)}>{value}%</span>
      {charging && <span className="text-2xs text-ok-600">⚡</span>}
      {showBar && (
        <div className="h-1.5 w-10 overflow-hidden rounded-full bg-neutralst-100">
          <div className={cn('h-full rounded-full', toneBar)} style={{ width: `${value}%` }} />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Signal
export function SignalIndicator({ bars, dbm, connectivity }: { bars: number; dbm?: number; connectivity?: string }) {
  const heights = [4, 7, 10, 13];
  const tone = bars <= 1 ? 'bg-danger-500' : bars === 2 ? 'bg-warn-500' : 'bg-ok-500';
  return (
    <div className="flex items-center gap-1.5" title={dbm ? `${dbm} dBm` : undefined}>
      <div className="flex items-end gap-[2px]" style={{ height: 13 }}>
        {heights.map((h, i) => (
          <span
            key={i}
            className={cn('w-[3px] rounded-[1px]', i < bars ? tone : 'bg-neutralst-200')}
            style={{ height: h }}
          />
        ))}
      </div>
      {connectivity && <span className="text-2xs font-medium text-ink-500">{connectivity}</span>}
    </div>
  );
}

// ---------------------------------------------------------------- Trend delta
export function TrendDelta({ value, suffix = '%', invert = false, className }: { value: number; suffix?: string; invert?: boolean; className?: string }) {
  const positive = value > 0;
  const neutral = value === 0;
  // invert=true means "down is good" (e.g. offline count decreasing)
  const good = invert ? value < 0 : value > 0;
  const Icon = neutral ? Minus : positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 text-2xs font-semibold',
        neutral ? 'text-ink-400' : good ? 'text-ok-600' : 'text-danger-600',
        className,
      )}
    >
      <Icon size={12} />
      {value > 0 ? '+' : ''}
      {value}
      {suffix}
    </span>
  );
}

// ---------------------------------------------------------------- Sparkline
export function Sparkline({ data, color = '#2E5BE6', width = 88, height = 28 }: { data: { v: number }[]; color?: string; width?: number; height?: number }) {
  if (!data.length) return null;
  const vals = data.map((d) => d.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const pts = data.map((d, i) => `${i * step},${height - ((d.v - min) / range) * (height - 4) - 2}`);
  const area = `M0,${height} L${pts.join(' L')} L${width},${height} Z`;
  const line = `M${pts.join(' L')}`;
  const gid = `spark-${color.replace('#', '')}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------- Health ring (mini)
export function HealthRing({ value, size = 40, stroke = 4 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = value >= 95 ? '#16A34A' : value >= 85 ? '#D97706' : '#DC2626';
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EEF1F4" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={tone}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={c - (value / 100) * c}
        strokeLinecap="round"
      />
    </svg>
  );
}
