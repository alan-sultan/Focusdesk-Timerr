'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type VoiceCommand = 'start' | 'pause' | 'resume' | 'stop' | 'reset' | 'break' | 'focus';
export type VoiceCommandStatus = 'unsupported' | 'inactive' | 'listening' | 'error';

interface UseVoiceCommandsOptions {
  enabled: boolean;
  onCommand: (command: VoiceCommand) => void;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEventLike {
  results: ArrayLike<{
    isFinal?: boolean;
    0?: { transcript?: string };
  }>;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const SUPPORTED_COMMANDS: VoiceCommand[] = ['start', 'pause', 'resume', 'stop', 'reset', 'break', 'focus'];

function getRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const speechWindow = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition || null;
}

function extractCommand(transcript: string): VoiceCommand | null {
  const normalized = transcript.toLowerCase().trim();
  return SUPPORTED_COMMANDS.find((command) => normalized.split(/\s+/).includes(command)) || null;
}

export function useVoiceCommands({ enabled, onCommand }: UseVoiceCommandsOptions) {
  const [status, setStatus] = useState<VoiceCommandStatus>('inactive');
  const [lastTranscript, setLastTranscript] = useState('');
  const [message, setMessage] = useState('Voice commands are off.');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldListenRef = useRef(false);
  const onCommandRef = useRef(onCommand);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    const Recognition = getRecognitionConstructor();
    if (!enabled) {
      shouldListenRef.current = false;
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus('inactive');
      setMessage('Voice commands are off.');
      return;
    }

    if (!Recognition) {
      setStatus('unsupported');
      setMessage('Voice commands are not supported in this browser.');
      return;
    }

    shouldListenRef.current = true;
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const latest = event.results[event.results.length - 1];
      const transcript = latest?.[0]?.transcript?.trim() || '';
      if (!transcript) {
        return;
      }

      setLastTranscript(transcript);
      const command = extractCommand(transcript);
      if (command) {
        setMessage(`Heard "${command}".`);
        onCommandRef.current(command);
      } else {
        setMessage('Listening for: start, pause, resume, stop, reset, break, or focus.');
      }
    };

    recognition.onerror = (event) => {
      setStatus('error');
      setMessage(event.error === 'not-allowed' ? 'Microphone permission was blocked.' : 'Voice listening stopped. Try enabling it again.');
    };

    recognition.onend = () => {
      if (!shouldListenRef.current) {
        return;
      }

      try {
        recognition.start();
        setStatus('listening');
        setMessage('Voice commands are listening.');
      } catch {
        setStatus('error');
        setMessage('Voice listening could not restart.');
      }
    };

    try {
      recognition.start();
      setStatus('listening');
      setMessage('Voice commands are listening.');
    } catch {
      setStatus('error');
      setMessage('Voice listening could not start in this browser.');
    }

    return () => {
      shouldListenRef.current = false;
      recognition.onend = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [enabled]);

  return useMemo(() => ({
    status,
    message,
    lastTranscript,
    supportedCommands: SUPPORTED_COMMANDS,
  }), [lastTranscript, message, status]);
}
