import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  width?: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  headerClassName?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  selectable,
  selected,
  onSelectedChange,
  onRowClick,
  rowActions,
  stickyHeader = true,
  dense,
  className,
  emptyState,
  pageSize = 12,
}: {
  columns: Column<T>[];
  rows: T[];
  selectable?: boolean;
  selected?: Set<string>;
  onSelectedChange?: (s: Set<string>) => void;
  onRowClick?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
  stickyHeader?: boolean;
  dense?: boolean;
  className?: string;
  emptyState?: React.ReactNode;
  pageSize?: number;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const arr = [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [rows, sort, columns]);

  const pageCount = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, page * pageSize + pageSize);

  const allOnPageSelected = selectable && paged.length > 0 && paged.every((r) => selected?.has(r.id));

  const toggleAll = () => {
    if (!onSelectedChange) return;
    const next = new Set(selected);
    if (allOnPageSelected) paged.forEach((r) => next.delete(r.id));
    else paged.forEach((r) => next.add(r.id));
    onSelectedChange(next);
  };
  const toggleOne = (id: string) => {
    if (!onSelectedChange) return;
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectedChange(next);
  };

  const sortBy = (key: string) => {
    setSort((prev) =>
      prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' },
    );
  };

  const cellPad = dense ? 'px-3 py-1.5' : 'px-3 py-2.5';

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
            <tr className="border-b border-line bg-neutralst-50/80 backdrop-blur">
              {selectable && (
                <th className="w-9 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!allOnPageSelected}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded border-line-strong text-brand-600 focus:ring-brand-500"
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={cn(
                    'whitespace-nowrap px-3 py-2 text-2xs font-semibold uppercase tracking-wide text-ink-500',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center',
                    c.headerClassName,
                  )}
                >
                  {c.sortValue ? (
                    <button
                      onClick={() => sortBy(c.key)}
                      className={cn('inline-flex items-center gap-1 hover:text-ink-800', c.align === 'right' && 'flex-row-reverse')}
                    >
                      {c.header}
                      {sort?.key === c.key ? (
                        sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={12} className="text-ink-300" />
                      )}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
              {rowActions && <th className="w-10 px-3 py-2" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {paged.map((row) => {
              const isSel = selected?.has(row.id);
              return (
                <tr
                  key={row.id}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'group transition-colors',
                    onRowClick && 'cursor-pointer',
                    isSel ? 'bg-brand-50/50' : 'hover:bg-neutralst-50/60',
                  )}
                >
                  {selectable && (
                    <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={!!isSel}
                        onChange={() => toggleOne(row.id)}
                        className="h-3.5 w-3.5 rounded border-line-strong text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={cn(
                        cellPad,
                        'text-[13px] text-ink-700',
                        c.align === 'right' && 'text-right',
                        c.align === 'center' && 'text-center',
                        c.className,
                      )}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                  {rowActions && (
                    <td className={cn(cellPad, 'text-right')} onClick={(e) => e.stopPropagation()}>
                      {rowActions(row)}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {paged.length === 0 && emptyState}

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-line px-3 py-2.5 text-xs text-ink-500">
          <span className="tabular-nums">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length.toLocaleString('en-IN')}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-line-strong px-2 py-1 font-medium disabled:opacity-40 hover:bg-neutralst-50"
            >
              Prev
            </button>
            <span className="px-1.5 tabular-nums">
              {page + 1} / {pageCount}
            </span>
            <button
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-line-strong px-2 py-1 font-medium disabled:opacity-40 hover:bg-neutralst-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
