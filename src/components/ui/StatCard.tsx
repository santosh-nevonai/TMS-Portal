import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn, fmt } from '@/lib/utils';
import { TrendDelta, Sparkline } from './indicators';

export function StatCard({
  label,
  value,
  sub,
  delta,
  deltaInvert,
  icon,
  tone = 'default',
  to,
  spark,
  sparkColor,
  className,
}: {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  delta?: number;
  deltaInvert?: boolean;
  icon?: React.ReactNode;
  tone?: 'default' | 'ok' | 'warn' | 'danger' | 'purple' | 'brand';
  to?: string;
  spark?: { v: number }[];
  sparkColor?: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const accent: Record<string, string> = {
    default: 'text-ink-400 bg-neutralst-50',
    brand: 'text-brand-600 bg-brand-50',
    ok: 'text-ok-600 bg-ok-50',
    warn: 'text-warn-600 bg-warn-50',
    danger: 'text-danger-600 bg-danger-50',
    purple: 'text-[#7E22CE] bg-[#F6EDFE]',
  };
  const clickable = !!to;
  return (
    <div
      onClick={to ? () => navigate(to) : undefined}
      className={cn(
        'group card px-4 py-3.5 transition-all',
        clickable && 'cursor-pointer hover:shadow-card-hover hover:border-line-strong',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg', accent[tone])}>{icon}</span>}
          <span className="text-xs font-medium text-ink-500">{label}</span>
        </div>
        {clickable && <ArrowUpRight size={14} className="text-ink-300 opacity-0 transition-opacity group-hover:opacity-100" />}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <div className="tnum text-[26px] font-bold leading-none tracking-tight text-ink-900 tabular-nums">
            {typeof value === 'number' ? fmt(value) : value}
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            {delta !== undefined && <TrendDelta value={delta} invert={deltaInvert} />}
            {sub && <span className="text-2xs text-ink-500">{sub}</span>}
          </div>
        </div>
        {spark && (
          <div className="opacity-80">
            <Sparkline data={spark} color={sparkColor} />
          </div>
        )}
      </div>
    </div>
  );
}
