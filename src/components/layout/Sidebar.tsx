import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV } from '@/config/nav';
import { cn } from '@/lib/utils';
import { ChevronLeft, PanelLeftClose } from 'lucide-react';

function Badge({ value, tone }: { value: number; tone?: 'danger' | 'warn' | 'brand' }) {
  const tones = {
    danger: 'bg-danger-500/90 text-white',
    warn: 'bg-warn-500/90 text-white',
    brand: 'bg-brand-500 text-white',
  };
  return (
    <span className={cn('ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-2xs font-semibold tabular-nums', tones[tone ?? 'brand'])}>
      {value}
    </span>
  );
}

/**
 * Hover label for collapsed nav items. Rendered through a portal with fixed
 * positioning so it is never clipped by the sidebar's scroll overflow.
 */
function CollapsedLabel({ label, children }: { label: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTip({ top: r.top + r.height / 2, left: r.right + 10 });
  };
  const hide = () => setTip(null);

  return (
    <div ref={ref} className="relative" onMouseEnter={show} onMouseLeave={hide} onFocusCapture={show} onBlurCapture={hide}>
      {children}
      {tip &&
        createPortal(
          <span
            role="tooltip"
            style={{ top: tip.top, left: tip.left }}
            className="pointer-events-none fixed z-[100] -translate-y-1/2 whitespace-nowrap rounded-md bg-navy-900 px-2 py-1 text-2xs font-medium text-white shadow-pop"
          >
            {label}
          </span>,
          document.body,
        )}
    </div>
  );
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const loc = useLocation();
  return (
    <aside
      className={cn(
        'scroll-dark z-30 flex h-full shrink-0 flex-col border-r border-[var(--sb-border)] bg-[var(--sb-bg)] text-[var(--sb-fg)] transition-[width] duration-200',
        collapsed ? 'w-[64px]' : 'w-[236px]',
      )}
    >
      {/* Brand */}
      <div className={cn('flex h-14 items-center gap-2.5 border-b border-[var(--sb-border)] px-3.5', collapsed && 'justify-center px-0')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 shadow-sm">
          <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none">
            <path d="M16 7v18M11 11v10M21 11v10M7 14.5v3M25 14.5v3" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-[13px] font-bold leading-tight text-[var(--sb-fg-strong)]">Nevon FleetOps</div>
            <div className="text-2xs text-[var(--sb-fg-muted)]">Soundbox Platform</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        {NAV.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.09em] text-[var(--sb-fg-subtle)]">{section.title}</div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = loc.pathname === item.to || (item.to !== '/' && loc.pathname.startsWith(item.to));
                const link = (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      'group flex items-center gap-2.5 rounded-lg px-2 py-[7px] text-[13px] font-medium transition-colors',
                      collapsed && 'justify-center px-0',
                      active
                        ? 'bg-[var(--sb-active-bg)] text-[var(--sb-fg-strong)] shadow-[inset_2px_0_0_0] shadow-brand-400'
                        : 'text-[var(--sb-fg)] hover:bg-[var(--sb-hover-bg)] hover:text-[var(--sb-fg-strong)]',
                    )}
                  >
                    <item.icon size={17} className={cn('shrink-0', active ? 'text-brand-400' : 'text-[var(--sb-fg-muted)] group-hover:text-[var(--sb-fg-strong)]')} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge !== undefined && <Badge value={item.badge} tone={item.badgeTone} />}
                    {collapsed && item.badge !== undefined && (
                      <span className={cn('absolute right-1.5 top-1 h-1.5 w-1.5 rounded-full', item.badgeTone === 'danger' ? 'bg-danger-500' : item.badgeTone === 'warn' ? 'bg-warn-500' : 'bg-brand-400')} />
                    )}
                  </NavLink>
                );
                return collapsed ? (
                  <CollapsedLabel key={item.to} label={item.label}>
                    {link}
                  </CollapsedLabel>
                ) : (
                  <div key={item.to} className="relative">{link}</div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--sb-border)] p-2.5">
        <button
          onClick={onToggle}
          className={cn(
            'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--sb-fg-muted)] transition-colors hover:bg-[var(--sb-hover-bg)] hover:text-[var(--sb-fg-strong)]',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? <ChevronLeft size={15} className="rotate-180" /> : <><PanelLeftClose size={15} /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}
