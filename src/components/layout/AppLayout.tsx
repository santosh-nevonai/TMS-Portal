import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full animate-slide-in">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenu={() => setMobileOpen(true)} />
        <main className={cn('flex-1 overflow-y-auto')}>
          <div className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
