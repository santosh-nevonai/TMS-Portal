import React from 'react';
import { cn } from '@/lib/utils';

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
  size = 'md',
}: {
  tabs: { value: T; label: React.ReactNode; count?: number; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div className={cn('flex items-center gap-0.5 border-b border-line overflow-x-auto', className)}>
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            onClick={() => onChange(t.value)}
            className={cn(
              'relative flex items-center gap-1.5 whitespace-nowrap border-b-2 font-medium transition-colors',
              size === 'sm' ? 'px-2.5 py-2 text-xs' : 'px-3 py-2.5 text-[13px]',
              active
                ? 'border-brand-600 text-ink-900'
                : 'border-transparent text-ink-500 hover:text-ink-700 hover:border-line-strong',
            )}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-px text-2xs font-semibold tabular-nums',
                  active ? 'bg-brand-50 text-brand-700' : 'bg-neutralst-100 text-ink-500',
                )}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
