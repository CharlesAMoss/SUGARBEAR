/**
 * Core audio type definitions for SUGARBEAR
 * Leverages TypeScript branded types for type safety
 */

// ============================================================================
// Branded Types for Time Safety
// ============================================================================

/**
 * Time in seconds (AudioContext time domain)
 * Prevents mixing audio time with musical time
 */
export type Seconds = number & { readonly __brand: 'Seconds' };

/**
 * Time in beats (musical time domain)
 */
export type BeatTime = number & { readonly __brand: 'BeatTime' };

/**
 * Creates a branded Seconds type
 */
export const seconds = (value: number): Seconds => value as Seconds;

/**
 * Creates a branded BeatTime type
 */
export const beatTime = (value: number): BeatTime => value as BeatTime;

// ============================================================================
// Audio Context Types
// ============================================================================

/**
 * Audio engine state
 */
export type AudioEngineState = 'uninitialized' | 'suspended' | 'running' | 'closed';

/**
 * Sample metadata
 */
export interface SampleMetadata {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly duration: Seconds;
  readonly size: number; // bytes
}

/**
 * Loaded audio sample
 */
export interface AudioSample {
  readonly id: string;
  readonly buffer: AudioBuffer;
  readonly metadata: SampleMetadata;
}

/**
 * Sample loading status
 */
export type SampleLoadStatus = 
  | { status: 'idle' }
  | { status: 'loading'; progress: number }
  | { status: 'loaded'; sample: AudioSample }
  | { status: 'error'; error: Error };

// ============================================================================
// Audio Node Configuration
// ============================================================================

/**
 * Gain/volume value (0.0 to 1.0)
 */
export type GainValue = number & { readonly __brand: 'GainValue' };

/**
 * Creates a validated GainValue (clamped to 0-1)
 */
export const gainValue = (value: number): GainValue => {
  return Math.max(0, Math.min(1, value)) as GainValue;
};

/**
 * Voice/note playback configuration
 */
export interface VoiceConfig {
  readonly sampleId: string;
  readonly startTime: Seconds;
  readonly gain: GainValue;
  readonly playbackRate?: number; // pitch adjustment, default 1.0
}

/**
 * Audio effects configuration (future)
 */
export interface AudioEffects {
  readonly reverb?: {
    readonly wet: GainValue;
    readonly roomSize: number;
  };
  readonly delay?: {
    readonly wet: GainValue;
    readonly time: Seconds;
    readonly feedback: number;
  };
  readonly filter?: {
    readonly type: BiquadFilterType;
    readonly frequency: number;
    readonly q: number;
  };
}

// ============================================================================
// Scheduling Types
// ============================================================================

/**
 * Scheduled event for audio playback
 */
export interface ScheduledEvent {
  readonly id: string;
  readonly time: Seconds;
  readonly type: 'note' | 'transport' | 'tempo';
  readonly data: unknown;
}

/**
 * Note event to be scheduled
 */
export interface NoteEvent {
  readonly trackId: string;
  readonly sampleId: string;
  readonly beat: BeatTime;
  readonly velocity: GainValue;
}

/**
 * Scheduler callback function
 */
export type SchedulerCallback = (currentTime: Seconds, nextBeat: BeatTime) => void;

/**
 * Scheduler configuration
 */
export interface SchedulerConfig {
  readonly lookahead: Seconds; // how far ahead to schedule (e.g., 0.1s)
  readonly scheduleInterval: number; // how often to check (e.g., 25ms)
}

// ============================================================================
// Audio Engine Interface
// ============================================================================

/**
 * Main audio engine interface
 */
export interface IAudioEngine {
  readonly state: AudioEngineState;
  readonly currentTime: Seconds;
  readonly sampleRate: number;
  
  init(): Promise<void>;
  resume(): Promise<void>;
  suspend(): Promise<void>;
  close(): Promise<void>;
  
  loadSample(id: string, url: string): Promise<AudioSample>;
  getSample(id: string): AudioSample | undefined;
  
  playVoice(config: VoiceConfig): void;
  setMasterGain(gain: GainValue): void;
}

/**
 * Sample manager interface
 */
export interface ISampleManager {
  load(id: string, url: string): Promise<AudioSample>;
  get(id: string): AudioSample | undefined;
  getAll(): ReadonlyArray<AudioSample>;
  has(id: string): boolean;
  clear(): void;
  getStatus(id: string): SampleLoadStatus;
}

/**
 * Scheduler interface
 */
export interface IScheduler {
  start(callback: SchedulerCallback): void;
  stop(): void;
  isRunning(): boolean;
  getCurrentBeat(): BeatTime;
  setTempo(bpm: number): void;
  getTempo(): number;
}
