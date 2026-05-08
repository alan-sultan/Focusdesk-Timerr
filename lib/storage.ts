'use client';

export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type AppTheme = 'midnight' | 'sol' | 'colorBlind';
export type AmbientSoundType = 'rain' | 'deepFocus' | 'whiteNoise' | 'nature';
export type SessionStatus = 'completed' | 'interrupted';

export interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartSessions: boolean;
  autoStartBreaks: boolean;
  timerSoundsEnabled: boolean;
  timerSoundVolume: number;
  countdownSoundEnabled: boolean;
  ambientEnabled: boolean;
  ambientSound: AmbientSoundType;
  ambientVolume: number;
  voiceCommandsEnabled: boolean;
  theme: AppTheme;
}

export interface HistoryItem {
  id: string;
  task: string;
  mode: TimerMode;
  duration: number;
  timestamp: string;
  status: SessionStatus;
}

export const STORAGE_KEYS = {
  settings: 'chronos-settings',
  history: 'chronos-history',
  currentTask: 'chronos-current-task',
} as const;

export const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartSessions: false,
  autoStartBreaks: false,
  timerSoundsEnabled: false,
  timerSoundVolume: 60,
  countdownSoundEnabled: false,
  ambientEnabled: false,
  ambientSound: 'rain',
  ambientVolume: 45,
  voiceCommandsEnabled: false,
  theme: 'midnight',
};

const HISTORY_LIMIT = 100;

const TIMER_MODES: TimerMode[] = ['focus', 'shortBreak', 'longBreak'];
const THEMES: AppTheme[] = ['midnight', 'sol', 'colorBlind'];
const AMBIENT_SOUNDS: AmbientSoundType[] = ['rain', 'deepFocus', 'whiteNoise', 'nature'];

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readJson(key: string): unknown {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

function readString(key: string) {
  if (!canUseStorage()) {
    return '';
  }

  try {
    return window.localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function writeString(key: string, value: string) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore persistence failures; in-memory state still works.
  }
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function pickValue<T extends string>(value: unknown, allowed: readonly T[], fallback: T) {
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback;
}

function normalizeSettings(value: unknown): TimerSettings {
  const source = value && typeof value === 'object' ? (value as Partial<TimerSettings>) : {};
  const rawTheme = (value as { theme?: unknown } | null)?.theme;

  return {
    focusDuration: clampNumber(source.focusDuration, 1, 90, DEFAULT_SETTINGS.focusDuration),
    shortBreakDuration: clampNumber(source.shortBreakDuration, 1, 30, DEFAULT_SETTINGS.shortBreakDuration),
    longBreakDuration: clampNumber(source.longBreakDuration, 1, 60, DEFAULT_SETTINGS.longBreakDuration),
    longBreakInterval: clampNumber(source.longBreakInterval, 2, 8, DEFAULT_SETTINGS.longBreakInterval),
    autoStartSessions: typeof source.autoStartSessions === 'boolean' ? source.autoStartSessions : DEFAULT_SETTINGS.autoStartSessions,
    autoStartBreaks: typeof source.autoStartBreaks === 'boolean' ? source.autoStartBreaks : DEFAULT_SETTINGS.autoStartBreaks,
    timerSoundsEnabled: typeof source.timerSoundsEnabled === 'boolean' ? source.timerSoundsEnabled : DEFAULT_SETTINGS.timerSoundsEnabled,
    timerSoundVolume: clampNumber(source.timerSoundVolume, 0, 100, DEFAULT_SETTINGS.timerSoundVolume),
    countdownSoundEnabled: typeof source.countdownSoundEnabled === 'boolean' ? source.countdownSoundEnabled : DEFAULT_SETTINGS.countdownSoundEnabled,
    ambientEnabled: typeof source.ambientEnabled === 'boolean' ? source.ambientEnabled : DEFAULT_SETTINGS.ambientEnabled,
    ambientSound: pickValue(source.ambientSound, AMBIENT_SOUNDS, DEFAULT_SETTINGS.ambientSound),
    ambientVolume: clampNumber(source.ambientVolume, 0, 100, DEFAULT_SETTINGS.ambientVolume),
    voiceCommandsEnabled: typeof source.voiceCommandsEnabled === 'boolean' ? source.voiceCommandsEnabled : DEFAULT_SETTINGS.voiceCommandsEnabled,
    theme: rawTheme === 'serene' ? DEFAULT_SETTINGS.theme : pickValue(source.theme, THEMES, DEFAULT_SETTINGS.theme),
  };
}

function normalizeHistoryItem(value: unknown): HistoryItem | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const source = value as Partial<HistoryItem>;
  const rawStatus = (value as { status?: unknown }).status;
  const timestamp = typeof source.timestamp === 'string' && !Number.isNaN(Date.parse(source.timestamp))
    ? source.timestamp
    : new Date().toISOString();
  const status: SessionStatus = rawStatus === 'Success' || rawStatus === 'completed'
    ? 'completed'
    : 'interrupted';
  const task = typeof source.task === 'string' && source.task.trim().length > 0
    ? source.task.trim()
    : 'Untitled focus session';

  return {
    id: typeof source.id === 'string' ? source.id : String(source.id || Date.now()),
    task,
    mode: pickValue(source.mode, TIMER_MODES, 'focus'),
    duration: clampNumber(source.duration, 1, 240, DEFAULT_SETTINGS.focusDuration),
    timestamp,
    status,
  };
}

export function loadSettings() {
  const settings = normalizeSettings(readJson(STORAGE_KEYS.settings));
  saveSettings(settings);
  return settings;
}

export function saveSettings(settings: TimerSettings) {
  writeJson(STORAGE_KEYS.settings, normalizeSettings(settings));
}

export function loadHistory() {
  const value = readJson(STORAGE_KEYS.history);
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(normalizeHistoryItem).filter((item): item is HistoryItem => Boolean(item)).slice(0, HISTORY_LIMIT);
}

export function saveHistory(history: HistoryItem[]) {
  writeJson(STORAGE_KEYS.history, history.slice(0, HISTORY_LIMIT));
}

export function clearHistoryStorage() {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.history);
  } catch {
    // Nothing to recover from here.
  }
}

export function addHistoryItem(item: HistoryItem) {
  const history = loadHistory();
  const updated = [item, ...history].slice(0, HISTORY_LIMIT);
  saveHistory(updated);
  return updated;
}

export function loadCurrentTask() {
  return readString(STORAGE_KEYS.currentTask);
}

export function saveCurrentTask(task: string) {
  writeString(STORAGE_KEYS.currentTask, task);
}
