'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AmbientSoundType, TimerSettings } from '@/lib/storage';

export type TimerSoundType = 'start' | 'break' | 'complete' | 'pause' | 'tick';
export type AmbientPlaybackState = 'off' | 'ready' | 'playing' | 'paused' | 'unavailable';

interface AmbientFallbackAudio {
  context: AudioContext;
  gain: GainNode;
  sources: Array<AudioBufferSourceNode | OscillatorNode>;
}

export const TIMER_SOUND_PATHS: Record<TimerSoundType, string> = {
  start: '/sounds/start.wav',
  break: '/sounds/break.wav',
  complete: '/sounds/complete.wav',
  pause: '/sounds/pause.wav',
  tick: '/sounds/tick.wav',
};

export const AMBIENT_SOUND_OPTIONS: Array<{ id: AmbientSoundType; label: string; description: string; path: string }> = [
  {
    id: 'rain',
    label: 'Rain',
    description: 'Soft rain texture for steady focus.',
    path: '/sounds/rain.wav',
  },
  {
    id: 'deepFocus',
    label: 'Deep Focus Music',
    description: 'Low, calm background tones.',
    path: '/sounds/deep-focus.wav',
  },
  {
    id: 'whiteNoise',
    label: 'White Noise',
    description: 'Even noise to mask distractions.',
    path: '/sounds/white-noise.wav',
  },
  {
    id: 'nature',
    label: 'Nature',
    description: 'Light outdoor ambience.',
    path: '/sounds/nature.wav',
  },
];

const AMBIENT_SOUND_PATHS = AMBIENT_SOUND_OPTIONS.reduce<Record<AmbientSoundType, string>>((paths, option) => {
  paths[option.id] = option.path;
  return paths;
}, {} as Record<AmbientSoundType, string>);

const AMBIENT_SOUND_LABELS = AMBIENT_SOUND_OPTIONS.reduce<Record<AmbientSoundType, string>>((labels, option) => {
  labels[option.id] = option.label;
  return labels;
}, {} as Record<AmbientSoundType, string>);

function isBrowser() {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined';
}

function getSafeVolume(volume: number) {
  return Math.min(1, Math.max(0, volume / 100));
}

