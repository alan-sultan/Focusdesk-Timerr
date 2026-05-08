'use client';

import React, { useState } from 'react';
import { Sidebar, MobileNav } from '@/components/navigation';
import { useTimer, type AmbientSoundType, type TimerSettings } from '@/lib/timer-context';
import { Timer as TimerIcon, Moon, Sun, Eye, Volume2, Music2, Mic, Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ActionModal } from '@/components/action-modal';
import { AMBIENT_SOUND_OPTIONS } from '@/hooks/use-audio';

type BooleanSetting = {
  [K in keyof TimerSettings]: TimerSettings[K] extends boolean ? K : never;
}[keyof TimerSettings];

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ id, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-[10px] font-bold text-[var(--foreground)] uppercase tracking-widest">
          {label}
        </label>
        <p className="mt-1 text-xs leading-relaxed text-[var(--on-surface-variant)]">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors',
          checked ? 'bg-[var(--primary)]' : 'bg-[var(--surface-container)] border border-[var(--border)]'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white transition',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [showResetModal, setShowResetModal] = useState(false);
  const {
    settings,
    updateSettings,
    restoreDefaultSettings,
    isMounted,
    ambientState,
    ambientMessage,
    lastTimerFeedback,
    voiceStatus,
    voiceMessage,
    lastVoiceTranscript,
    supportedVoiceCommands,
    playTimerSound,
    playAmbient,
    pauseAmbient,
  } = useTimer();

  const handleSliderChange = (key: keyof TimerSettings, value: number) => {
    updateSettings({ [key]: value } as Partial<TimerSettings>);
  };

  const handleToggle = (key: BooleanSetting) => {
    updateSettings({ [key]: !settings[key] } as Partial<TimerSettings>);
  };

  const timerSoundTests = [
    { id: 'start', label: 'Test Start' },
    { id: 'break', label: 'Test Break' },
    { id: 'complete', label: 'Test Complete' },
    { id: 'pause', label: 'Test Pause' },
    { id: 'tick', label: 'Test Tick' },
  ] as const;

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
          <p className="type-subtitle">Configure focus, sound, voice, and visual preferences</p>
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
                    <label htmlFor="focus-duration" className="text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase">Focus Session</label>
                    <span className="text-xl font-mono text-[var(--accent)] font-black">{settings.focusDuration}:00</span>
                  </div>
                  <input
                    id="focus-duration"
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
                    <label htmlFor="short-break-duration" className="text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase">Short Break</label>
                    <span className="text-xl font-mono text-[var(--secondary)] font-black">{settings.shortBreakDuration.toString().padStart(2, '0')}:00</span>
                  </div>
                  <input
                    id="short-break-duration"
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
                    <label htmlFor="long-break-duration" className="text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase">Long Break</label>
                    <span className="text-xl font-mono text-[var(--foreground)] font-black">{settings.longBreakDuration}:00</span>
                  </div>
                  <input
                    id="long-break-duration"
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
              <ToggleRow
                id="auto-start-sessions"
                label="Auto-start focus sessions"
                description="Start the next focus block automatically after a break completes."
                checked={settings.autoStartSessions}
                onChange={() => handleToggle('autoStartSessions')}
              />
              <ToggleRow
                id="auto-start-breaks"
                label="Auto-start breaks"
                description="Move into the next break automatically when a focus block ends."
                checked={settings.autoStartBreaks}
                onChange={() => handleToggle('autoStartBreaks')}
              />
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="long-break-interval" className="text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase">Long break every</label>
                  <span className="text-xl font-mono text-[var(--foreground)] font-black">{settings.longBreakInterval} sessions</span>
                </div>
                <input
                  id="long-break-interval"
                  type="range"
                  min="2"
                  max="8"
                  value={settings.longBreakInterval}
                  onChange={(e) => handleSliderChange('longBreakInterval', parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-[var(--surface-container)] rounded-full appearance-none cursor-pointer accent-[var(--secondary)] transition-all"
                />
              </div>
            </div>
          </section>

          <section className="dashboard-card lg:col-span-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase mb-2 block">Timer Sounds</span>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Soft Feedback</h2>
              </div>
              <Volume2 className="h-6 w-6 text-[var(--accent)]" aria-hidden="true" />
            </div>
            <div className="space-y-6">
              <ToggleRow
                id="timer-sounds-enabled"
                label="Enable timer sounds"
                description="Play short start, break, pause, and completion cues only when enabled."
                checked={settings.timerSoundsEnabled}
                onChange={() => handleToggle('timerSoundsEnabled')}
              />
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="timer-sound-volume" className="text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase">Timer volume</label>
                  <span className="text-xl font-mono text-[var(--foreground)] font-black">{settings.timerSoundVolume}%</span>
                </div>
                <input
                  id="timer-sound-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={settings.timerSoundVolume}
                  onChange={(e) => handleSliderChange('timerSoundVolume', parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-[var(--surface-container)] rounded-full appearance-none cursor-pointer accent-[var(--primary)] transition-all"
                />
              </div>
              <ToggleRow
                id="countdown-sounds-enabled"
                label="Soft countdown tick"
                description="Play a quiet tick during the final 10 seconds when timer sounds are enabled."
                checked={settings.countdownSoundEnabled}
                onChange={() => handleToggle('countdownSoundEnabled')}
              />
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-container)] p-4">
                <p className="text-xs leading-relaxed text-[var(--on-surface-variant)]">{lastTimerFeedback}</p>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timerSoundTests.map((sound) => (
                    <button
                      key={sound.id}
                      type="button"
                      onClick={() => playTimerSound(sound.id, { force: true })}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-all hover:opacity-90"
                    >
                      <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      {sound.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="dashboard-card lg:col-span-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--primary)] uppercase mb-2 block">Ambient Audio</span>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Deep Focus Sound</h2>
              </div>
              <Music2 className="h-6 w-6 text-[var(--primary)]" aria-hidden="true" />
            </div>
            <div className="space-y-6">
              <ToggleRow
                id="ambient-enabled"
                label="Enable ambient focus sound"
                description="Make ambient sound available. It starts only after pressing Start or Play Ambient Sound."
                checked={settings.ambientEnabled}
                onChange={() => handleToggle('ambientEnabled')}
              />
              <div>
                <label htmlFor="ambient-sound" className="text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase">Ambient sound</label>
                <select
                  id="ambient-sound"
                  value={settings.ambientSound}
                  onChange={(event) => updateSettings({ ambientSound: event.target.value as AmbientSoundType })}
                  className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-container)] px-4 py-3 text-sm font-bold text-[var(--foreground)]"
                >
                  {AMBIENT_SOUND_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs leading-relaxed text-[var(--on-surface-variant)]">
                  {AMBIENT_SOUND_OPTIONS.find((option) => option.id === settings.ambientSound)?.description}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="ambient-volume" className="text-[10px] font-bold tracking-widest text-[var(--on-surface-variant)] uppercase">Ambient volume</label>
                  <span className="text-xl font-mono text-[var(--foreground)] font-black">{settings.ambientVolume}%</span>
                </div>
                <input
                  id="ambient-volume"
                  type="range"
                  min="0"
                  max="100"
                  value={settings.ambientVolume}
                  onChange={(e) => handleSliderChange('ambientVolume', parseInt(e.target.value, 10))}
                  className="w-full h-1.5 bg-[var(--surface-container)] rounded-full appearance-none cursor-pointer accent-[var(--secondary)] transition-all"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-container)] p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]">Status: {ambientState}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--on-surface-variant)]">{ambientMessage}</p>
                </div>
                <button
                  type="button"
                  disabled={!settings.ambientEnabled}
                  aria-label={ambientState === 'playing' ? 'Pause ambient sound' : 'Play ambient sound'}
                  onClick={() => {
                    if (ambientState === 'playing') {
                      pauseAmbient();
                    } else {
                      void playAmbient();
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {ambientState === 'playing' ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
                  {ambientState === 'playing' ? 'Pause Ambient' : 'Play Ambient'}
                </button>
              </div>
            </div>
          </section>

          <section className="dashboard-card lg:col-span-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--secondary)] uppercase mb-2 block">Voice</span>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Voice Commands</h2>
              </div>
              <Mic className="h-6 w-6 text-[var(--secondary)]" aria-hidden="true" />
            </div>
            <div className="space-y-6">
              <ToggleRow
                id="voice-commands-enabled"
                label="Enable voice commands"
                description="Use the browser Web Speech API for simple commands when supported."
                checked={settings.voiceCommandsEnabled}
                onChange={() => handleToggle('voiceCommandsEnabled')}
              />
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-container)] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--foreground)]">Status: {voiceStatus}</p>
                <p className="mt-2 text-xs leading-relaxed text-[var(--on-surface-variant)]">{voiceMessage}</p>
                {lastVoiceTranscript ? (
                  <p className="mt-3 text-xs font-bold text-[var(--foreground)]">Last heard: {lastVoiceTranscript}</p>
                ) : null}
              </div>
              <p className="text-xs leading-relaxed text-[var(--on-surface-variant)]">
                Supported commands: {supportedVoiceCommands.join(', ')}.
              </p>
            </div>
          </section>

          <section className="dashboard-card lg:col-span-12 mt-8 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-md">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--primary)] uppercase mb-2 block">Aesthetics</span>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Visual Atmosphere</h2>
                <p className="text-xs text-[var(--on-surface-variant)] leading-relaxed">
                  Select the interface mood that best complements your current environment.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'midnight', label: 'Midnight', icon: <Moon className="w-5 h-5" />, color: '#0b1326' },
                  { id: 'sol', label: 'Sol', icon: <Sun className="w-5 h-5" />, color: '#f8fafc' },
                  { id: 'colorBlind', label: 'Color Blind Friendly', icon: <Eye className="w-5 h-5" />, color: '#070b16' },
                ].map((themeS) => (
                  <button
                    key={themeS.id}
                    type="button"
                    aria-pressed={settings.theme === themeS.id}
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
                      <div className={cn('w-8 h-1 rounded-full', themeS.id === 'sol' ? 'bg-slate-400' : themeS.id === 'colorBlind' ? 'bg-[#fbbf24]' : 'bg-white/20')} />
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

        <footer className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-[var(--border)] max-w-6xl">
          <p className="text-xs text-[var(--on-surface-variant)]">Changes are saved automatically in this browser.</p>
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--surface-container)] text-[var(--foreground)] font-bold rounded-xl uppercase tracking-widest text-[10px] hover:bg-[var(--border)] transition-all border border-[var(--border)]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Restore Defaults
          </button>
        </footer>

        <MobileNav />
      </main>

      <ActionModal
        open={showResetModal}
        title="Restore Default Settings"
        description="This will reset timer durations, sound preferences, ambient sound, voice commands, and theme settings for this browser."
        confirmText="Restore"
        cancelText="Cancel"
        variant="destructive"
        onCancel={() => setShowResetModal(false)}
        onConfirm={() => {
          restoreDefaultSettings();
          setShowResetModal(false);
        }}
      />
    </div>
  );
}
