'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAudio, type AmbientPlaybackState, type TimerSoundType } from '@/hooks/use-audio';
import { useVoiceCommands, type VoiceCommandStatus } from '@/hooks/use-voice-commands';
import {
  addHistoryItem,
  clearHistoryStorage,
  DEFAULT_SETTINGS,
  loadCurrentTask,
  loadHistory,
  loadSettings,
  saveCurrentTask,
  saveSettings,
  type AppTheme,
  type HistoryItem,
  type TimerMode,
  type TimerSettings,
} from '@/lib/storage';

export type { AmbientSoundType, AppTheme, HistoryItem, TimerMode, TimerSettings } from '@/lib/storage';

type TimerStatus = 'idle' | 'running' | 'paused';

interface TimerContextType {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  progress: number;
  sessionsCompleted: number;
  currentTask: string;
  settings: TimerSettings;
  timerStatus: TimerStatus;
  isMounted: boolean;
  ambientState: AmbientPlaybackState;
  ambientMessage: string;
  lastTimerFeedback: string;
  voiceStatus: VoiceCommandStatus;
  voiceMessage: string;
  lastVoiceTranscript: string;
  supportedVoiceCommands: string[];
  setMode: (mode: TimerMode) => void;
  setIsActive: (active: boolean) => void;
  resetTimer: () => void;
  skipSession: () => void;
  setCurrentTask: (task: string) => void;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
  restoreDefaultSettings: () => void;
  clearSessionHistory: () => void;
  playTimerSound: (sound: TimerSoundType, options?: { force?: boolean }) => void;
  playAmbient: () => Promise<boolean>;
  pauseAmbient: () => void;
  toggleAmbient: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

function getDurationForMode(settings: TimerSettings, mode: TimerMode) {
  switch (mode) {
    case 'focus':
      return settings.focusDuration * 60;
    case 'shortBreak':
      return settings.shortBreakDuration * 60;
    case 'longBreak':
      return settings.longBreakDuration * 60;
    default:
      return settings.focusDuration * 60;
  }
}

function getHistoryDurationMinutes(settings: TimerSettings, mode: TimerMode, elapsedSeconds: number, status: HistoryItem['status']) {
  const plannedDuration = getDurationForMode(settings, mode);
  const seconds = status === 'completed' ? plannedDuration : Math.max(1, elapsedSeconds);
  return Math.max(1, Math.round(seconds / 60));
}

function getCompletedFocusSessionsToday(history: HistoryItem[]) {
  const today = new Date().toDateString();
  return history.filter((item) =>
    item.mode === 'focus' &&
    item.status === 'completed' &&
    new Date(item.timestamp).toDateString() === today
  ).length;
}

function getCleanTask(task: string) {
  return task.trim() || 'Untitled focus session';
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [mode, setModeState] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusDuration * 60);
  const [isActive, setIsActiveState] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentTask, setCurrentTaskState] = useState('');
  const [sessionStartedAt, setSessionStartedAt] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const {
    ambientState,
    ambientMessage,
    lastTimerFeedback,
    playTimerSound,
    playCountdownTick,
    playAmbient,
    pauseAmbient,
    stopAmbient,
    stopTimerSounds,
    toggleAmbient,
  } = useAudio(settings);

  const getDuration = useCallback((selectedMode: TimerMode) => getDurationForMode(settings, selectedMode), [settings]);

  const recordSession = useCallback((status: HistoryItem['status'], completedMode: TimerMode = mode) => {
    const elapsedSeconds = getDuration(completedMode) - timeLeft;
    if (status === 'interrupted' && (!sessionStartedAt || elapsedSeconds <= 0)) {
      return;
    }

    addHistoryItem({
      id: `${Date.now()}-${completedMode}`,
      task: getCleanTask(currentTask),
      mode: completedMode,
      duration: getHistoryDurationMinutes(settings, completedMode, elapsedSeconds, status),
      timestamp: new Date().toISOString(),
      status,
    });
  }, [currentTask, getDuration, mode, sessionStartedAt, settings, timeLeft]);

  const switchMode = useCallback((newMode: TimerMode) => {
    if (newMode === mode && !isActive) {
      return;
    }

    recordSession('interrupted', mode);
    stopAmbient();
    stopTimerSounds();
    setModeState(newMode);
    setTimeLeft(getDuration(newMode));
    setIsActiveState(false);
    setSessionStartedAt(null);
  }, [getDuration, isActive, mode, recordSession, stopAmbient, stopTimerSounds]);

  const resetTimer = useCallback(() => {
    recordSession('interrupted', mode);
    stopAmbient();
    stopTimerSounds();
    setIsActiveState(false);
    setTimeLeft(getDuration(mode));
    setSessionStartedAt(null);
  }, [getDuration, mode, recordSession, stopAmbient, stopTimerSounds]);

  const skipSession = useCallback(() => {
    recordSession('interrupted', mode);
    stopAmbient();
    stopTimerSounds();
    setIsActiveState(false);
    setSessionStartedAt(null);

    if (mode === 'focus') {
      const nextSessionCount = sessionsCompleted + 1;
      const nextMode = nextSessionCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      setModeState(nextMode);
      setTimeLeft(getDuration(nextMode));
      playTimerSound('break');
      return;
    }

    setModeState('focus');
    setTimeLeft(getDuration('focus'));
  }, [getDuration, mode, playTimerSound, recordSession, sessionsCompleted, settings.longBreakInterval, stopAmbient, stopTimerSounds]);

  const changeActiveState = useCallback((active: boolean) => {
    if (active === isActive) {
      return;
    }

    if (active) {
      setSessionStartedAt((startedAt) => startedAt || new Date().toISOString());
      playTimerSound(mode === 'focus' ? 'start' : 'break');
      if (settings.ambientEnabled) {
        void playAmbient();
      }
    } else {
      pauseAmbient();
      stopTimerSounds();
      playTimerSound('pause');
    }

    setIsActiveState(active);
  }, [isActive, mode, pauseAmbient, playAmbient, playTimerSound, settings.ambientEnabled, stopTimerSounds]);

  const completeCurrentSession = useCallback(() => {
    setIsActiveState(false);
    recordSession('completed', mode);
    stopAmbient();
    stopTimerSounds();
    playTimerSound('complete');
    setSessionStartedAt(null);

    if (mode === 'focus') {
      const nextSessionCount = sessionsCompleted + 1;
      const nextMode: TimerMode = nextSessionCount % settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      setSessionsCompleted(nextSessionCount);
      setModeState(nextMode);
      setTimeLeft(getDuration(nextMode));

      if (settings.autoStartBreaks) {
        setSessionStartedAt(new Date().toISOString());
        setIsActiveState(true);
        if (settings.ambientEnabled) {
          window.setTimeout(() => void playAmbient(), 900);
        }
        window.setTimeout(() => playTimerSound('break'), 900);
      }
      return;
    }

    setModeState('focus');
    setTimeLeft(getDuration('focus'));

    if (settings.autoStartSessions) {
      setSessionStartedAt(new Date().toISOString());
      setIsActiveState(true);
      playTimerSound('start');
      if (settings.ambientEnabled) {
        void playAmbient();
      }
    }
  }, [
    getDuration,
    mode,
    playAmbient,
    playTimerSound,
    recordSession,
    sessionsCompleted,
    settings.ambientEnabled,
    settings.autoStartBreaks,
    settings.autoStartSessions,
    settings.longBreakInterval,
    stopAmbient,
    stopTimerSounds,
  ]);

  const updateSettings = useCallback((newSettings: Partial<TimerSettings>) => {
    setSettings((currentSettings) => {
      const updated = { ...currentSettings, ...newSettings };
      saveSettings(updated);

      if (!isActive) {
        setTimeLeft(getDurationForMode(updated, mode));
      }

      return updated;
    });
  }, [isActive, mode]);

  const restoreDefaultSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setTimeLeft(getDurationForMode(DEFAULT_SETTINGS, mode));
    stopAmbient();
    stopTimerSounds();
  }, [mode, stopAmbient, stopTimerSounds]);

  const clearSessionHistory = useCallback(() => {
    clearHistoryStorage();
    setSessionsCompleted(0);
  }, []);

  const setCurrentTask = useCallback((task: string) => {
    setCurrentTaskState(task);
    saveCurrentTask(task);
  }, []);

  const handleVoiceCommand = useCallback((command: string) => {
    switch (command) {
      case 'start':
      case 'resume':
        changeActiveState(true);
        break;
      case 'pause':
        changeActiveState(false);
        break;
      case 'stop':
        resetTimer();
        break;
      case 'reset':
        resetTimer();
        break;
      case 'break':
        switchMode('shortBreak');
        break;
      case 'focus':
        switchMode('focus');
        break;
      default:
        break;
    }
  }, [changeActiveState, resetTimer, switchMode]);

  const {
    status: voiceStatus,
    message: voiceMessage,
    lastTranscript: lastVoiceTranscript,
    supportedCommands,
  } = useVoiceCommands({
    enabled: settings.voiceCommandsEnabled,
    onCommand: handleVoiceCommand,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const savedSettings = loadSettings();
    const savedHistory = loadHistory();
    const savedTask = loadCurrentTask();

    setSettings(savedSettings);
    setTimeLeft(getDurationForMode(savedSettings, 'focus'));
    setSessionsCompleted(getCompletedFocusSessionsToday(savedHistory));
    setCurrentTaskState(savedTask);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    document.documentElement.classList.remove('theme-midnight', 'theme-sol', 'theme-colorBlind');
    document.documentElement.classList.add(`theme-${settings.theme}`);

    if (settings.theme === 'sol') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [settings.theme, isMounted]);

  useEffect(() => {
    if (!settings.ambientEnabled) {
      stopAmbient();
    }
  }, [settings.ambientEnabled, stopAmbient]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (isActive && timeLeft > 0 && timeLeft <= 10) {
      playCountdownTick();
    }
  }, [isActive, playCountdownTick, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      completeCurrentSession();
    }
  }, [completeCurrentSession, isActive, timeLeft]);

  const progress = useMemo(() => {
    const duration = getDuration(mode);
    return duration > 0 ? Math.min(1, Math.max(0, 1 - timeLeft / duration)) : 0;
  }, [getDuration, mode, timeLeft]);

  const timerStatus: TimerStatus = isActive
    ? 'running'
    : sessionStartedAt || timeLeft < getDuration(mode)
      ? 'paused'
      : 'idle';

  const value = useMemo<TimerContextType>(() => ({
    mode,
    timeLeft,
    isActive,
    progress,
    sessionsCompleted,
    currentTask,
    settings,
    timerStatus,
    isMounted,
    ambientState,
    ambientMessage,
    lastTimerFeedback,
    voiceStatus,
    voiceMessage,
    lastVoiceTranscript,
    supportedVoiceCommands: supportedCommands,
    setMode: switchMode,
    setIsActive: changeActiveState,
    resetTimer,
    skipSession,
    setCurrentTask,
    updateSettings,
    restoreDefaultSettings,
    clearSessionHistory,
    playTimerSound,
    playAmbient,
    pauseAmbient,
    toggleAmbient,
  }), [
    ambientMessage,
    ambientState,
    changeActiveState,
    clearSessionHistory,
    currentTask,
    isActive,
    isMounted,
    lastTimerFeedback,
    lastVoiceTranscript,
    mode,
    pauseAmbient,
    playAmbient,
    playTimerSound,
    progress,
    resetTimer,
    restoreDefaultSettings,
    sessionsCompleted,
    setCurrentTask,
    settings,
    skipSession,
    supportedCommands,
    switchMode,
    timeLeft,
    timerStatus,
    toggleAmbient,
    updateSettings,
    voiceMessage,
    voiceStatus,
  ]);

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
