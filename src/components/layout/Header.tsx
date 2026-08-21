import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Sparkles, ChevronDown, PanelLeft, Circle, Sun, Moon } from 'lucide-react';
import { Kbd, IconButton, Avatar } from '@/components/ui/primitives';
import { CURRENT_USER } from '@/data/mock';
import { getSession, logout } from '@/lib/auth';
import { CommandPalette } from './CommandPalette';
import { NotificationDrawer } from './NotificationDrawer';
import { ThemeControls } from '@/components/theme/ThemeControls';
import { useTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export function Header({ onMenu }: { onMenu: () => void }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const navigate = useNavigate();
  const userRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const { resolved } = useTheme();
  const user = getSession() ?? CURRENT_USER;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="z-20 flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface/95 px-3.5 backdrop-blur">
      <IconButton label="Toggle menu" onClick={onMenu} className="lg:hidden">
        <PanelLeft size={18} />
      </IconButton>

      {/* Search */}
      <button
        onClick={() => setPaletteOpen(true)}
        className="group flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line-strong bg-neutralst-50/60 px-3 text-left text-[13px] text-ink-400 transition-colors hover:border-ink-300 hover:bg-white sm:max-w-md"
      >
        <Search size={15} className="shrink-0" />
        <span className="truncate">Search devices, merchants, tickets…</span>
        <span className="ml-auto hidden shrink-0 items-center gap-0.5 sm:flex">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Environment */}
        <div className="hidden items-center gap-1.5 rounded-lg border border-line bg-neutralst-50 px-2.5 py-1.5 md:flex">
          <Circle size={7} className="fill-ok-500 text-ok-500" />
          <span className="text-xs font-semibold text-ink-700">Production</span>
          <ChevronDown size={13} className="text-ink-400" />
        </div>

        {/* NevonAI Assistant */}
        <button
          onClick={() => navigate('/assistant')}
          className="group inline-flex h-8 items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2 text-brand-700 transition-colors hover:border-brand-300 hover:bg-brand-100 sm:px-2.5"
          aria-label="Open NevonAI Assistant"
          title="NevonAI Assistant"
        >
          <Sparkles size={15} className="text-brand-500 transition-transform group-hover:scale-110" />
          <span className="hidden text-xs font-semibold sm:inline">Ask NevonAI</span>
        </button>

        {/* Theme */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setThemeOpen((o) => !o)}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-neutralst-50 hover:text-ink-700',
              themeOpen && 'bg-neutralst-100 text-ink-900',
            )}
            aria-label="Theme settings"
            title="Theme settings"
          >
            {resolved === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {themeOpen && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-72 animate-fade-in rounded-xl border border-line bg-surface p-3.5 shadow-pop">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-ink-900">Theme</span>
                <button onClick={() => { setThemeOpen(false); navigate('/settings'); }} className="text-2xs font-medium text-brand-600 hover:underline">
                  More options
                </button>
              </div>
              <ThemeControls />
            </div>
          )}
        </div>

        {/* Notifications */}
        <button
          onClick={() => setNotifOpen(true)}
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-neutralst-50 hover:text-ink-700"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-1 top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger-400 opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-danger-500 ring-2 ring-surface" />
          </span>
        </button>

        <div className="mx-1 h-6 w-px bg-line" />

        {/* User */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen((o) => !o)}
            className={cn('flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-neutralst-50', userOpen && 'bg-neutralst-50')}
          >
            <Avatar initials={user.initials} size="md" />
            <div className="hidden text-left leading-tight sm:block">
              <div className="text-xs font-semibold text-ink-900">{user.name}</div>
              <div className="text-2xs text-ink-500">{user.role}</div>
            </div>
            <ChevronDown size={14} className="hidden text-ink-400 sm:block" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-56 animate-fade-in rounded-xl border border-line bg-white p-1.5 shadow-pop">
              <div className="border-b border-line px-2.5 py-2">
                <div className="text-[13px] font-semibold text-ink-900">{user.name}</div>
                <div className="text-2xs text-ink-500">{user.email}</div>
              </div>
              <div className="py-1">
                {['Profile', 'Preferences', 'Security'].map((i) => (
                  <button key={i} className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-[13px] text-ink-700 hover:bg-neutralst-50">
                    {i}
                  </button>
                ))}
              </div>
              <div className="border-t border-line pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-danger-600 hover:bg-danger-50"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} onNavigate={(to) => navigate(to)} />
      <NotificationDrawer open={notifOpen} onClose={() => setNotifOpen(false)} />
    </header>
  );
}
