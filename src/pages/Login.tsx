import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowRight, AlertCircle, Eye, EyeOff, Volume2, ShieldCheck,
  Activity, BatteryFull, SignalHigh, Nfc, LayoutGrid,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/primitives';
import { authenticate, isAuthenticated, DEMO_USERS } from '@/lib/auth';

/* ---------------------------------------------------------------- device art
 * A true CSS-3D Payment Audio device: an extruded 6-face box on a slow
 * turntable, floating above a glowing pedestal. Everything is drawn in markup
 * with brand-* tokens, so the accent flips with the active theme. */
const FACE = 'face-3d rounded-2xl border border-brand-400/25 bg-gradient-to-b from-navy-800 to-navy-950';
// half-dimensions of the box (W 176 · H 208 · D 72)
const W = 176, H = 208, D = 72;

function Grille({ rows = 6, cols = 8 }: { rows?: number; cols?: number }) {
  return (
    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <span key={i} className="h-1 w-1 rounded-full bg-brand-400/30" />
      ))}
    </div>
  );
}

function AudioDevice() {
  return (
    <div className="relative flex h-full items-center justify-center">
      {/* faint row of background devices */}
      <div className="pointer-events-none absolute bottom-8 flex items-end gap-2 opacity-30">
        {[7, 9, 11, 13, 11, 9, 7].map((h, i) => (
          <span key={i} className="w-8 rounded-md bg-gradient-to-b from-brand-500/30 to-transparent ring-1 ring-brand-400/20" style={{ height: `${h * 6}px` }} />
        ))}
      </div>

      {/* pedestal glow + expanding rings */}
      <div className="pointer-events-none absolute bottom-14 h-44 w-44">
        {[0, 0.9, 1.8].map((d) => (
          <span key={d} className="absolute inset-0 rounded-full border border-brand-400/40 animate-ripple" style={{ animationDelay: `${d}s` }} />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-16 h-10 w-56 rounded-[100%] bg-brand-500/30 blur-2xl" />
      <div className="pointer-events-none absolute bottom-[72px] h-4 w-44 rounded-[100%] border border-brand-400/25 bg-navy-950/40" />

      {/* 3D turntable */}
      <div className="scene-3d relative -mt-8">
        <div className="animate-float [animation-duration:7s]">
          <div className="box-3d relative" style={{ width: W, height: H }}>
            {/* FRONT — contactless screen */}
            <div className={`${FACE} screen-sheen overflow-hidden shadow-pop`}
              style={{ width: W, height: H, transform: `translate(-50%,-50%) translateZ(${D / 2}px)` }}>
              <div className="flex h-full flex-col p-3.5">
                <div className="flex items-center">
                  <img src="./logo/white-logo.png" alt="Nevon AI" className="h-4 w-auto" />
                </div>
                <div className="relative mt-2.5 flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-brand-400/40 bg-navy-950">
                  <div className="absolute inset-0 bg-brand-500/10" />
                  {[0, 0.7, 1.4].map((d) => (
                    <span key={d} className="absolute h-16 w-16 rounded-full border border-brand-400/50 animate-ripple" style={{ animationDelay: `${d}s` }} />
                  ))}
                  <Nfc size={44} className="relative text-brand-300 drop-shadow-[0_0_12px_rgba(91,132,245,0.75)]" />
                </div>
                <div className="mt-2.5 flex justify-center"><Grille rows={3} cols={9} /></div>
              </div>
            </div>

            {/* BACK */}
            <div className={`${FACE} p-4`}
              style={{ width: W, height: H, transform: `translate(-50%,-50%) rotateY(180deg) translateZ(${D / 2}px)` }}>
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <img src="./logo/logo.png" alt="Nevon AI" className="h-10 w-10 rounded-lg" />
                <Grille rows={5} cols={7} />
                <span className="rounded-full border border-brand-400/30 px-2 py-0.5 text-2xs font-medium text-brand-300">PA-100</span>
              </div>
            </div>

            {/* RIGHT side */}
            <div className={`${FACE} bg-gradient-to-b from-navy-850 to-navy-950`}
              style={{ width: D, height: H, transform: `translate(-50%,-50%) rotateY(90deg) translateZ(${W / 2}px)` }}>
              <div className="flex h-full items-center justify-center"><Grille rows={9} cols={2} /></div>
            </div>

            {/* LEFT side */}
            <div className={`${FACE} bg-gradient-to-b from-navy-850 to-navy-950`}
              style={{ width: D, height: H, transform: `translate(-50%,-50%) rotateY(-90deg) translateZ(${W / 2}px)` }}>
              <div className="flex h-full items-center justify-center"><Grille rows={9} cols={2} /></div>
            </div>

            {/* TOP — catches the light, holds a status LED */}
            <div className="face-3d rounded-2xl border border-brand-300/30 bg-gradient-to-br from-navy-700 to-navy-850"
              style={{ width: W, height: D, transform: `translate(-50%,-50%) rotateX(90deg) translateZ(${H / 2}px)` }}>
              <div className="flex h-full items-center justify-between px-4">
                <span className="text-2xs font-semibold tracking-widest text-brand-300/80">PAYMENT AUDIO</span>
                <span className="h-2 w-2 rounded-full bg-ok-500 shadow-[0_0_8px_2px_rgba(22,163,74,0.6)]" />
              </div>
            </div>

            {/* BOTTOM */}
            <div className="face-3d rounded-2xl border border-brand-400/15 bg-navy-950"
              style={{ width: W, height: D, transform: `translate(-50%,-50%) rotateX(-90deg) translateZ(${H / 2}px)` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Floating attribute chip that bobs gently on a loop. */
function FeatureChip({
  icon: Icon, title, value, className, delay = 0,
}: {
  icon: LucideIcon;
  title: string;
  value?: string;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2.5 rounded-2xl border border-navy-700 bg-navy-850/80 px-3.5 py-2.5 shadow-pop backdrop-blur animate-float-sm ${className ?? ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
        <Icon size={16} />
      </span>
      <div className="leading-tight">
        <div className="text-[13px] font-semibold text-white">{title}</div>
        {value && <div className="text-2xs font-medium tabular-nums text-brand-300">{value}</div>}
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const [email, setEmail] = useState('admin@nevonai.com');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
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
      {/* ---------------------------------------------- Left: animated device stage */}
      <div className="relative hidden w-1/2 flex-col overflow-hidden bg-navy-950 p-10 text-white lg:flex">
        {/* ambient background */}
        <div className="absolute inset-0 grid-dots opacity-[0.12]" />
        <div className="absolute -left-32 -top-40 h-[30rem] w-[30rem] rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-44 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand-700/25 blur-3xl" />

        {/* drifting particles */}
        {[
          { l: '12%', t: '30%', d: 0, s: 5 }, { l: '82%', t: '22%', d: 1.2, s: 4 },
          { l: '68%', t: '64%', d: 2.1, s: 6 }, { l: '24%', t: '72%', d: 0.6, s: 3 },
          { l: '46%', t: '18%', d: 1.8, s: 4 }, { l: '90%', t: '52%', d: 2.6, s: 5 },
        ].map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-brand-300/60 animate-float-sm"
            style={{ left: p.l, top: p.t, width: p.s, height: p.s, animationDelay: `${p.d}s`, animationDuration: '5.5s' }}
          />
        ))}

        {/* logo + headline */}
        <div className="relative">
          <img src="./logo/white-logo.png" alt="Nevon AI" className="h-9 w-auto" />
          <h1 className="mt-8 text-4xl font-extrabold leading-[1.05]">
            Smart Payment<br />
            <span className="text-brand-400">Audio Devices</span>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-navy-300">
            <span>Seamless Transactions</span>
            <span className="text-brand-400">·</span>
            <span>Real-time Insights</span>
            <span className="text-brand-400">·</span>
            <span>Smarter Tomorrow</span>
          </div>
        </div>

        {/* device stage with floating attribute chips */}
        <div className="relative flex-1">
          <AudioDevice />

          <FeatureChip icon={Volume2} title="Audio Guided" value="Payments" className="left-0 top-6" delay={0} />
          <FeatureChip icon={LayoutGrid} title="Connected Devices" value="1,248 online" className="right-0 top-2" delay={0.6} />
          <FeatureChip icon={BatteryFull} title="Battery" value="94% healthy" className="left-2 top-1/2" delay={1.2} />
          <FeatureChip icon={SignalHigh} title="Network" value="4G · Strong" className="right-1 top-[46%]" delay={1.8} />
          <FeatureChip icon={ShieldCheck} title="Secure & Reliable" className="bottom-16 left-6" delay={0.9} />
          <FeatureChip icon={Activity} title="Real-time Monitoring" className="bottom-12 right-4" delay={1.5} />
        </div>

        <div className="relative text-2xs text-navy-500">
          · Payment Audio Device Platform ·
        </div>
      </div>

      {/* ---------------------------------------------- Right: login form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* logo — icon mark works on light & dark */}
          <div className="mb-6 flex items-center gap-2.5">
            <img src="./logo/logo.png" alt="Nevon AI" className="h-9 w-9 " />
            <div className="leading-tight">
              <div className="text-md font-bold text-ink-900">NevonAI</div>
              <div className="text-2xs text-ink-500">Payment Audio Device</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-ink-900">Welcome back</h2>
          <p className="mt-1 text-[13px] text-ink-500">Sign in to the Payment Audio operations console.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="text-[13px] font-medium text-ink-700">Work email</label>
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                type="email"
                autoComplete="username"
                className="mt-1 h-10 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink-900 outline-none focus-visible:focus-ring"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-medium text-ink-700">Password</label>
                <a href="#" className="text-2xs font-medium text-brand-600 hover:underline">Forgot password?</a>
              </div>
              <div className="relative mt-1">
                <input
                  value={pw}
                  onChange={(e) => { setPw(e.target.value); setError(''); }}
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="h-10 w-full rounded-lg border border-line-strong bg-surface px-3 pr-10 text-sm text-ink-900 outline-none focus-visible:focus-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 transition-colors hover:text-ink-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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

          {/* <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-neutralst-50 px-3 py-2.5 text-2xs text-ink-500">
            <ShieldCheck size={15} className="shrink-0 text-ok-600" />
            Demo build — credentials above are for evaluation only. All actions are audited.
          </div> */}
        </div>
      </div>
    </div>
  );
}
