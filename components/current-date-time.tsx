'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarClock } from 'lucide-react';

function formatDateTime(date: Date) {
  return {
    date: new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date),
    time: new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date),
  };
}

export function CurrentDateTime({ compact = false }: { compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = useMemo(() => (now ? formatDateTime(now) : null), [now]);

  return (
    <div className={compact ? 'space-y-1' : 'flex items-center gap-3'}>
      {!compact ? (
        <div className="h-10 w-10 shrink-0 rounded-xl bg-[var(--secondary)]/10 text-[var(--secondary)] flex items-center justify-center">
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
        </div>
      ) : null}
      <div>
        <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[var(--on-surface-variant)]">
          {formatted?.date || 'Loading date'}
        </p>
        <p className={compact ? 'text-lg font-black text-[var(--foreground)]' : 'text-2xl font-black text-[var(--foreground)]'}>
          {formatted?.time || '--:--'}
        </p>
      </div>
    </div>
  );
}
