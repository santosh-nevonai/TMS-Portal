import React, { useEffect, useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './primitives';

// ---------------------------------------------------------------- Modal
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      <div className={cn('relative z-10 mt-8 w-full rounded-xl bg-surface shadow-pop animate-fade-in', sizes[size])}>
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              {title && <h2 className="text-sm font-semibold text-ink-900">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-[13px] text-ink-500">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-neutralst-50 hover:text-ink-700">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line bg-canvas/60 px-5 py-3 rounded-b-xl">{footer}</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Confirm dialog
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  danger,
  requireText,
  details,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  requireText?: string; // e.g. "BLOCK"
  details?: { label: string; value: string }[];
}) {
  const [typed, setTyped] = useState('');
  useEffect(() => {
    if (open) setTyped('');
  }, [open]);
  const canConfirm = !requireText || typed === requireText;
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            disabled={!canConfirm}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {danger && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-danger-50 text-danger-500">
            <AlertTriangle size={18} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
          <p className="mt-1 text-[13px] text-ink-600">{description}</p>
          {details && (
            <div className="mt-3 space-y-1 rounded-lg border border-line bg-canvas px-3 py-2">
              {details.map((d) => (
                <div key={d.label} className="flex justify-between text-xs">
                  <span className="text-ink-500">{d.label}</span>
                  <span className="font-medium text-ink-900">{d.value}</span>
                </div>
              ))}
            </div>
          )}
          {requireText && (
            <div className="mt-3">
              <label className="text-xs text-ink-500">
                Type <span className="font-semibold text-ink-900">{requireText}</span> to confirm
              </label>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoFocus
                className="mt-1 w-full rounded-lg border border-line-strong px-2.5 py-1.5 text-sm outline-none focus-visible:focus-ring"
                placeholder={requireText}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------- Drawer
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 'w-[420px]',
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  width?: string;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-[1px] animate-fade-in" onClick={onClose} />
      <div className={cn('absolute right-0 top-0 flex h-full flex-col bg-surface shadow-pop animate-slide-in', width, 'max-w-[92vw]')}>
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-semibold text-ink-900 truncate">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-400 hover:bg-neutralst-50 hover:text-ink-700">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-line px-4 py-3">{footer}</div>}
      </div>
    </div>
  );
}
