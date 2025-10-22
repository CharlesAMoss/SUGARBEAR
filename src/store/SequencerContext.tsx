/**
 * SequencerContext - React Context for sequencer state management
 * Provides audio engine and sequencer access to components
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { AudioEngine } from '../audio/AudioEngine';
import { Scheduler } from '../audio/Scheduler.js';
import { Sequencer } from '../sequencer/Sequencer';
import type { Pattern, TrackId, StepIndex } from '../types/sequencer.types';
import type { BPM } from '../types/transport.types';
import type { GainValue } from '../types/audio.types';
import { bpm as createBPM } from '../types/transport.types';

/**
 * Sequencer context state
 */
interface SequencerContextState {
  // Audio engine state
  audioEngineState: 'uninitialized' | 'suspended' | 'running' | 'closed';
  
  // Playback state
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  tempo: BPM;
  
  // Pattern state
  pattern: Pattern | null;
  
  // Actions
  init: () => Promise<void>;
  resume: () => Promise<void>;
  
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
  
  // Master controls
  setMasterVolume: (volume: GainValue) => void;
}

const SequencerContext = createContext<SequencerContextState | null>(null);

/**
 * Sequencer provider props
 */
interface SequencerProviderProps {
  children: React.ReactNode;
  defaultTempo?: BPM;
}

/**
 * Sequencer provider component
 */
export const SequencerProvider: React.FC<SequencerProviderProps> = ({
  children,
  defaultTempo = createBPM(120)
}) => {
  // Audio engine and sequencer instances (persist across renders)
  const audioEngineRef = useRef<AudioEngine | null>(null);
  const schedulerRef = useRef<Scheduler | null>(null);
  const sequencerRef = useRef<Sequencer | null>(null);
  
  // State
  const [audioEngineState, setAudioEngineState] = useState<'uninitialized' | 'suspended' | 'running' | 'closed'>('uninitialized');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tempo, setTempoState] = useState(defaultTempo);
  const [pattern, setPatternState] = useState<Pattern | null>(null);
  
  // Animation frame for updating UI state
  const animationFrameRef = useRef<number | null>(null);
  
  /**
   * Initialize audio engine
   */
  const init = useCallback(async () => {
    if (audioEngineRef.current) {
      console.warn('Audio engine already initialized');
      return;
    }
    
    try {
      // Create audio engine
      const engine = new AudioEngine();
      await engine.init();
      audioEngineRef.current = engine;
      setAudioEngineState(engine.state);
      
      // Create scheduler
      const scheduler = new Scheduler(engine.context!, defaultTempo);
      schedulerRef.current = scheduler;
      
      // Create sequencer
      const sequencer = new Sequencer(engine, scheduler);
      sequencerRef.current = sequencer;
      
      console.log('Sequencer system initialized');
    } catch (error) {
      console.error('Failed to initialize audio engine:', error);
      setAudioEngineState('closed');
    }
  }, [defaultTempo]);
  
  /**
   * Resume audio engine (required after user interaction)
   */
  const resume = useCallback(async () => {
    if (!audioEngineRef.current) {
      await init();
    }
    
    await audioEngineRef.current?.resume();
    setAudioEngineState(audioEngineRef.current?.state || 'closed');
  }, [init]);
  
  /**
   * Update UI state in sync with sequencer
   */
  const updateUIState = useCallback(() => {
    if (!sequencerRef.current) return;
    
    const sequencer = sequencerRef.current;
    setIsPlaying(sequencer.status === 'playing');
    setIsPaused(sequencer.status === 'paused');
    setCurrentStep(sequencer.currentStep);
    setTempoState(sequencer.tempo);
    
    // Continue animation loop if playing
    if (sequencer.status === 'playing') {
      animationFrameRef.current = requestAnimationFrame(updateUIState);
    }
  }, []);
  
  /**
   * Play
   */
  const play = useCallback(() => {
    sequencerRef.current?.play();
    updateUIState();
    
    // Start animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(updateUIState);
  }, [updateUIState]);
  
  /**
   * Pause
   */
  const pause = useCallback(() => {
    sequencerRef.current?.pause();
    
    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    updateUIState();
  }, [updateUIState]);
  
  /**
   * Stop
   */
  const stop = useCallback(() => {
    sequencerRef.current?.stop();
    
    // Stop animation loop
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    updateUIState();
  }, [updateUIState]);
  
  /**
   * Set tempo
   */
  const setTempo = useCallback((newTempo: BPM) => {
    sequencerRef.current?.setTempo(newTempo);
    setTempoState(newTempo);
  }, []);
  
  /**
   * Set pattern
   */
  const setPattern = useCallback((newPattern: Pattern) => {
    sequencerRef.current?.setPattern(newPattern);
    setPatternState(newPattern);
  }, []);
  
  /**
   * Toggle step
   */
  const toggleStep = useCallback((trackId: TrackId, stepIndex: StepIndex) => {
    sequencerRef.current?.toggleStep(trackId, stepIndex);
    setPatternState(sequencerRef.current?.pattern || null);
  }, []);
  
  /**
   * Set step velocity
   */
  const setStepVelocity = useCallback((trackId: TrackId, stepIndex: StepIndex, velocity: GainValue) => {
    sequencerRef.current?.setStepVelocity(trackId, stepIndex, velocity);
    setPatternState(sequencerRef.current?.pattern || null);
  }, []);
  
  /**
   * Toggle mute
   */
  const toggleMute = useCallback((trackId: TrackId) => {
    sequencerRef.current?.toggleMute(trackId);
    setPatternState(sequencerRef.current?.pattern || null);
  }, []);
  
  /**
   * Toggle solo
   */
  const toggleSolo = useCallback((trackId: TrackId) => {
    sequencerRef.current?.toggleSolo(trackId);
    setPatternState(sequencerRef.current?.pattern || null);
  }, []);
  
  /**
   * Set track volume
   */
  const setTrackVolume = useCallback((trackId: TrackId, volume: GainValue) => {
    sequencerRef.current?.setTrackVolume(trackId, volume);
    setPatternState(sequencerRef.current?.pattern || null);
  }, []);
  
  /**
   * Set master volume
   */
  const setMasterVolume = useCallback((volume: GainValue) => {
    audioEngineRef.current?.setMasterGain(volume);
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      sequencerRef.current?.destroy();
      audioEngineRef.current?.close();
    };
  }, []);
  
  const contextValue: SequencerContextState = {
    audioEngineState,
    isPlaying,
    isPaused,
    currentStep,
    tempo,
    pattern,
    init,
    resume,
    play,
    pause,
    stop,
    setTempo,
    setPattern,
    toggleStep,
    setStepVelocity,
    toggleMute,
    toggleSolo,
    setTrackVolume,
    setMasterVolume
  };
  
  return (
    <SequencerContext.Provider value={contextValue}>
      {children}
    </SequencerContext.Provider>
  );
};

/**
 * Hook to access sequencer context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useSequencerContext = (): SequencerContextState => {
  const context = useContext(SequencerContext);
  if (!context) {
    throw new Error('useSequencerContext must be used within SequencerProvider');
  }
  return context;
};
