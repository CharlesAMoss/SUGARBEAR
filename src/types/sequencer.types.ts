/**
 * Sequencer type definitions for SUGARBEAR
 * Pattern, Track, and Step types with immutable patterns
 */

import type { GainValue } from './audio.types';

// ============================================================================
// Step Types
// ============================================================================

/**
 * Step index (0-15 for 16-step sequence)
 */
export type StepIndex = number & { readonly __brand: 'StepIndex' };

/**
 * Creates a validated StepIndex
 */
export const stepIndex = (value: number, maxSteps = 16): StepIndex => {
  if (value < 0 || value >= maxSteps) {
    throw new Error(`Step index ${value} out of bounds (0-${maxSteps - 1})`);
  }
  return value as StepIndex;
};

/**
 * Step state - whether a step is active and its velocity
 */
export interface Step {
  readonly active: boolean;
  readonly velocity: GainValue;
}

/**
 * Creates a default inactive step
 */
export const createStep = (active = false, velocity: GainValue = 0.8 as GainValue): Step => ({
  active,
  velocity
});

/**
 * Step array for a track (16 steps)
 */
export type StepSequence = ReadonlyArray<Step>;

// ============================================================================
// Track Types
// ============================================================================

/**
 * Track ID (unique identifier)
 */
export type TrackId = string & { readonly __brand: 'TrackId' };

/**
 * Creates a TrackId
 */
export const trackId = (value: string): TrackId => value as TrackId;

/**
 * Track in the sequencer
 */
export interface Track {
  readonly id: TrackId;
  readonly name: string;
  readonly sampleId: string;
  readonly steps: StepSequence;
  readonly volume: GainValue;
  readonly muted: boolean;
  readonly soloed: boolean;
  readonly color: string; // hex color for UI
}

/**
 * Track creation parameters
 */
export interface CreateTrackParams {
  readonly id?: string;
  readonly name: string;
  readonly sampleId: string;
  readonly steps?: StepSequence;
  readonly volume?: GainValue;
  readonly color?: string;
}

/**
 * Creates a new track with default values
 */
export const createTrack = (params: CreateTrackParams): Track => {
  const defaultSteps: StepSequence = Array.from({ length: 16 }, () => createStep());
  
  return {
    id: trackId(params.id || crypto.randomUUID()),
    name: params.name,
    sampleId: params.sampleId,
    steps: params.steps || defaultSteps,
    volume: params.volume || (0.8 as GainValue),
    muted: false,
    soloed: false,
    color: params.color || '#6366f1'
  };
};

// ============================================================================
// Pattern Types
// ============================================================================

/**
 * Pattern ID
 */
export type PatternId = string & { readonly __brand: 'PatternId' };

/**
 * Creates a PatternId
 */
export const patternId = (value: string): PatternId => value as PatternId;

/**
 * Time signature
 */
export interface TimeSignature {
  readonly numerator: number;
  readonly denominator: number;
}

/**
 * Pattern - a collection of tracks forming a sequence
 */
export interface Pattern {
  readonly id: PatternId;
  readonly name: string;
  readonly tracks: ReadonlyArray<Track>;
  readonly length: number; // number of steps (16, 32, etc.)
  readonly timeSignature: TimeSignature;
  readonly createdAt: Date;
  readonly modifiedAt: Date;
}

/**
 * Pattern creation parameters
 */
export interface CreatePatternParams {
  readonly id?: string;
  readonly name?: string;
  readonly tracks?: ReadonlyArray<Track>;
  readonly length?: number;
  readonly timeSignature?: TimeSignature;
}

/**
 * Creates a new pattern with default values
 */
export const createPattern = (params: CreatePatternParams = {}): Pattern => ({
  id: patternId(params.id || crypto.randomUUID()),
  name: params.name || 'Untitled Pattern',
  tracks: params.tracks || [],
  length: params.length || 16,
  timeSignature: params.timeSignature || { numerator: 4, denominator: 4 },
  createdAt: new Date(),
  modifiedAt: new Date()
});

// ============================================================================
// Pattern Operations (Immutable)
// ============================================================================

/**
 * Toggle a step on/off
 */
export const toggleStep = (pattern: Pattern, trackId: TrackId, stepIdx: StepIndex): Pattern => {
  return {
    ...pattern,
    tracks: pattern.tracks.map(track =>
      track.id === trackId
        ? {
            ...track,
            steps: track.steps.map((step, idx) =>
              idx === stepIdx ? { ...step, active: !step.active } : step
            )
          }
        : track
    ),
    modifiedAt: new Date()
  };
};

/**
 * Set step velocity
 */
export const setStepVelocity = (
  pattern: Pattern,
  trackId: TrackId,
  stepIdx: StepIndex,
  velocity: GainValue
): Pattern => {
  return {
    ...pattern,
    tracks: pattern.tracks.map(track =>
      track.id === trackId
        ? {
            ...track,
            steps: track.steps.map((step, idx) =>
              idx === stepIdx ? { ...step, velocity } : step
            )
          }
        : track
    ),
    modifiedAt: new Date()
  };
};

/**
 * Set track volume
 */
export const setTrackVolume = (pattern: Pattern, trackId: TrackId, volume: GainValue): Pattern => {
  return {
    ...pattern,
    tracks: pattern.tracks.map(track =>
      track.id === trackId ? { ...track, volume } : track
    ),
    modifiedAt: new Date()
  };
};

/**
 * Toggle track mute
 */
export const toggleTrackMute = (pattern: Pattern, trackId: TrackId): Pattern => {
  return {
    ...pattern,
    tracks: pattern.tracks.map(track =>
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ),
    modifiedAt: new Date()
  };
};

/**
 * Toggle track solo
 */
export const toggleTrackSolo = (pattern: Pattern, trackId: TrackId): Pattern => {
  return {
    ...pattern,
    tracks: pattern.tracks.map(track =>
      track.id === trackId ? { ...track, soloed: !track.soloed } : track
    ),
    modifiedAt: new Date()
  };
};

/**
 * Add track to pattern
 */
export const addTrack = (pattern: Pattern, track: Track): Pattern => {
  return {
    ...pattern,
    tracks: [...pattern.tracks, track],
    modifiedAt: new Date()
  };
};

/**
 * Remove track from pattern
 */
export const removeTrack = (pattern: Pattern, trackId: TrackId): Pattern => {
  return {
    ...pattern,
    tracks: pattern.tracks.filter(track => track.id !== trackId),
    modifiedAt: new Date()
  };
};

/**
 * Clear all steps in a track
 */
export const clearTrack = (pattern: Pattern, trackId: TrackId): Pattern => {
  return {
    ...pattern,
    tracks: pattern.tracks.map(track =>
      track.id === trackId
        ? {
            ...track,
            steps: track.steps.map(() => createStep(false))
          }
        : track
    ),
    modifiedAt: new Date()
  };
};

/**
 * Clear entire pattern
 */
export const clearPattern = (pattern: Pattern): Pattern => {
  return {
    ...pattern,
    tracks: pattern.tracks.map(track => ({
      ...track,
      steps: track.steps.map(() => createStep(false))
    })),
    modifiedAt: new Date()
  };
};