function warnAudio(message: string, error?: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[FocusDesk audio] ${message}`, error);
  }
}

function getAudioContext() {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextConstructor =
    window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  return AudioContextConstructor ? new AudioContextConstructor() : null;
}

function playSynthCue(sound: TimerSoundType, volume: number) {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const gain = context.createGain();
  const now = context.currentTime;
  const safeVolume = Math.min(0.18, Math.max(0.01, volume / 100) * 0.18);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(safeVolume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (sound === 'complete' ? 0.55 : 0.28));
  gain.connect(context.destination);

  const notes: Record<TimerSoundType, number[]> = {
    start: [523.25, 659.25],
    break: [392, 523.25],
    complete: [659.25, 783.99, 987.77],
    pause: [392, 329.63],
    tick: [880],
  };

  notes[sound].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    oscillator.type = sound === 'tick' ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.12);
    oscillator.connect(gain);
    oscillator.start(now + index * 0.12);
    oscillator.stop(now + index * 0.12 + (sound === 'tick' ? 0.06 : 0.16));
  });

  window.setTimeout(() => void context.close(), sound === 'complete' ? 750 : 450);
}

export function useAudio(settings: TimerSettings) {
  const [ambientState, setAmbientState] = useState<AmbientPlaybackState>('off');
  const [ambientMessage, setAmbientMessage] = useState('Ambient sound is off.');
  const [lastTimerFeedback, setLastTimerFeedback] = useState('Timer sounds are off.');
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const ambientPathRef = useRef<string | null>(null);
  const ambientFallbackRef = useRef<AmbientFallbackAudio | null>(null);
  const activeTimerSoundsRef = useRef<Set<HTMLAudioElement>>(new Set());
  const settingsRef = useRef(settings);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const stopAmbientFallback = useCallback(() => {
    const fallback = ambientFallbackRef.current;
    if (!fallback) {
      return;
    }

    fallback.sources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Source may already be stopped.
      }
      source.disconnect();
    });
    fallback.gain.disconnect();
    void fallback.context.close();
    ambientFallbackRef.current = null;
  }, []);

  const disposeAmbient = useCallback(() => {
    const audio = ambientRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.removeAttribute('src');
      audio.load();
    }

    ambientRef.current = null;
    ambientPathRef.current = null;
    stopAmbientFallback();
  }, [stopAmbientFallback]);

  const stopTimerSounds = useCallback(() => {
    activeTimerSoundsRef.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeTimerSoundsRef.current.clear();
  }, []);

  const ensureAmbientAudio = useCallback(() => {
    if (!isBrowser()) {
      setAmbientState('unavailable');
      setAmbientMessage('Ambient sound is unavailable in this browser.');
      return null;
    }

    const currentSettings = settingsRef.current;
    const path = AMBIENT_SOUND_PATHS[currentSettings.ambientSound];
    if (ambientRef.current && ambientPathRef.current === path) {
      return ambientRef.current;
    }

    disposeAmbient();

    const audio = new Audio(path);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = getSafeVolume(currentSettings.ambientVolume);
    audio.addEventListener('error', (event) => {
      setAmbientState('unavailable');
      setAmbientMessage(`Could not load ${AMBIENT_SOUND_LABELS[currentSettings.ambientSound]}. Check /public/sounds.`);
      warnAudio(`Could not load ambient file ${path}.`, event);
    });
    audio.addEventListener('pause', () => {
      if (settingsRef.current.ambientEnabled) {
        setAmbientState('paused');
      }
    });
    audio.addEventListener('play', () => {
      setAmbientState('playing');
      setAmbientMessage(`${AMBIENT_SOUND_LABELS[settingsRef.current.ambientSound]} is playing.`);
    });

    ambientRef.current = audio;
    ambientPathRef.current = path;
    return audio;
  }, [disposeAmbient]);

  const playAmbientFallback = useCallback(() => {
    const context = getAudioContext();
    if (!context) {
      return false;
    }

    stopAmbientFallback();

    const currentSettings = settingsRef.current;
    const gain = context.createGain();
    gain.gain.value = getSafeVolume(currentSettings.ambientVolume) * 0.45;
    gain.connect(context.destination);

    const sources: Array<AudioBufferSourceNode | OscillatorNode> = [];

    if (currentSettings.ambientSound === 'deepFocus') {
      [110, 146.83, 220].forEach((frequency) => {
        const oscillator = context.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        oscillator.start();
        sources.push(oscillator);
      });
    } else {
      const bufferLength = context.sampleRate * 2;
      const buffer = context.createBuffer(1, bufferLength, context.sampleRate);
      const data = buffer.getChannelData(0);
      let filtered = 0;
      const lowPass = currentSettings.ambientSound === 'whiteNoise' ? 0.18 : currentSettings.ambientSound === 'nature' ? 0.92 : 0.62;
      for (let index = 0; index < bufferLength; index += 1) {
        const white = Math.random() * 2 - 1;
        filtered = lowPass * filtered + (1 - lowPass) * white;
        data[index] = filtered + white * 0.12;
      }

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();
      sources.push(source);
    }

    ambientFallbackRef.current = { context, gain, sources };
    setAmbientState('playing');
    setAmbientMessage(`${AMBIENT_SOUND_LABELS[currentSettings.ambientSound]} is playing with browser-generated fallback audio.`);
    return true;
  }, [stopAmbientFallback]);

  const playTimerSound = useCallback((sound: TimerSoundType, options?: { force?: boolean }) => {
    const currentSettings = settingsRef.current;
    const shouldPlay = options?.force || currentSettings.timerSoundsEnabled;
    if (!shouldPlay) {
      setLastTimerFeedback('Timer sounds are off.');
      return;
    }

    if (currentSettings.timerSoundVolume <= 0) {
      setLastTimerFeedback('Timer volume is 0%; raise it to hear cues.');
      return;
    }

    const path = TIMER_SOUND_PATHS[sound];
    const audio = isBrowser() ? new Audio(path) : null;
    if (!audio) {
      playSynthCue(sound, currentSettings.timerSoundVolume);
      setLastTimerFeedback('Timer cue played with browser fallback audio.');
      return;
    }

    audio.volume = getSafeVolume(currentSettings.timerSoundVolume);
    audio.load();

    if (sound !== 'tick') {
      stopTimerSounds();
    }

    activeTimerSoundsRef.current.add(audio);
    const cleanup = () => {
      activeTimerSoundsRef.current.delete(audio);
    };
    audio.addEventListener('ended', cleanup, { once: true });
    audio.addEventListener('error', (event) => {
      cleanup();
      warnAudio(`Could not load timer sound file ${path}.`, event);
    }, { once: true });

    audio.play()
      .then(() => {
        const label = sound === 'tick' ? 'Countdown tick' : `${sound} sound`;
        setLastTimerFeedback(`${label} played.`);
      })
      .catch((error) => {
        cleanup();
        warnAudio(`Browser blocked or failed timer sound ${path}; using fallback tone.`, error);
        playSynthCue(sound, currentSettings.timerSoundVolume);
        setLastTimerFeedback('Timer cue played with browser fallback audio.');
      });
  }, [stopTimerSounds]);

  const playCountdownTick = useCallback(() => {
    const currentSettings = settingsRef.current;
    if (!currentSettings.timerSoundsEnabled || !currentSettings.countdownSoundEnabled) {
      return;
    }

    playTimerSound('tick');
  }, [playTimerSound]);

  const playAmbient = useCallback(async () => {
    const currentSettings = settingsRef.current;
    if (!currentSettings.ambientEnabled) {
      setAmbientState('off');
      setAmbientMessage('Turn on ambient sound in Settings first.');
      return false;
    }

    if (currentSettings.ambientVolume <= 0) {
      setAmbientState('paused');
      setAmbientMessage('Ambient volume is 0%; raise it to hear background sound.');
      return false;
    }

    const audio = ensureAmbientAudio();
    if (!audio) {
      return false;
    }

    audio.volume = getSafeVolume(currentSettings.ambientVolume);
    stopAmbientFallback();

    try {
      await audio.play();
      setAmbientState('playing');
      setAmbientMessage(`${AMBIENT_SOUND_LABELS[currentSettings.ambientSound]} is playing.`);
      return true;
    } catch (error) {
      warnAudio('Browser blocked or failed ambient playback.', error);
      if (playAmbientFallback()) {
        return true;
      }
      setAmbientState('paused');
      setAmbientMessage('Press Play Ambient Sound to start audio in this browser.');
      return false;
    }
  }, [ensureAmbientAudio, playAmbientFallback, stopAmbientFallback]);

  const pauseAmbient = useCallback(() => {
    ambientRef.current?.pause();
    stopAmbientFallback();
    if (settingsRef.current.ambientEnabled) {
      setAmbientState('paused');
      setAmbientMessage('Ambient sound is paused.');
    }
  }, [stopAmbientFallback]);

  const stopAmbient = useCallback(() => {
    disposeAmbient();
    setAmbientState(settingsRef.current.ambientEnabled ? 'ready' : 'off');
    setAmbientMessage(settingsRef.current.ambientEnabled ? 'Ambient sound is ready.' : 'Ambient sound is off.');
  }, [disposeAmbient]);

  const toggleAmbient = useCallback(() => {
    const audio = ambientRef.current;
    if ((audio && !audio.paused) || ambientFallbackRef.current) {
      pauseAmbient();
      return;
    }

    void playAmbient();
  }, [pauseAmbient, playAmbient]);

  useEffect(() => {
    const audio = ambientRef.current;
    if (audio) {
      audio.volume = getSafeVolume(settings.ambientVolume);
    }
    if (ambientFallbackRef.current) {
      ambientFallbackRef.current.gain.gain.value = getSafeVolume(settings.ambientVolume) * 0.45;
    }
  }, [settings.ambientVolume]);

  useEffect(() => {
    if (!settings.ambientEnabled) {
      disposeAmbient();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAmbientState('off');
      setAmbientMessage('Ambient sound is off.');
      return;
    }

    setAmbientState((current) => (current === 'playing' ? current : 'ready'));
    setAmbientMessage((current) => (current.includes('playing') ? current : 'Ambient sound is ready.'));
  }, [settings.ambientEnabled, disposeAmbient]);

  useEffect(() => {
    const activeAudio = ambientRef.current;
    const wasPlaying = Boolean(activeAudio && !activeAudio.paused);
    const expectedPath = AMBIENT_SOUND_PATHS[settings.ambientSound];
    if (!ambientPathRef.current || ambientPathRef.current === expectedPath) {
      return;
    }

    disposeAmbient();
    setAmbientState(settings.ambientEnabled ? 'ready' : 'off');
    setAmbientMessage(`${AMBIENT_SOUND_LABELS[settings.ambientSound]} selected.`);

    if (wasPlaying && settings.ambientEnabled) {
      window.setTimeout(() => void playAmbient(), 0);
    }
  }, [settings.ambientSound, settings.ambientEnabled, disposeAmbient, playAmbient]);

  useEffect(() => {
    return () => {
      disposeAmbient();
      stopTimerSounds();
    };
  }, [disposeAmbient, stopTimerSounds]);

  return useMemo(() => ({
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
  }), [
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
  ]);
}
