/**
 * Application constants for SUGARBEAR
 */

import { bpm } from '../types/transport.types';
import { gainValue } from '../types/audio.types';

// ============================================================================
// Sequencer Constants
// ============================================================================

export const SEQUENCER = {
  DEFAULT_STEPS: 16,
  DEFAULT_TRACKS: 16,
  MAX_STEPS: 64, // future: for polyrhythmic support
  MAX_TRACKS: 32,
  DEFAULT_VELOCITY: gainValue(0.8),
  MIN_VELOCITY: gainValue(0.0),
  MAX_VELOCITY: gainValue(1.0)
} as const;

// ============================================================================
// Transport Constants
// ============================================================================

export const TRANSPORT = {
  MIN_BPM: bpm(60),
  MAX_BPM: bpm(200),
  DEFAULT_BPM: bpm(120),
  TIME_SIGNATURE: { numerator: 4, denominator: 4 }
} as const;

// ============================================================================
// Audio Constants
// ============================================================================

export const AUDIO = {
  SAMPLE_RATE: 44100,
  MASTER_GAIN_DEFAULT: gainValue(0.8),
  LOOKAHEAD_TIME: 0.1, // 100ms lookahead for scheduling
  SCHEDULE_INTERVAL: 25, // check every 25ms
  FADE_TIME: 0.005 // 5ms fade to prevent clicks
} as const;

// ============================================================================
// Default Drum Kit Configuration
// ============================================================================

export interface DrumSample {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly color: string;
}

export const DEFAULT_DRUM_KIT: ReadonlyArray<DrumSample> = [
  { id: 'kick', name: 'Kick', url: '/samples/kick.wav', color: '#ef4444' },
  { id: 'snare', name: 'Snare', url: '/samples/snare.wav', color: '#f97316' },
  { id: 'clap', name: 'Clap', url: '/samples/clap.wav', color: '#f59e0b' },
  { id: 'hat-closed', name: 'Closed HH', url: '/samples/hat-closed.wav', color: '#84cc16' },
  { id: 'hat-open', name: 'Open HH', url: '/samples/hat-open.wav', color: '#22c55e' },
  { id: 'rim', name: 'Rim', url: '/samples/rim.wav', color: '#10b981' },
  { id: 'tom-hi', name: 'Tom Hi', url: '/samples/tom-hi.wav', color: '#14b8a6' },
  { id: 'tom-mid', name: 'Tom Mid', url: '/samples/tom-mid.wav', color: '#06b6d4' },
  { id: 'tom-lo', name: 'Tom Lo', url: '/samples/tom-lo.wav', color: '#0ea5e9' },
  { id: 'crash', name: 'Crash', url: '/samples/crash.wav', color: '#3b82f6' },
  { id: 'ride', name: 'Ride', url: '/samples/ride.wav', color: '#6366f1' },
  { id: 'perc-1', name: 'Perc 1', url: '/samples/perc-1.wav', color: '#8b5cf6' },
  { id: 'perc-2', name: 'Perc 2', url: '/samples/perc-2.wav', color: '#a855f7' },
  { id: 'perc-3', name: 'Perc 3', url: '/samples/perc-3.wav', color: '#d946ef' },
  { id: 'perc-4', name: 'Perc 4', url: '/samples/perc-4.wav', color: '#ec4899' },
  { id: 'perc-5', name: 'Perc 5', url: '/samples/perc-5.wav', color: '#f43f5e' }
] as const;

// ============================================================================
// UI Constants
// ============================================================================

export const UI = {
  ANIMATION_DURATION: 150, // ms for button press animations
  STEP_INDICATOR_FPS: 60,
  STEP_INDICATOR_UPDATE_INTERVAL: 1000 / 60, // ~16ms
  DEBOUNCE_DELAY: 100, // ms for input debouncing
  TOUCH_THRESHOLD: 10 // pixels for touch gesture detection
} as const;

// ============================================================================
// Theme Constants (Dark Mode)
// ============================================================================

export const THEME_DARK = {
  primary: '#6366f1', // indigo
  secondary: '#8b5cf6', // purple
  accent: '#ec4899', // pink
  background: '#0f172a', // slate-900
  surface: '#1e293b', // slate-800
  surfaceHover: '#334155', // slate-700
  text: '#f8fafc', // slate-50
  textSecondary: '#cbd5e1', // slate-300
  border: '#334155', // slate-700
  borderLight: '#475569', // slate-600
  active: '#10b981', // green-500
  inactive: '#475569', // slate-600
  muted: '#64748b', // slate-500
  error: '#ef4444', // red-500
  success: '#10b981', // green-500
  warning: '#f59e0b' // amber-500
} as const;

// ============================================================================
// Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  PATTERNS: 'sugarbear_patterns',
  SETTINGS: 'sugarbear_settings',
  LAST_PATTERN: 'sugarbear_last_pattern',
  THEME: 'sugarbear_theme'
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  AUDIO_CONTEXT_FAILED: 'Failed to initialize audio context',
  SAMPLE_LOAD_FAILED: 'Failed to load audio sample',
  SAMPLE_NOT_FOUND: 'Audio sample not found',
  INVALID_STEP_INDEX: 'Step index out of bounds',
  INVALID_TRACK_ID: 'Track ID not found',
  INVALID_BPM: 'BPM must be between 60 and 200',
  PATTERN_SAVE_FAILED: 'Failed to save pattern',
  PATTERN_LOAD_FAILED: 'Failed to load pattern'
} as const;
