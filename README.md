# FocusDesk

FocusDesk is a minimal focus timer web app built for an HCI course project. It helps users run focus sessions, take breaks, track session history, and control feedback features without adding unnecessary complexity.

- Live demo: [https://focusdesk-timerr.vercel.app/](https://focusdesk-timerr.vercel.app/)
- GitHub repo: [https://github.com/alan-sultan/Focusdesk-Timerr](https://github.com/alan-sultan/Focusdesk-Timerr)

## Features

- Focus, short break, and long break timer modes
- Start, pause, reset, and skip controls
- Current task input before or during a session
- Session history saved in `localStorage`
- Current date and live time display
- Theme selection with Midnight as the default
- Responsive desktop and mobile navigation
- Keyboard-accessible controls with visible focus states

## New HCI Improvements

- Timer sound feedback with start, break, pause, completion, and optional countdown tick sounds
- Timer sound test buttons, enable/disable setting, and volume control
- Ambient focus sounds with Rain, Deep Focus Music, White Noise, and Nature options
- Ambient enable/disable setting, sound selector, volume control, and play/pause control
- Browser-safe audio handling with local WAV assets in `public/sounds`
- Keyboard tab navigation improvements for timer controls, settings controls, task inputs, tabs, and navigation
- Optional voice command support using the browser Web Speech API
- Voice commands: `start`, `pause`, `resume`, `stop`, `reset`, `break`, `focus`
- Date and time display that updates live
- Typed session history with task name, session type, duration, date/time, and completed/interrupted status
- Settings persistence for timer settings, sound preferences, ambient preferences, voice commands, theme, task, and history
- Midnight default theme, Sol theme, and Color Blind Friendly theme
- Removal or replacement of non-functional buttons and decorative controls

## HCI Principles Used

- Visibility of system status: the app shows timer state, current mode, sound state, ambient playback state, and voice command state.
- User control and freedom: users can pause, reset, switch modes, disable audio, stop ambient playback, disable voice commands, and clear history.
- Accessibility: controls are keyboard reachable, focus states are visible, and important icon buttons include accessible labels.
- Error prevention: audio is off by default, ambient sound does not autoplay on page load, only one ambient sound is used at a time, and browser-only APIs are guarded.
- Minimalism: advanced sound and voice controls live in Settings instead of cluttering the main timer.
- Consistency: labels, controls, and status messages use consistent styling and interaction patterns.

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- Lucide React icons
- Motion for subtle timer animation
- Recharts for statistics UI
- Browser `localStorage`
- Browser Web Audio / HTML Audio
- Browser Web Speech API for optional voice commands

## Themes

- Midnight is the default theme for first-time users.
- Sol remains available as a light theme.
- Color Blind Friendly provides high contrast with blue, amber, purple, and neutral tones so states are supported by labels, icons, borders, and contrast rather than red/green color alone.
- Theme preferences are stored in `localStorage`.

## Folder Structure

```text
app/
  page.tsx              Main timer dashboard
  focus/page.tsx        Distraction-free focus view
  history/page.tsx      Saved session history
  settings/page.tsx     Timer, audio, voice, and theme settings
  statistics/page.tsx   Statistics view
components/
  navigation.tsx        Sidebar and mobile navigation
  action-modal.tsx      Shared confirmation modal
  current-date-time.tsx Live date/time display
hooks/
  use-audio.ts          Timer and ambient audio controller
  use-voice-commands.ts Web Speech API voice command hook
lib/
  storage.ts            Typed localStorage helpers
  timer-context.tsx     Shared timer state and actions
public/sounds/
  *.wav                 Lightweight demo sound assets
```

## Installation

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Usage Guide

1. Enter the task you want to work on.
2. Choose Focus, Short Break, or Long Break.
3. Press Start.
4. Pause, reset, or skip when needed.
5. Open Settings to test timer sounds, enable timer sounds, enable countdown ticks, play ambient audio, enable voice commands, or change theme/durations.
6. Open History to review completed and interrupted sessions.

## Accessibility Notes

- Timer controls, task inputs, navigation links, settings toggles, sliders, select menus, and modal actions are keyboard reachable.
- Focus outlines are visible for keyboard users.
- Audio feedback is optional and has visual status feedback.
- Audio test buttons, ambient play/pause, and theme options are reachable with the Tab key.
- Voice support is optional and depends on browser support for the Web Speech API.
- If voice commands are unsupported or microphone permission is blocked, the app shows a friendly status message instead of crashing.

## Sound Assets

The app uses local WAV files from `public/sounds`. Timer sounds are user-controlled, respect the timer volume slider, and do not play when timer sounds are disabled. Ambient audio is also user-controlled, loops only after a user action, and does not autoplay on page load.

The included WAV files are audible generated demo assets, not silent placeholders. They can be regenerated with `scripts/generate-audio-assets.ps1`.

Required timer files:

- `public/sounds/start.wav`
- `public/sounds/break.wav`
- `public/sounds/complete.wav`

Optional timer files included in this implementation:

- `public/sounds/pause.wav`
- `public/sounds/tick.wav`

Ambient files:

- `public/sounds/rain.wav`
- `public/sounds/deep-focus.wav`
- `public/sounds/white-noise.wav`
- `public/sounds/nature.wav`

The included WAV files are lightweight demo assets. Replace them with higher-quality audio if desired, keeping the same filenames or updating `hooks/use-audio.ts`.

Timer sounds can be tested from Settings with the Test Start, Test Break, and Test Complete buttons. Ambient sounds can be tested from Settings with the Play Ambient control. Browsers require a user click before audio playback, so sounds intentionally start only from timer actions or explicit test/play controls.

## Quality Checks

```bash
npm run lint
npm run build
```

Both commands should pass before submitting. During the latest build, Next.js completed successfully while warning that the native `@next/swc-win32-x64-msvc` binary in `node_modules` was invalid and it used the downloaded WASM fallback.

## Future Improvements

- Add richer statistics generated directly from real session history
- Add export/import for settings and history
- Add optional browser notifications
- Add a small onboarding tooltip for first-time users
- Replace demo audio with polished production sound design

## HCI Course Note

FocusDesk is designed as a student-friendly HCI project: simple enough to explain in a demo, but complete enough to show practical accessibility, feedback, persistence, and user-control decisions.
