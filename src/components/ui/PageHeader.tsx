import React from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  subtitle,
  actions,
  children,
  className,
  meta,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-4', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-ink-900">{title}</h1>
            {meta}
          </div>
          {subtitle && <p className="mt-1 text-[13px] text-ink-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
