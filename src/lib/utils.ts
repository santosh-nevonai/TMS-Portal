import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function fmt(n: number): string {
  return n.toLocaleString('en-IN');
}

export function pct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function timeAgo(mins: number): string {
  if (mins < 1) return 'just now';
  if (mins < 60) return `${Math.round(mins)} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ${Math.round(mins % 60)}m ago`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h ago`;
}

export function shortAgo(mins: number): string {
  if (mins < 1) return 'now';
  if (mins < 60) return `${Math.round(mins)}m`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function slaLabel(mins: number): { text: string; breached: boolean } {
  if (mins < 0) {
    const m = Math.abs(mins);
    const h = Math.floor(m / 60);
    return { text: `Breached ${h}h ${m % 60}m ago`, breached: true };
  }
  const h = Math.floor(mins / 60);
  return { text: `${String(h).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')} left`, breached: false };
}

export function durationSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
