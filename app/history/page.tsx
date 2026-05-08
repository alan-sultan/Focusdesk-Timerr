'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar, MobileNav } from '@/components/navigation';
import { Zap, XCircle, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTimer, type HistoryItem, type TimerMode } from '@/lib/timer-context';
import { ActionModal } from '@/components/action-modal';
import { loadHistory } from '@/lib/storage';

function getModeLabel(mode: TimerMode) {
  switch (mode) {
    case 'shortBreak':
      return 'Short Break';
    case 'longBreak':
      return 'Long Break';
    default:
      return 'Focus';
  }
}

export default function HistoryPage() {
  const [showClearModal, setShowClearModal] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { isMounted, clearSessionHistory } = useTimer();

  useEffect(() => {
    if (isMounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHistory(loadHistory());
    }
  }, [isMounted]);

  const clearHistory = () => {
    clearSessionHistory();
    setHistory([]);
    setShowClearModal(false);
  };

  if (!isMounted) {
    return (
      <div className="flex bg-[var(--background)] min-h-screen text-[var(--foreground)] font-sans">
        <Sidebar />
        <main className="page-main with-mobile-nav flex-1 lg:ml-64 flex flex-col relative" />
      </div>
    );
  }

  return (
    <div className="flex bg-[var(--background)] min-h-screen text-[var(--foreground)] font-sans">
      <Sidebar />

      <main className="page-main with-mobile-nav flex-1 lg:ml-64 flex flex-col relative">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-5 mb-16">
          <div>
            <h2 className="type-title">Session History</h2>
            <p className="type-subtitle">Review completed and interrupted sessions</p>
          </div>
          <button
            type="button"
            disabled={history.length === 0}
            onClick={() => setShowClearModal(true)}
            className="px-6 py-2 rounded-xl bg-[var(--surface-container)] text-[var(--on-surface-variant)] text-[0.7rem] font-bold uppercase tracking-widest hover:text-[var(--foreground)] transition-all border border-[var(--border)] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Clear History
          </button>
        </header>

        <section className="space-y-4">
          {history.length > 0 ? (
            history.map((item) => (
              <div key={item.id} className="dashboard-card grid grid-cols-12 items-center gap-y-4 transition-all group hover:bg-[var(--surface-container)]">
                <div className="col-span-1 flex justify-center">
                  {item.status === 'completed' ? (
                    <Zap className="w-5 h-5 text-[var(--primary)] opacity-50 group-hover:opacity-100 transition-opacity" />
                  ) : (
                    <XCircle className="w-5 h-5 text-[var(--on-surface-variant)]" />
                  )}
                </div>
                <div className="col-span-11 md:col-span-4">
                  <p className="text-[0.75rem] font-bold text-[var(--foreground)] uppercase tracking-wide truncate">{item.task}</p>
                  <p className="text-[0.65rem] text-[var(--on-surface-variant)] uppercase tracking-widest mt-1">{getModeLabel(item.mode)} Session</p>
                </div>
                <div className="hidden md:flex col-span-3 justify-center items-center space-x-2">
                  <Clock className="w-4 h-4 text-[var(--on-surface-variant)]" />
                  <span className="text-[0.75rem] font-bold text-[var(--foreground)] uppercase">{item.duration} min</span>
                </div>
                <div className="hidden md:flex col-span-2 justify-center">
                  <span
                    className={cn(
                      'text-[0.65rem] font-black border px-3 py-1 rounded-full uppercase tracking-widest',
                      item.status === 'completed'
                        ? 'text-[var(--secondary)] border-[var(--secondary)]/30'
                        : 'text-[var(--primary)] border-[var(--primary)]/30'
                    )}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="col-span-11 md:col-span-2 text-right">
                  <div className="flex flex-col md:items-end">
                    <span className="text-[0.65rem] text-[var(--on-surface-variant)] uppercase tracking-widest">
                      {format(new Date(item.timestamp), 'MMM dd, yyyy')}
                    </span>
                    <span className="text-[0.75rem] text-[var(--on-surface-variant)] uppercase tracking-widest font-bold">
                      {format(new Date(item.timestamp), 'hh:mm aa')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="dashboard-card py-20 text-center space-y-6 border-dashed">
              <Calendar className="w-12 h-12 text-[var(--surface-container)] mx-auto" />
              <div>
                <p className="text-[var(--on-surface-variant)] font-bold uppercase tracking-[0.3em] text-[10px]">No sessions recorded yet</p>
                <Link href="/focus" className="text-[var(--primary)] text-[8px] font-black uppercase tracking-[0.4em] mt-2 inline-block">
                  Start a Focus Session
                </Link>
              </div>
            </div>
          )}
        </section>

        <MobileNav />
      </main>

      <ActionModal
        open={showClearModal}
        title="Clear Session Archive"
        description="This will permanently remove all recorded session history from this browser."
        confirmText="Clear History"
        cancelText="Cancel"
        variant="destructive"
        onCancel={() => setShowClearModal(false)}
        onConfirm={clearHistory}
      />
    </div>
  );
}
