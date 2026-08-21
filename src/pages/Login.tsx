import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ShieldCheck, ArrowRight, Cpu, Wifi, Radio, Activity, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { authenticate, isAuthenticated, DEMO_USERS } from '@/lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('admin@nevonai.com');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Skip the login screen.
  useEffect(() => {
    if (isAuthenticated()) navigate('/', { replace: true });
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const session = authenticate(email, pw);
    if (!session) {
      setError('Invalid email or password. Use one of the demo accounts below.');
      setSubmitting(false);
      return;
    }
    navigate(from, { replace: true });
  };

  const fillDemo = (demoEmail: string, demoPw: string) => {
    setEmail(demoEmail);
    setPw(demoPw);
    setError('');
  };

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Left brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-navy-900 p-10 text-white lg:flex">
        <div className="absolute inset-0 grid-dots opacity-[0.15]" />
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none"><path d="M16 7v18M11 11v10M21 11v10M7 14.5v3M25 14.5v3" stroke="white" strokeWidth="2.2" strokeLinecap="round" /></svg>
          </div>
          <div>
            <div className="text-sm font-bold">Nevon FleetOps</div>
            <div className="text-2xs text-navy-400">Soundbox Device Management</div>
          </div>
        </div>

        <div className="relative">
          <h1 className="max-w-md text-3xl font-bold leading-tight">The command center for your Soundbox fleet.</h1>
          <p className="mt-3 max-w-md text-[15px] text-navy-300">Monitor, control and update tens of thousands of payment soundbox devices across India — in real time.</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            {[
              { icon: Cpu, label: '24,850 devices', sub: 'under management' },
              { icon: Wifi, label: '92.3% online', sub: 'fleet health' },
              { icon: Radio, label: 'MQTT / IoT', sub: 'real-time telemetry' },
              { icon: Activity, label: '99.0% SLA', sub: 'uptime target' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-navy-700 bg-navy-850/60 p-3.5 backdrop-blur">
                <s.icon size={18} className="text-brand-300" />
                <div className="mt-2 text-sm font-semibold">{s.label}</div>
                <div className="text-2xs text-navy-400">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-2xs text-navy-500">Airtel Payments Bank · Service Provider Platform · Production</div>
      </div>

      {/* Right form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500"><Radio size={18} className="text-white" /></div>
              <span className="text-base font-bold text-ink-900">Nevon FleetOps</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-ink-900">Sign in</h2>
          <p className="mt-1 text-[13px] text-ink-500">Access the Soundbox operations console.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-[13px] font-medium text-ink-700">Work email</label>
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                type="email"
                autoComplete="username"
                className="mt-1 h-10 w-full rounded-lg border border-line-strong px-3 text-sm outline-none focus-visible:focus-ring"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-ink-700">Password</label>
                <a href="#" className="text-2xs font-medium text-brand-600 hover:underline">Forgot?</a>
              </div>
              <input
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(''); }}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="mt-1 h-10 w-full rounded-lg border border-line-strong px-3 text-sm outline-none focus-visible:focus-ring"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2 text-2xs text-danger-700">
                <AlertCircle size={14} className="mt-px shrink-0 text-danger-500" />
                <span>{error}</span>
              </div>
            )}

            <label className="flex items-center gap-2 text-[13px] text-ink-600">
              <input type="checkbox" className="h-3.5 w-3.5 rounded border-line-strong text-brand-600" /> Keep me signed in on this device
            </label>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={submitting}>
              Sign in <ArrowRight size={15} />
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-5 rounded-lg border border-line bg-neutralst-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xs font-semibold uppercase tracking-wide text-ink-500">Demo accounts</span>
              <span className="text-2xs text-ink-400">click to autofill</span>
            </div>
            <div className="space-y-1.5">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => fillDemo(u.email, u.password)}
                  className="flex w-full items-center justify-between rounded-md border border-line bg-surface px-2.5 py-1.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-ink-800">{u.email}</span>
                    <span className="block text-2xs text-ink-500">{u.role}</span>
                  </span>
                  <span className="ml-2 shrink-0 rounded bg-neutralst-100 px-1.5 py-0.5 font-mono text-2xs text-ink-600">{u.password}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-neutralst-50 px-3 py-2.5 text-2xs text-ink-500">
            <ShieldCheck size={15} className="shrink-0 text-ok-600" />
            Demo build — credentials above are for evaluation only. All actions are audited.
          </div>
        </div>
      </div>
    </div>
  );
}
