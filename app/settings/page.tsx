'use client';

import React, { useState } from 'react';
import { Sidebar, MobileNav } from '@/components/navigation';
import { useTimer } from '@/lib/timer-context';
import { Timer as TimerIcon, User, Moon, Sun, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionModal } from '@/components/action-modal';

export default function SettingsPage() {
  const [showSavedModal, setShowSavedModal] = useState(false);
  const { settings, updateSettings, isMounted } = useTimer();

  const handleSliderChange = (key: keyof typeof settings, value: number) => {
    updateSettings({ [key]: value });
  };

  const handleToggle = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
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
        <header className="mb-10">
          <h1 className="type-title">Settings</h1>
          <p className="type-subtitle">Configure your focus timer</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl">
          <section className="dashboard-card lg:col-span-12 flex flex-col space-y-10 relative overflow-hidden md:p-8">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <TimerIcon className="w-40 h-40 text-[var(--foreground)]" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase mb-4 block">Durations</span>
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-8">Interval Controls</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                <div className="group">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase">Focus Session</label>
                    <span className="text-xl font-mono text-[var(--accent)] font-black">{settings.focusDuration}:00</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="90"
                    value={settings.focusDuration}
                    onChange={(e) => handleSliderChange('focusDuration', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[var(--surface-container)] rounded-full appearance-none cursor-pointer accent-[var(--primary)] hover:accent-[var(--accent)] transition-all"
                  />
                </div>
                <div className="group">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase">Short Break</label>
                    <span className="text-xl font-mono text-[var(--secondary)] font-black">{settings.shortBreakDuration.toString().padStart(2, '0')}:00</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={settings.shortBreakDuration}
                    onChange={(e) => handleSliderChange('shortBreakDuration', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[var(--surface-container)] rounded-full appearance-none cursor-pointer accent-[var(--secondary)] transition-all"
                  />
                </div>
                <div className="group">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase">Long Break</label>
                    <span className="text-xl font-mono text-[var(--foreground)] font-black">{settings.longBreakDuration}:00</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={settings.longBreakDuration}
                    onChange={(e) => handleSliderChange('longBreakDuration', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-[var(--surface-container)] rounded-full appearance-none cursor-pointer accent-[var(--border)] hover:accent-[var(--accent)] transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-card lg:col-span-6 md:p-8">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--secondary)] uppercase mb-6 block">Behavior</span>
            <div className="space-y-6">
              {[
                { key: 'autoStartSessions', label: 'Auto-start Sessions' },
                { key: 'autoStartBreaks', label: 'Auto-start Breaks' },
                { key: 'notificationSounds', label: 'Notification Sounds' },
              ].map((toggle) => (
                <div key={toggle.key} className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-widest">{toggle.label}</span>
                  <button
                    type="button"
                    onClick={() => handleToggle(toggle.key as keyof typeof settings)}
                    className={cn(
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      settings[toggle.key as keyof typeof settings]
                        ? 'bg-[var(--primary)]'
                        : 'bg-[var(--surface-container)] border border-[var(--border)]'
                    )}
                  >
                    <span
                      className={cn(
                        'inline-block h-4 w-4 transform rounded-full bg-white transition',
                        settings[toggle.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-card lg:col-span-6 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-container)] md:p-8 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase mb-4 block">Account Status</span>
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/20 flex items-center justify-center shadow-2xl">
                  <User className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-[var(--foreground)]">Guest User</h4>
                  <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Efficiency: 92%</p>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-3 bg-[var(--primary)] text-white text-[10px] font-bold tracking-[0.3em] uppercase rounded-xl transition-all shadow-lg hover:shadow-[var(--primary)]/20"
              >
                Sync Credentials
              </button>
            </div>
          </section>

          <section className="dashboard-card lg:col-span-12 flex items-center justify-between mt-4">
            <div>
              <h4 className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-widest">Notification Sound</h4>
              <p className="text-[8px] text-[var(--on-surface-variant)] uppercase tracking-widest mt-1">Test your notification sound.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                audio.play().catch((e) => console.error('Audio play failed:', e));
              }}
              className="px-6 py-2 bg-[var(--surface-container)] border border-[var(--border)] text-[var(--foreground)] text-[8px] font-black uppercase tracking-[0.2em] rounded-lg hover:border-[var(--accent)] transition-all"
            >
              Play Test Sound
            </button>
          </section>

          <section className="dashboard-card lg:col-span-12 mt-8 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-md">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--primary)] uppercase mb-2 block">Aesthetics</span>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Visual Atmosphere</h2>
                <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest leading-relaxed">
                  Select the interface mood that best complements your current environment.
                </p>
              </div>
              <div className="flex gap-4">
                {[
                  { id: 'midnight', label: 'Midnight', icon: <Moon className="w-5 h-5" />, color: '#0b1326' },
                  { id: 'sol', label: 'Sol', icon: <Sun className="w-5 h-5" />, color: '#f8fafc' },
                  { id: 'serene', label: 'Serene', icon: <Leaf className="w-5 h-5" />, color: '#00382d' },
                ].map((themeS) => (
                  <button
                    key={themeS.id}
                    type="button"
                    onClick={() => updateSettings({ theme: themeS.id as typeof settings.theme })}
                    className={cn(
                      'flex flex-col items-center gap-3 p-4 bg-[var(--surface-container)] border-2 rounded-2xl transition-all group',
                      settings.theme === themeS.id
                        ? 'border-[var(--primary)] shadow-lg shadow-[var(--primary)]/10'
                        : 'border-transparent hover:border-[var(--border)]'
                    )}
                  >
                    <div
                      className="w-16 h-12 rounded-lg shadow-inner flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: themeS.color }}
                    >
                      <div className={cn('w-8 h-1 rounded-full', themeS.id === 'sol' ? 'bg-slate-400' : 'bg-white/20')} />
                    </div>
                    <div className="flex items-center space-x-2">
                      {themeS.icon}
                      <span className={cn('text-[8px] font-black tracking-widest uppercase', settings.theme === themeS.id ? 'text-[var(--foreground)]' : 'text-[var(--on-surface-variant)]')}>
                        {themeS.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <footer className="mt-16 flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-[var(--border)] max-w-6xl">
          <div className="flex items-center space-x-6 text-[8px] font-black text-[var(--on-surface-variant)] uppercase tracking-[0.3em]">
            <button type="button" className="hover:text-[var(--foreground)] transition-colors">Privacy Policy</button>
            <button type="button" className="hover:text-[var(--foreground)] transition-colors">Terms of Use</button>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="px-8 py-3 bg-[var(--surface-container)] text-[var(--foreground)] font-bold rounded-xl uppercase tracking-widest text-[10px] hover:bg-[var(--border)] transition-all border border-[var(--border)]"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setShowSavedModal(true)}
              className="px-12 py-3 bg-[var(--primary)] text-white font-bold rounded-xl uppercase tracking-widest text-[10px] shadow-xl shadow-[var(--primary)]/20 active:scale-95 transition-all"
            >
              Save Settings
            </button>
          </div>
        </footer>

        <MobileNav />
      </main>

      <ActionModal
        open={showSavedModal}
        title="Settings Updated"
        description="Your settings were saved successfully."
        confirmText="Close"
        showCancel={false}
        onCancel={() => setShowSavedModal(false)}
        onConfirm={() => setShowSavedModal(false)}
      />
    </div>
  );
}
