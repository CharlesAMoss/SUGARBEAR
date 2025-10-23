/**
 * useAudioEngine - Custom hook for audio engine control
 * Provides initialization, master volume, and engine state
 */

import { useSequencerContext } from '../store/SequencerContext';
import type { GainValue } from '../types/audio.types';

/**
 * Audio engine hook return type
 */
export interface UseAudioEngineReturn {
  // State
  audioEngineState: 'uninitialized' | 'suspended' | 'running' | 'closed';
  isInitialized: boolean;
  isRunning: boolean;
  
  // Actions
  init: () => Promise<void>;
  resume: () => Promise<void>;
  loadSample: (id: string, url: string) => Promise<void>;
  setMasterVolume: (volume: GainValue) => void;
}

/**
 * Hook to access audio engine functionality
 */
export const useAudioEngine = (): UseAudioEngineReturn => {
  const context = useSequencerContext();
  
  return {
    audioEngineState: context.audioEngineState,
    isInitialized: context.audioEngineState !== 'uninitialized',
    isRunning: context.audioEngineState === 'running',
    init: context.init,
    resume: context.resume,
    loadSample: context.loadSample,
    setMasterVolume: context.setMasterVolume
  };
};
