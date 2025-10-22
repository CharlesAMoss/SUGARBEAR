/**
 * UI component prop types for SUGARBEAR
 * Shared types for React components
 */

import type { Pattern, Track, TrackId, StepIndex } from './sequencer.types';
import type { PlaybackStatus, BPM, PlaybackPosition } from './transport.types';
import type { GainValue } from './audio.types';

// ============================================================================
// Theme Types
// ============================================================================

/**
 * Theme mode
 */
export type ThemeMode = 'dark' | 'light';

/**
 * Color palette
 */
export interface ColorPalette {
  readonly primary: string;
  readonly secondary: string;
  readonly accent: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly border: string;
  readonly active: string;
  readonly inactive: string;
  readonly muted: string;
  readonly error: string;
  readonly success: string;
}

// ============================================================================
// Component Event Handlers
// ============================================================================

/**
 * Step click handler
 */
export type StepClickHandler = (trackId: TrackId, stepIndex: StepIndex) => void;

/**
 * Step velocity change handler
 */
export type VelocityChangeHandler = (trackId: TrackId, stepIndex: StepIndex, velocity: GainValue) => void;

/**
 * Track volume change handler
 */
export type VolumeChangeHandler = (trackId: TrackId, volume: GainValue) => void;

/**
 * Track mute toggle handler
 */
export type MuteToggleHandler = (trackId: TrackId) => void;

/**
 * Track solo toggle handler
 */
export type SoloToggleHandler = (trackId: TrackId) => void;

/**
 * Transport control handlers
 */
export interface TransportHandlers {
  readonly onPlay: () => void;
  readonly onPause: () => void;
  readonly onStop: () => void;
  readonly onTempoChange: (bpm: BPM) => void;
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * StepGrid component props
 */
export interface StepGridProps {
  readonly pattern: Pattern;
  readonly currentStep: number | null;
  readonly onStepClick: StepClickHandler;
  readonly disabled?: boolean;
}

/**
 * StepButton component props
 */
export interface StepButtonProps {
  readonly active: boolean;
  readonly highlighted: boolean;
  readonly velocity: GainValue;
  readonly color: string;
  readonly onClick: () => void;
  readonly onVelocityChange?: (velocity: GainValue) => void;
  readonly disabled?: boolean;
}

/**
 * Track component props
 */
export interface TrackProps {
  readonly track: Track;
  readonly currentStep: number | null;
  readonly onStepClick: (stepIndex: StepIndex) => void;
  readonly onVolumeChange: (volume: GainValue) => void;
  readonly onMuteToggle: () => void;
  readonly onSoloToggle: () => void;
  readonly disabled?: boolean;
}

/**
 * TrackControls component props
 */
export interface TrackControlsProps {
  readonly track: Track;
  readonly onVolumeChange: (volume: GainValue) => void;
  readonly onMuteToggle: () => void;
  readonly onSoloToggle: () => void;
  readonly disabled?: boolean;
}

/**
 * Transport component props
 */
export interface TransportProps {
  readonly status: PlaybackStatus;
  readonly bpm: BPM;
  readonly position: PlaybackPosition;
  readonly handlers: TransportHandlers;
  readonly disabled?: boolean;
}

/**
 * StepIndicator component props
 */
export interface StepIndicatorProps {
  readonly currentStep: number | null;
  readonly totalSteps: number;
  readonly progress?: number; // 0-1 for smooth animation
}

/**
 * VolumeSlider component props
 */
export interface VolumeSliderProps {
  readonly value: GainValue;
  readonly onChange: (value: GainValue) => void;
  readonly label?: string;
  readonly disabled?: boolean;
}

/**
 * TempoControl component props
 */
export interface TempoControlProps {
  readonly bpm: BPM;
  readonly onChange: (bpm: BPM) => void;
  readonly min?: number;
  readonly max?: number;
  readonly disabled?: boolean;
}

// ============================================================================
// Animation Types
// ============================================================================

/**
 * Animation state for step indicator
 */
export interface AnimationState {
  readonly isAnimating: boolean;
  readonly fromStep: number;
  readonly toStep: number;
  readonly progress: number; // 0-1
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  readonly duration: number; // milliseconds
  readonly easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Selection state for multi-step editing
 */
export interface SelectionState {
  readonly trackId: TrackId | null;
  readonly stepIndices: ReadonlyArray<StepIndex>;
}

/**
 * UI mode
 */
export type UIMode = 'edit' | 'perform' | 'record';

/**
 * View configuration
 */
export interface ViewConfig {
  readonly showVelocity: boolean;
  readonly showWaveforms: boolean;
  readonly compactMode: boolean;
  readonly gridLines: boolean;
}

/**
 * Application UI state
 */
export interface UIState {
  readonly mode: UIMode;
  readonly view: ViewConfig;
  readonly selection: SelectionState;
  readonly theme: ThemeMode;
}
