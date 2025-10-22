/**
 * Transport and playback state types for SUGARBEAR
 * State machine patterns for transport control
 */

import type { BeatTime } from './audio.types';

// ============================================================================
// Transport State Machine
// ============================================================================

/**
 * Transport states using discriminated unions for type safety
 */
export type TransportState =
  | { readonly status: 'stopped' }
  | { readonly status: 'playing'; readonly startBeat: BeatTime; readonly startTime: number }
  | { readonly status: 'paused'; readonly pausedBeat: BeatTime };

/**
 * Transport actions
 */
export type TransportAction =
  | { type: 'PLAY'; startTime: number }
  | { type: 'PAUSE'; currentBeat: BeatTime }
  | { type: 'STOP' }
  | { type: 'CONTINUE'; resumeTime: number };

/**
 * Playback status (simplified)
 */
export type PlaybackStatus = 'stopped' | 'playing' | 'paused';

/**
 * Get simple status from transport state
 */
export const getPlaybackStatus = (state: TransportState): PlaybackStatus => state.status;

// ============================================================================
// Tempo Types
// ============================================================================

/**
 * Beats per minute (BPM)
 */
export type BPM = number & { readonly __brand: 'BPM' };

/**
 * Creates a validated BPM value (clamped to 60-200)
 */
export const bpm = (value: number): BPM => {
  return Math.max(60, Math.min(200, value)) as BPM;
};

/**
 * Default BPM value
 */
export const DEFAULT_BPM: BPM = 120 as BPM;

/**
 * Tempo change event
 */
export interface TempoChange {
  readonly beat: BeatTime;
  readonly bpm: BPM;
}

// ============================================================================
// Playback Position
// ============================================================================

/**
 * Current playback position
 */
export interface PlaybackPosition {
  readonly currentBeat: BeatTime;
  readonly currentStep: number;
  readonly currentBar: number;
  readonly progress: number; // 0.0 to 1.0 within current step
}

/**
 * Loop configuration
 */
export interface LoopConfig {
  readonly enabled: boolean;
  readonly startBeat: BeatTime;
  readonly endBeat: BeatTime;
}

// ============================================================================
// Transport Configuration
// ============================================================================

/**
 * Transport settings
 */
export interface TransportConfig {
  readonly bpm: BPM;
  readonly timeSignature: {
    readonly numerator: number;
    readonly denominator: number;
  };
  readonly loop: LoopConfig;
  readonly metronomeEnabled: boolean;
  readonly countInBars: number; // count-in before playback starts
}

/**
 * Default transport configuration
 */
export const createDefaultTransportConfig = (): TransportConfig => ({
  bpm: DEFAULT_BPM,
  timeSignature: { numerator: 4, denominator: 4 },
  loop: {
    enabled: true,
    startBeat: 0 as BeatTime,
    endBeat: 16 as BeatTime
  },
  metronomeEnabled: false,
  countInBars: 0
});

// ============================================================================
// Transport Interface
// ============================================================================

/**
 * Transport controller interface
 */
export interface ITransport {
  readonly state: TransportState;
  readonly config: TransportConfig;
  
  play(): void;
  pause(): void;
  stop(): void;
  
  setBPM(bpm: BPM): void;
  setLoop(start: BeatTime, end: BeatTime): void;
  toggleLoop(): void;
  
  getPosition(): PlaybackPosition;
  isPlaying(): boolean;
}

// ============================================================================
// Time Conversion Utilities
// ============================================================================

/**
 * Convert beats to seconds based on BPM
 */
export const beatsToSeconds = (beats: BeatTime, bpm: BPM): number => {
  return (beats * 60) / bpm;
};

/**
 * Convert seconds to beats based on BPM
 */
export const secondsToBeats = (seconds: number, bpm: BPM): BeatTime => {
  return ((seconds * bpm) / 60) as BeatTime;
};

/**
 * Convert step index to beat time
 */
export const stepToBeat = (step: number, subdivision = 4): BeatTime => {
  return (step / subdivision) as BeatTime;
};

/**
 * Convert beat time to step index
 */
export const beatToStep = (beat: BeatTime, subdivision = 4): number => {
  return Math.floor((beat as number) * subdivision);
};
