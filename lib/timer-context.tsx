'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type AppTheme = 'midnight' | 'sol' | 'serene';

interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartSessions: boolean;
  autoStartBreaks: boolean;
  notificationSounds: boolean;
  theme: AppTheme;
}

interface TimerContextType {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  progress: number;
  sessionsCompleted: number;
  currentTask: string;
  settings: TimerSettings;
  isMounted: boolean;
  setMode: (mode: TimerMode) => void;
  setIsActive: (active: boolean) => void;
  resetTimer: () => void;
  skipSession: () => void;
  setCurrentTask: (task: string) => void;
  updateSettings: (newSettings: Partial<TimerSettings>) => void;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartSessions: false,
  autoStartBreaks: false,
  notificationSounds: true,
  theme: 'sol',
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface HistoryItem {
  id: number;
  task: string;
  duration: number;
  timestamp: string;
  status: 'Success' | 'Aborted';
}

function getDurationForMode(settings: TimerSettings, mode: TimerMode) {
  switch (mode) {
    case 'focus':
      return settings.focusDuration * 60;
    case 'shortBreak':
      return settings.shortBreakDuration * 60;
    case 'longBreak':
      return settings.longBreakDuration * 60;
    default:
      return 25 * 60;
  }
}

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const savedSettings = localStorage.getItem('chronos-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      setTimeLeft(parsed.focusDuration * 60);
    }

    const savedHistory = localStorage.getItem('chronos-history');
    if (savedHistory) {
      const history = JSON.parse(savedHistory) as HistoryItem[];
      const today = new Date().toDateString();
      const completedToday = history.filter((item) =>
        item.status === 'Success' && new Date(item.timestamp).toDateString() === today
      ).length;
      setSessionsCompleted(completedToday);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      document.documentElement.classList.remove('theme-midnight', 'theme-sol', 'theme-serene');
      document.documentElement.classList.add(`theme-${settings.theme}`);
      
      // Sync dark mode class
      if (settings.theme === 'sol') {
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
      }
    }
  }, [settings.theme, isMounted]);

  const getDuration = useCallback((m: TimerMode) => getDurationForMode(settings, m), [settings]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setTimeLeft(getDuration(mode));
  }, [mode, getDuration]);

  const switchMode = useCallback((newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getDuration(newMode));
    setIsActive(false);
  }, [getDuration]);

  const skipSession = useCallback(() => {
    if (mode === 'focus') {
      const nextSessionCount = sessionsCompleted + 1;
      setSessionsCompleted(nextSessionCount);
      if (nextSessionCount % settings.longBreakInterval === 0) {
        switchMode('longBreak');
      } else {
        switchMode('shortBreak');
      }
    } else {
      switchMode('focus');
    }
  }, [mode, sessionsCompleted, settings.longBreakInterval, switchMode]);

  const playNotification = useCallback(() => {
    if (settings.notificationSounds) {
      const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
      audio.play().catch((e) => console.error('Audio play failed:', e));
    }
  }, [settings.notificationSounds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsActive(false);
      playNotification();
      
      if (mode === 'focus') {
        const nextSessionCount = sessionsCompleted + 1;
        setSessionsCompleted(nextSessionCount);
        
        // Log to history
        const history = JSON.parse(localStorage.getItem('chronos-history') || '[]') as HistoryItem[];
        history.unshift({
          id: Date.now(),
          task: currentTask || 'Unnamed Session',
          duration: settings.focusDuration,
          timestamp: new Date().toISOString(),
          status: 'Success',
        });
        localStorage.setItem('chronos-history', JSON.stringify(history.slice(0, 50)));

        if (nextSessionCount % settings.longBreakInterval === 0) {
          switchMode('longBreak');
          if (settings.autoStartBreaks) setIsActive(true);
        } else {
          switchMode('shortBreak');
          if (settings.autoStartBreaks) setIsActive(true);
        }
      } else {
        switchMode('focus');
        if (settings.autoStartSessions) setIsActive(true);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, sessionsCompleted, settings, currentTask, switchMode, playNotification]);

  const progress = 1 - timeLeft / getDuration(mode);

  const updateSettings = (newSettings: Partial<TimerSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('chronos-settings', JSON.stringify(updated));

    // If we change durations and the timer isn't active, refresh current time left
    if (!isActive) {
      setTimeLeft(getDurationForMode(updated, mode));
    }
  };

  return (
    <TimerContext.Provider
      value={{
        mode,
        timeLeft,
        isActive,
        progress,
        sessionsCompleted,
        currentTask,
        settings,
        isMounted,
        setMode: switchMode,
        setIsActive,
        resetTimer,
        skipSession,
        setCurrentTask,
        updateSettings,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
