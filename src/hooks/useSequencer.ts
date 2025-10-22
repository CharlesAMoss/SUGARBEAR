/**
 * useSequencer - Custom hook for sequencer control
 * Provides transport controls and pattern editing
 */

import { useSequencerContext } from '../store/SequencerContext';
import type { Pattern, TrackId, StepIndex } from '../types/sequencer.types';
import type { BPM } from '../types/transport.types';
import type { GainValue } from '../types/audio.types';

/**
 * Sequencer hook return type
 */
export interface UseSequencerReturn {
  // State
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  tempo: BPM;
  pattern: Pattern | null;
  
  // Transport controls
  play: () => void;
  pause: () => void;
  stop: () => void;
  setTempo: (tempo: BPM) => void;
  
  // Pattern control
  setPattern: (pattern: Pattern) => void;
  toggleStep: (trackId: TrackId, stepIndex: StepIndex) => void;
  setStepVelocity: (trackId: TrackId, stepIndex: StepIndex, velocity: GainValue) => void;
  
  // Track controls
  toggleMute: (trackId: TrackId) => void;
  toggleSolo: (trackId: TrackId) => void;
  setTrackVolume: (trackId: TrackId, volume: GainValue) => void;
}

/**
 * Hook to access sequencer functionality
 */
export const useSequencer = (): UseSequencerReturn => {
  const context = useSequencerContext();
  
  return {
    isPlaying: context.isPlaying,
    isPaused: context.isPaused,
    currentStep: context.currentStep,
    tempo: context.tempo,
    pattern: context.pattern,
    play: context.play,
    pause: context.pause,
    stop: context.stop,
    setTempo: context.setTempo,
    setPattern: context.setPattern,
    toggleStep: context.toggleStep,
    setStepVelocity: context.setStepVelocity,
    toggleMute: context.toggleMute,
    toggleSolo: context.toggleSolo,
    setTrackVolume: context.setTrackVolume
  };
};
