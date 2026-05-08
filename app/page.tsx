'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Timer as TimerIcon,
  FileText,
  Target,
  Volume2,
  VolumeX,
  Music2,
  Mic,
  Activity,
} from 'lucide-react';
import { useTimer } from '@/lib/timer-context';
import { Sidebar, MobileNav } from '@/components/navigation';
import { ActionModal } from '@/components/action-modal';
import { CurrentDateTime } from '@/components/current-date-time';
import { cn } from '@/lib/utils';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const MODES = [
  { id: 'focus', label: 'Focus' },
  { id: 'shortBreak', label: 'Short Break' },
  { id: 'longBreak', label: 'Long Break' },
] as const;

function getModeLabel(mode: typeof MODES[number]['id']) {
  return MODES.find((item) => item.id === mode)?.label || 'Focus';
}

function getTimerStatusLabel(status: 'idle' | 'running' | 'paused') {
  switch (status) {
    case 'running':
      return 'Running';
    case 'paused':
      return 'Paused';
    default:
      return 'Idle';
  }
}

export default function TimerPage() {
  const [showResetModal, setShowResetModal] = useState(false);
  const {
    mode,
    timeLeft,
    isActive,
    progress,
    sessionsCompleted,
    currentTask,
    settings,
    timerStatus,
    ambientState,
    voiceStatus,
    isMounted,
    setMode,
    setIsActive,
    resetTimer,
    skipSession,
    setCurrentTask,
  } = useTimer();

  return (
    <div className="flex bg-[var(--background)] min-h-screen text-[var(--foreground)] font-sans selection:bg-[var(--primary)] selection:text-white">
      <Sidebar />

      <main className="page-main with-mobile-nav flex-1 lg:ml-64 grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-[repeat(3,minmax(0,1fr))] gap-5 md:gap-6 min-h-screen relative">
        <div className="dashboard-card lg:col-span-2 lg:row-span-2 flex flex-col items-center justify-center relative overflow-hidden md:p-8">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <TimerIcon className="w-64 h-64 text-[var(--foreground)]" />
          </div>

          <div className="flex space-x-4 mb-8 z-10">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                aria-pressed={mode === m.id}
                className={cn(
                  'px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all',
                  mode === m.id
                    ? 'bg-[var(--surface-container)] text-[var(--accent)] border border-[var(--primary)]'
                    : 'text-[var(--on-surface-variant)] hover:bg-[var(--border)] hover:text-[var(--foreground)]'
                )}
              >
                {m.label}
              </button>
            ))}

            <Link
              href="/focus"
              className="h-8 w-8 rounded-full transition-all bg-[var(--surface-container)] text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] flex items-center justify-center"
              title="Open Focus view"
              aria-label="Open Focus view"
            >
              <Target className="w-4 h-4" />
            </Link>
          </div>

          <div className="relative flex items-center justify-center z-10 w-full max-w-[320px]">
            <svg className="w-64 h-64 -rotate-90 transform" aria-label="Timer progress">
              <circle cx="128" cy="128" r="120" fill="none" stroke="var(--surface-container)" strokeWidth="8" />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 753.6 }}
                animate={{ strokeDashoffset: 753.6 * (1 - progress) }}
                transition={{ duration: isActive ? 1 : 0.4, ease: isActive ? 'linear' : 'easeInOut' }}
                style={{ strokeDasharray: 753.6 }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <motion.span
                key={timeLeft}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                className="text-7xl font-black text-[var(--foreground)] tracking-normal"
              >
                {isMounted ? formatTime(timeLeft) : '--:--'}
              </motion.span>
              <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--on-surface-variant)] mt-2 font-bold">
                {isMounted ? (mode === 'focus' ? 'Remaining' : 'Resting') : 'Status'}
              </span>
            </div>
          </div>

          <div className="mt-10 flex space-x-6 z-10">
            <button
              type="button"
              aria-label="Reset timer"
              onClick={() => setShowResetModal(true)}
              className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--foreground)] transition-all hover:bg-[var(--border)]"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              type="button"
              aria-label={isActive ? 'Pause timer' : 'Start timer'}
              onClick={() => setIsActive(!isActive)}
              className="h-12 px-10 rounded-full bg-[var(--primary)] text-white flex items-center space-x-3 shadow-[0_10px_20px_rgba(225,29,72,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              <span className="text-sm font-black uppercase tracking-widest">{isActive ? 'Pause' : 'Start'}</span>
            </button>

            <button
              type="button"
              aria-label="Skip to the next timer mode"
              onClick={skipSession}
              className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--on-surface-variant)] hover:text-[var(--foreground)] transition-all hover:bg-[var(--border)]"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="dashboard-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[var(--secondary)] uppercase tracking-widest">Today</span>
            <div className="bg-[var(--secondary)]/10 p-2 rounded-lg">
              <Activity className="w-4 h-4 text-[var(--secondary)]" />
            </div>
          </div>
          <div className="mt-8">
            <CurrentDateTime />
          </div>
          <div className="mt-6">
            <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Focus sessions completed</p>
            <p className="text-sm font-bold text-[var(--foreground)] mt-1">{isMounted ? sessionsCompleted : 0} today</p>
          </div>
        </div>

        <div className="dashboard-card flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">System Status</span>
            <div className="bg-[var(--accent)]/10 p-2 rounded-lg">
              {settings.timerSoundsEnabled ? (
                <Volume2 className="w-4 h-4 text-[var(--accent)]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[var(--accent)]" />
              )}
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <div>
              <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Timer</p>
              <p className="text-lg font-black text-[var(--foreground)]">{getModeLabel(mode)} - {getTimerStatusLabel(timerStatus)}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 text-[0.72rem] font-bold text-[var(--foreground)]">
              <div className="flex items-center gap-2">
                {settings.timerSoundsEnabled ? <Volume2 className="h-4 w-4 text-[var(--secondary)]" /> : <VolumeX className="h-4 w-4 text-[var(--on-surface-variant)]" />}
                <span>{settings.timerSoundsEnabled ? 'Timer sounds on' : 'Timer sounds off'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Music2 className={cn('h-4 w-4', ambientState === 'playing' ? 'text-[var(--secondary)]' : 'text-[var(--on-surface-variant)]')} />
                <span>Ambient {ambientState === 'playing' ? 'playing' : settings.ambientEnabled ? 'ready' : 'off'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mic className={cn('h-4 w-4', voiceStatus === 'listening' ? 'text-[var(--secondary)]' : 'text-[var(--on-surface-variant)]')} />
                <span>Voice {voiceStatus === 'listening' ? 'listening' : settings.voiceCommandsEnabled ? voiceStatus : 'off'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-card lg:col-span-3 flex flex-col md:flex-row items-center">
          <div className="flex-1 flex flex-col w-full">
            <span className="type-card-title mb-2">Current Task</span>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
                <FileText className="w-5 h-5" />
              </div>
              <input
                id="current-task"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                aria-label="Current task"
                className="bg-transparent border-none focus:ring-0 text-xl font-bold text-[var(--foreground)] w-full placeholder:text-[var(--on-surface-variant)] outline-none rounded-md"
                placeholder="What are you working on?"
              />
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-[var(--border)] mx-8" />
          <div className="flex space-x-10 mt-4 md:mt-0 w-full md:w-auto justify-around">
            <div className="text-center">
              <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Sessions</p>
              <p className="text-sm font-bold text-[var(--foreground)] mt-1 uppercase">
                {isMounted ? sessionsCompleted : '0'} Done
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[var(--on-surface-variant)] uppercase tracking-widest">Goal Status</p>
              <p className="text-sm font-bold text-[var(--accent)] mt-1">
                {isMounted && sessionsCompleted >= 8 ? 'Complete' : 'In Progress'}
              </p>
            </div>
          </div>
        </div>

        <MobileNav />
      </main>

      <ActionModal
        open={showResetModal}
        title="Reset Timer"
        description="This will stop the current countdown and restore the selected mode duration."
        confirmText="Reset"
        cancelText="Keep Running"
        onCancel={() => setShowResetModal(false)}
        onConfirm={() => {
          resetTimer();
          setShowResetModal(false);
        }}
      />
    </div>
  );
}
