import { Monitor, Sun, Moon, Check, PanelLeft } from 'lucide-react';
import { ACCENTS, useTheme, type ThemeMode, type SidebarTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
];

const SIDEBAR_MODES: { value: SidebarTheme; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'auto', label: 'Auto' },
];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink-800">{label}</span>
        {hint && <span className="text-2xs text-ink-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

/** Segmented row of buttons that stretch to fill the row. */
function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: typeof Sun }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-lg border border-line bg-neutralst-50 p-1">
      {options.map((o) => {
        const Icon = o.icon;
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors',
              selected ? 'bg-surface text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {Icon && <Icon size={14} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function ThemeControls() {
  const { mode, setMode, accent, setAccent, sidebar, setSidebar } = useTheme();

  return (
    <div className="space-y-4">
      <Field label="Appearance" hint="Interface color scheme">
        <Segmented options={MODES} value={mode} onChange={setMode} />
      </Field>

      <Field label="Accent color" hint="Brand & highlights">
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((a) => {
            const selected = accent === a.key;
            return (
              <button
                key={a.key}
                onClick={() => setAccent(a.key)}
                title={a.label}
                aria-label={a.label}
                aria-pressed={selected}
                className={cn(
                  'relative flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-surface transition-transform hover:scale-105',
                  selected ? 'ring-ink-900/70' : 'ring-transparent',
                )}
                style={{ backgroundColor: a.swatch }}
              >
                {selected && <Check size={15} className="text-white drop-shadow" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Sidebar theme" hint="Independent of app">
        <Segmented
          options={SIDEBAR_MODES.map((s) => ({ ...s, icon: PanelLeft }))}
          value={sidebar}
          onChange={setSidebar}
        />
      </Field>
    </div>
  );
}
