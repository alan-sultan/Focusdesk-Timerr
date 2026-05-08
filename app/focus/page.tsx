'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  X,
  Maximize,
  Minimize,
  Clock3,
  CheckCircle2,
  Target,
  Brain,
  Volume2,
  VolumeX,
  Music2,
  Mic,
} from 'lucide-react';
import Link from 'next/link';
import { useTimer } from '@/lib/timer-context';
import { ActionModal } from '@/components/action-modal';
import { CurrentDateTime } from '@/components/current-date-time';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function FocusModePage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const {
    mode,
    timeLeft,
    isActive,
    progress,
    currentTask,
    sessionsCompleted,
    settings,
    timerStatus,
    ambientState,
    voiceStatus,
    isMounted,
    setIsActive,
    resetTimer,
    skipSession,
    setCurrentTask,
  } = useTimer();

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
      return;
    }

    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-[var(--background)]" />;
  }

  return (
    <div className="relative min-h-screen w-full bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
      <div className="fixed inset-0 z-0 radial-gradient-bg opacity-70">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px), radial-gradient(var(--secondary) 1px, transparent 1px)',
            backgroundSize: '42px 42px, 70px 70px',
            backgroundPosition: '0 0, 18px 18px',
          }}
        />
      </div>

      <main className="page-main relative z-30 min-h-screen w-full flex flex-col">
        <header className="w-full flex items-center justify-between mb-6">
          <div>
            <p className="type-overline text-[var(--secondary)]">Focus Workspace</p>
            <h1 className="type-title">Distraction Free Session</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen focus view' : 'Enter fullscreen focus view'}
              className="touch-target group flex items-center justify-center rounded-xl bg-[var(--surface-container)] border border-[var(--border)] transition-all duration-300 hover:border-[var(--accent)] hover:shadow-lg hover:shadow-[var(--accent)]/10"
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-[var(--foreground)] group-hover:text-[var(--accent)]" />
              ) : (
                <Maximize className="w-5 h-5 text-[var(--foreground)] group-hover:text-[var(--accent)]" />
              )}
            </button>

            <Link
              href="/"
              className="touch-target group flex items-center space-x-2.5 px-4 rounded-xl bg-[var(--surface-container)] border border-[var(--border)] transition-all duration-300 hover:border-[var(--primary)] hover:shadow-lg hover:shadow-[var(--primary)]/10"
            >
              <span className="text-[var(--foreground)] group-hover:text-[var(--primary)] text-[0.65rem] font-black tracking-[0.18em] uppercase">
                Dashboard
              </span>
              <X className="w-4 h-4 text-[var(--on-surface-variant)] group-hover:text-[var(--primary)]" />
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5 flex-1">
          <div className="bg-[var(--surface)]/90 backdrop-blur-xl rounded-3xl border border-[var(--border)] p-6 md:p-8 flex flex-col">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <label htmlFor="focus-current-task" className="type-label tracking-[0.2em] text-[var(--on-surface-variant)]">Current Task</label>
                <input
                  id="focus-current-task"
                  value={currentTask}
                  onChange={(event) => setCurrentTask(event.target.value)}
                  className="mt-1 w-full max-w-[45ch] rounded-lg border border-transparent bg-transparent px-1 text-lg md:text-2xl font-bold text-[var(--foreground)] placeholder:text-[var(--on-surface-variant)] focus:border-[var(--secondary)]"
                  placeholder="What are you working on?"
                />
              </div>

              <div className="type-label px-3 py-1.5 rounded-full bg-[var(--surface-container)] border border-[var(--border)] tracking-[0.15em] text-[var(--accent)]">
                {mode === 'focus' ? 'Focus' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'} - {timerStatus}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div
                key={timeLeft}
                initial={{ scale: 0.985 }}
                animate={{ scale: 1 }}
                className="timer-display text-[var(--accent)] drop-shadow-[0_0_45px_rgba(225,29,72,0.18)] mb-5"
              >
                {formatTime(timeLeft)}
              </motion.div>

              <div className="w-full max-w-xl h-2 bg-[var(--surface-container)] rounded-full overflow-hidden mb-7">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="flex items-center space-x-8">
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  aria-label="Reset focus timer"
                  className="flex flex-col items-center group space-y-2"
                >
                  <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--surface-container)] group-hover:border-[var(--accent)]/50">
                    <RotateCcw className="w-4 h-4 text-[var(--on-surface-variant)] group-hover:text-[var(--accent)]" />
                  </div>
                  <span className="type-label text-[var(--on-surface-variant)] tracking-[0.12em]">Reset</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  aria-label={isActive ? 'Pause focus timer' : 'Start focus timer'}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] flex items-center justify-center shadow-[0_20px_38px_rgba(225,29,72,0.35)] hover:scale-105 transition-transform duration-300"
                >
                  {isActive ? <Pause className="w-9 h-9 text-[#68001a] fill-current" /> : <Play className="w-9 h-9 text-[#68001a] fill-current" />}
                </button>

                <button type="button" onClick={skipSession} aria-label="Skip to the next timer mode" className="flex flex-col items-center group space-y-2">
                  <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center transition-all duration-300 group-hover:bg-[var(--surface-container)] group-hover:border-[var(--accent)]/50">
                    <SkipForward className="w-4 h-4 text-[var(--on-surface-variant)] group-hover:text-[var(--accent)]" />
                  </div>
                  <span className="type-label text-[var(--on-surface-variant)] tracking-[0.12em]">Skip</span>
                </button>
              </div>
            </div>
          </div>

          <aside className="bg-[var(--surface)]/90 backdrop-blur-xl rounded-3xl border border-[var(--border)] p-5 md:p-6 space-y-4">
            <h2 className="type-label tracking-[0.2em] text-[var(--on-surface-variant)]">Session Details</h2>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-container)] p-4">
              <CurrentDateTime compact />
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-container)] p-4">
              <div className="type-label flex items-center justify-between text-[var(--on-surface-variant)] tracking-[0.12em]">
                <span>Time Remaining</span>
                <Clock3 className="w-4 h-4" />
              </div>
              <p className="mt-2 text-2xl font-black tracking-tight text-[var(--foreground)]">{formatTime(timeLeft)}</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-container)] p-4">
              <div className="type-label flex items-center justify-between text-[var(--on-surface-variant)] tracking-[0.12em]">
                <span>Sessions Today</span>
                <CheckCircle2 className="w-4 h-4 text-[var(--secondary)]" />
              </div>
              <p className="mt-2 text-2xl font-black tracking-tight text-[var(--foreground)]">{sessionsCompleted}</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-container)] p-4">
              <div className="type-label flex items-center justify-between text-[var(--on-surface-variant)] tracking-[0.12em]">
                <span>Concentration Status</span>
                <Target className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <p className="mt-2 text-sm font-bold text-[var(--foreground)]">{isActive ? 'In progress - keep momentum' : 'Paused - ready when you are'}</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-container)] p-4 space-y-3">
              <div className="type-label flex items-center justify-between text-[var(--on-surface-variant)] tracking-[0.12em]">
                <span>Feedback</span>
                {settings.timerSoundsEnabled ? <Volume2 className="w-4 h-4 text-[var(--secondary)]" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <p className="text-sm font-bold text-[var(--foreground)]">{settings.timerSoundsEnabled ? 'Timer sounds enabled' : 'Timer sounds disabled'}</p>
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--on-surface-variant)]">
                <Music2 className="h-4 w-4" />
                <span>Ambient {ambientState === 'playing' ? 'playing' : settings.ambientEnabled ? 'ready' : 'off'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--on-surface-variant)]">
                <Mic className="h-4 w-4" />
                <span>Voice {voiceStatus === 'listening' ? 'listening' : settings.voiceCommandsEnabled ? voiceStatus : 'off'}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-gradient-to-br from-[var(--surface-container)] to-[var(--surface)] p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-[var(--primary)]" />
                <p className="type-label tracking-[0.12em] text-[var(--on-surface-variant)]">Professional Tip</p>
              </div>
              <p className="text-sm text-[var(--foreground)] leading-relaxed">Define one measurable outcome for this block before pressing start. Clarity improves completion rates.</p>
            </div>
          </aside>
        </section>

        <div className="mt-5 bg-[var(--surface)]/85 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="type-label md:text-[0.7rem] tracking-[0.14em] text-[var(--on-surface-variant)]">Tip: press F11 for browser fullscreen plus app fullscreen for zero distractions</div>
          <Link href="/settings" className="type-label tracking-[0.15em] text-[var(--primary)] hover:text-[var(--accent)] transition-colors">
            Refine Timer Settings
          </Link>
        </div>

        <div className="hidden 2xl:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col space-y-12 opacity-20 pointer-events-none">
          <div className="rotate-90 origin-left text-[0.66rem] font-black tracking-[0.45em] uppercase text-[var(--on-surface-variant)] whitespace-nowrap">Focus Mode</div>
          <div className="rotate-90 origin-left text-[0.66rem] font-black tracking-[0.45em] uppercase text-[var(--on-surface-variant)] whitespace-nowrap">Professional Flow</div>
        </div>

        <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_170px_rgba(0,0,0,0.22)] z-20" />
      </main>

      <ActionModal
        open={showResetModal}
        title="Reset Focus Session"
        description="This will stop the current focus session and restart the timer for the current mode."
        confirmText="Reset"
        cancelText="Continue"
        onCancel={() => setShowResetModal(false)}
        onConfirm={() => {
          resetTimer();
          setShowResetModal(false);
        }}
      />
    </div>
  );
}
