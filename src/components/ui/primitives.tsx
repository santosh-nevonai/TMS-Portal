import React from 'react';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------- Button
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

const btnBase =
  'inline-flex items-center justify-center gap-1.5 font-medium rounded-lg transition-colors select-none disabled:opacity-50 disabled:pointer-events-none focus-visible:focus-ring whitespace-nowrap';
const btnVariants: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm',
  secondary: 'bg-white text-ink-700 border border-line-strong hover:bg-neutralst-50 hover:border-ink-300',
  outline: 'bg-transparent text-ink-700 border border-line-strong hover:bg-neutralst-50',
  ghost: 'text-ink-700 hover:bg-neutralst-50',
  subtle: 'bg-neutralst-50 text-ink-700 hover:bg-neutralst-100',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 shadow-sm',
};
const btnSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-[13px]',
  md: 'h-9 px-3.5 text-sm',
  lg: 'h-10 px-4 text-sm',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...props
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(btnBase, btnVariants[variant], btnSizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function IconButton({
  className,
  children,
  label,
  active,
  ...props
}: { label?: string; active?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-neutralst-50 hover:text-ink-700 focus-visible:focus-ring',
        active && 'bg-neutralst-100 text-ink-900',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------- Card
export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-4 py-3 border-b border-line', className)}>
      <div className="flex items-start gap-2.5 min-w-0">
        {icon && <div className="mt-0.5 text-ink-400">{icon}</div>}
        <div className="min-w-0">
          <h3 className="text-[13.5px] font-semibold text-ink-900 leading-tight truncate">{title}</h3>
          {subtitle && <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-1.5 shrink-0">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------- Badge
export function Badge({
  children,
  className,
  tone = 'gray',
}: {
  children: React.ReactNode;
  className?: string;
  tone?: 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'purple';
}) {
  const tones: Record<string, string> = {
    gray: 'bg-neutralst-50 text-ink-600 border-line',
    blue: 'bg-info-50 text-info-600 border-info-100',
    green: 'bg-ok-50 text-ok-700 border-ok-100',
    amber: 'bg-warn-50 text-warn-700 border-warn-100',
    red: 'bg-danger-50 text-danger-700 border-danger-100',
    purple: 'bg-[#F6EDFE] text-[#7E22CE] border-[#E9D5FF]',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-2xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusDot({ className, pulse }: { className?: string; pulse?: boolean }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      {pulse && <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-60', className)} />}
      <span className={cn('relative inline-flex h-2 w-2 rounded-full', className)} />
    </span>
  );
}

export function StatusBadge({
  tone,
  label,
  pulse,
  className,
}: {
  tone: { dot: string; text: string; bg: string; border: string; label: string };
  label?: string;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-2xs font-medium',
        tone.bg,
        tone.text,
        tone.border,
        className,
      )}
    >
      <StatusDot className={tone.dot} pulse={pulse} />
      {label ?? tone.label}
    </span>
  );
}

// ---------------------------------------------------------------- Segmented
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className,
}: {
  options: { value: T; label: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div className={cn('inline-flex items-center rounded-lg bg-neutralst-50 p-0.5 border border-line', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded-md font-medium transition-colors',
            size === 'sm' ? 'px-2 py-1 text-2xs' : 'px-2.5 py-1 text-xs',
            value === o.value ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Progress
export function Progress({
  value,
  className,
  tone = 'brand',
  size = 'md',
}: {
  value: number;
  className?: string;
  tone?: 'brand' | 'ok' | 'warn' | 'danger';
  size?: 'sm' | 'md';
}) {
  const tones = { brand: 'bg-brand-600', ok: 'bg-ok-500', warn: 'bg-warn-500', danger: 'bg-danger-500' };
  return (
    <div className={cn('w-full overflow-hidden rounded-full bg-neutralst-100', size === 'sm' ? 'h-1.5' : 'h-2', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-500', tones[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------- Avatar
export function Avatar({ initials, className, size = 'md' }: { initials: string; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-6 w-6 text-2xs', md: 'h-8 w-8 text-xs', lg: 'h-10 w-10 text-sm' };
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ring-1 ring-brand-200/60',
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border border-line-strong bg-neutralst-50 px-1 font-sans text-2xs font-medium text-ink-500">
      {children}
    </kbd>
  );
}

export function Tooltip({ label, children, side = 'top' }: { label: React.ReactNode; children: React.ReactNode; side?: 'top' | 'bottom' | 'left' | 'right' }) {
  const pos = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
  };
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 hidden whitespace-nowrap rounded-md bg-navy-900 px-2 py-1 text-2xs font-medium text-white shadow-pop group-hover/tt:block',
          pos[side],
        )}
      >
        {label}
      </span>
    </span>
  );
}
