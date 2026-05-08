'use client';

import React, { useEffect, useId } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface ActionModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ActionModal({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancel = true,
  variant = 'default',
  onConfirm,
  onCancel,
}: ActionModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== 'Enter') {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
        return;
      }

      event.preventDefault();
      onConfirm();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel, onConfirm]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <motion.button
            type="button"
            aria-label="Close modal"
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <h3 id={titleId} className="text-lg font-black uppercase tracking-wider text-[var(--foreground)]">
              {title}
            </h3>

            {description ? <p className="mt-3 text-sm leading-relaxed text-[var(--on-surface-variant)]">{description}</p> : null}

            <div className="mt-6 flex justify-end gap-3">
              {showCancel ? (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-lg border border-[var(--border)] bg-[var(--surface-container)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[var(--foreground)] transition-all hover:opacity-90"
                >
                  {cancelText}
                </button>
              ) : null}

              <button
                type="button"
                onClick={onConfirm}
                className={
                  variant === 'destructive'
                    ? 'rounded-lg bg-[#b91c1c] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90'
                    : 'rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90'
                }
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
