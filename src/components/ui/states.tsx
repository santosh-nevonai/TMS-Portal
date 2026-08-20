import React from 'react';
import { AlertTriangle, RefreshCw, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './primitives';

// ---------------------------------------------------------------- Empty state
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-14 text-center', className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-neutralst-50 text-ink-400">
        {icon ?? <Inbox size={22} />}
      </div>
      <h4 className="text-sm font-semibold text-ink-900">{title}</h4>
      {description && <p className="mt-1 max-w-sm text-[13px] text-ink-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------- Error state
export function ErrorState({
  title = 'Unable to load data',
  description = 'The service may be temporarily unavailable. Please try again.',
  onRetry,
  secondary,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  secondary?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-danger-50 text-danger-500">
        <AlertTriangle size={22} />
      </div>
      <h4 className="text-sm font-semibold text-ink-900">{title}</h4>
      <p className="mt-1 max-w-sm text-[13px] text-ink-500">{description}</p>
      <div className="mt-4 flex items-center gap-2">
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCw size={13} /> Retry
          </Button>
        )}
        {secondary}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Skeletons
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('relative overflow-hidden rounded-md bg-neutralst-100 animate-shimmer', className)} />;
}

export function SkeletonTable({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={cn('h-3.5', c === 0 ? 'w-24' : c === cols - 1 ? 'w-10 ml-auto' : 'w-16')} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-7 w-28" />
      <Skeleton className="mt-3 h-2 w-16" />
    </div>
  );
}
