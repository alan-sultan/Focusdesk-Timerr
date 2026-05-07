'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Timer, BarChart2, History, Settings, User, Bell, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimer } from '@/lib/timer-context';

const NAV_ITEMS = [
  { label: 'Timer', icon: Timer, href: '/' },
  { label: 'Focus', icon: Target, href: '/focus' },
  { label: 'Statistics', icon: BarChart2, href: '/statistics' },
  { label: 'History', icon: History, href: '/history' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isActive, setIsActive } = useTimer();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden lg:flex flex-col p-6 bg-[var(--surface)] border-r border-[var(--border)] z-40">
      <div className="mb-10">
        <h1 className="text-xl font-black tracking-widest text-[var(--primary)] uppercase">FOCUSDESK</h1>
        <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest mt-1">Focus Timer</p>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActivePath = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all',
                isActivePath
                  ? 'bg-[var(--surface-container)] text-[var(--accent)] border-r-4 border-[var(--primary)]'
                  : 'text-[var(--on-surface-variant)] hover:bg-[var(--border)] hover:text-[var(--foreground)]'
              )}
            >
              <item.icon className={cn('w-4 h-4', isActivePath && 'fill-current')} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="bg-[var(--surface-container)] p-4 rounded-xl border border-[var(--border)]">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
              <User className="w-4 h-4 text-[var(--background)]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[var(--foreground)] uppercase">A. Chen</p>
              <p className="type-label text-[var(--on-surface-variant)] tracking-[0.12em]">Deep Work Pro</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="w-full py-2 bg-[var(--primary)] text-white text-[10px] font-bold rounded-md uppercase tracking-widest hover:opacity-90 transition-colors"
          >
            {isActive ? 'Pause Focus' : 'Start Focus'}
          </button>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  
  return (
    <nav className="mobile-nav-shell lg:hidden fixed bg-[var(--surface)] flex items-center justify-around z-50 border border-[var(--border)] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
      {NAV_ITEMS.map((item) => {
        const isActivePath = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'mobile-nav-link flex flex-col items-center justify-center transition-all touch-target',
              isActivePath ? 'text-[var(--primary)] bg-[var(--surface-container)]' : 'text-[var(--on-surface-variant)]'
            )}
          >
            <item.icon className={cn('w-4 h-4 sm:w-5 sm:h-5', isActivePath && 'fill-current')} />
            <span className="type-label tracking-[0.1em] leading-none">
              {item.label === 'Statistics' ? 'Stats' : item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function TopNav() {
  const pathname = usePathname();
  
  return (
    <nav className="flex justify-between items-center w-full px-8 h-16 sticky top-0 z-50 bg-[var(--background)] font-sans tracking-tight border-b border-[var(--border)]/5">
      <div className="text-xl font-black tracking-[0.2em] text-[var(--primary)] uppercase">FOCUSDESK</div>
      
      <div className="hidden md:flex items-center space-x-10">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-[10px] font-bold uppercase tracking-widest transition-all',
              pathname === item.href
                ? 'text-[var(--accent)] border-b-2 border-[var(--primary)] pb-1'
                : 'text-[var(--on-surface-variant)] hover:text-[var(--foreground)]'
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center space-x-4">
        <button type="button" className="p-2 rounded-full hover:bg-[var(--surface-container)] transition-all duration-300">
          <div className="relative">
            <Bell className="w-5 h-5 text-[var(--primary)]" />
            <div className="absolute top-1 right-1 w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse" />
          </div>
        </button>
        <button type="button" className="p-2 rounded-full hover:bg-[var(--surface-container)] transition-all duration-300">
          <User className="w-6 h-6 text-[var(--primary)]" />
        </button>
      </div>
    </nav>
  );
}
