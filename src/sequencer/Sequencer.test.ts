/**
 * Tests for Sequencer class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Sequencer } from './Sequencer';
import type { IAudioEngine, IScheduler, SchedulerCallback } from '../types/audio.types';
import type { Pattern } from '../types/sequencer.types';
import { createPattern, createTrack } from '../types/sequencer.types';
import { gainValue, seconds, beatTime } from '../types/audio.types';
import { trackId, stepIndex } from '../types/sequencer.types';

// Mock AudioEngine
class MockAudioEngine implements IAudioEngine {
  state: 'uninitialized' | 'suspended' | 'running' | 'closed' = 'running';
  currentTime = seconds(0);
  sampleRate = 44100;
  playedVoices: Array<{ sampleId: string; time: number; gain: number }> = [];

  async init(): Promise<void> {}
  async resume(): Promise<void> {}
  async suspend(): Promise<void> {}
  async close(): Promise<void> {}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadSample(): Promise<any> { return null; }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSample(): any { return null; }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  playVoice(config: any): void {
    this.playedVoices.push({
      sampleId: config.sampleId,
      time: config.startTime,
      gain: config.gain
    });
  }
  
  setMasterGain(): void {}
}

// Mock Scheduler
class MockScheduler implements IScheduler {
  private _isRunning = false;
  private _callback: SchedulerCallback | null = null;
  private _tempo = 120;
  private _currentBeat = beatTime(0);

  start(callback: SchedulerCallback): void {
    this._isRunning = true;
    this._callback = callback;
  }

  stop(): void {
    this._isRunning = false;
    this._callback = null;
  }

  isRunning(): boolean {
    return this._isRunning;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getCurrentBeat(): any {
    return this._currentBeat;
  }

  setTempo(bpm: number): void {
    this._tempo = bpm;
  }

  getTempo(): number {
    return this._tempo;
  }

  // Test helper to simulate scheduler ticks
  simulateTick(time: number, beat: number): void {
    this._currentBeat = beatTime(beat);
    if (this._callback) {
      this._callback(seconds(time), beatTime(beat));
    }
  }
}

describe('Sequencer', () => {
  let audioEngine: MockAudioEngine;
  let scheduler: MockScheduler;
  let sequencer: Sequencer;
  let testPattern: Pattern;

  beforeEach(() => {
    audioEngine = new MockAudioEngine();
    scheduler = new MockScheduler();
    sequencer = new Sequencer(audioEngine, scheduler);

    // Create test pattern: kick on 1st and 3rd beat, snare on 2nd and 4th
    // Create step arrays (16 steps, 4 per beat)
    const kickSteps = Array.from({ length: 16 }, (_, i) => ({
      active: i === 0 || i === 8, // Beat 0 and 2
      velocity: gainValue(0.9)
    }));

    const snareSteps = Array.from({ length: 16 }, (_, i) => ({
      active: i === 4 || i === 12, // Beat 1 and 3
      velocity: gainValue(0.8)
    }));

    const kickTrack = createTrack({
      id: 'kick',
      name: 'Kick',
      sampleId: 'kick',
      steps: kickSteps
    });

    const snareTrack = createTrack({
      id: 'snare',
      name: 'Snare',
      sampleId: 'snare',
      steps: snareSteps
    });

    testPattern = createPattern({
      name: 'Test Pattern',
      tracks: [kickTrack, snareTrack]
    });

    audioEngine.playedVoices = [];
  });

  describe('initialization', () => {
    it('should initialize with stopped status', () => {
      expect(sequencer.status).toBe('stopped');
      expect(sequencer.currentStep).toBe(0);
    });

    it('should set pattern', () => {
      sequencer.setPattern(testPattern);
      expect(sequencer.pattern).toBe(testPattern);
      expect(sequencer.currentStep).toBe(0);
    });

    it('should get current tempo', () => {
      expect(sequencer.tempo).toBe(120);
    });
  });

  describe('transport control', () => {
    beforeEach(() => {
      sequencer.setPattern(testPattern);
    });

    it('should start playback', () => {
      sequencer.play();
      expect(sequencer.status).toBe('playing');
      expect(scheduler.isRunning()).toBe(true);
    });

    it('should not start if already playing', () => {
      sequencer.play();
      const consoleSpy = vi.spyOn(console, 'warn');
      sequencer.play();
      expect(consoleSpy).toHaveBeenCalledWith('Sequencer already playing');
    });

    it('should not start without pattern', () => {
      const emptySequencer = new Sequencer(audioEngine, scheduler);
      const consoleSpy = vi.spyOn(console, 'warn');
      emptySequencer.play();
      expect(consoleSpy).toHaveBeenCalledWith('No pattern loaded');
      expect(emptySequencer.status).toBe('stopped');
    });

    it('should pause playback', () => {
      sequencer.play();
      sequencer.pause();
      expect(sequencer.status).toBe('paused');
      expect(scheduler.isRunning()).toBe(false);
    });

    it('should stop playback and reset position', () => {
      sequencer.play();
      scheduler.simulateTick(1.0, 2);
      sequencer.stop();
      expect(sequencer.status).toBe('stopped');
      expect(sequencer.currentStep).toBe(0);
      expect(scheduler.isRunning()).toBe(false);
    });

    it('should set tempo', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sequencer.setTempo(140 as any);
      expect(sequencer.tempo).toBe(140);
      expect(scheduler.getTempo()).toBe(140);
    });
  });

  describe('pattern playback', () => {
    beforeEach(() => {
      sequencer.setPattern(testPattern);
      sequencer.play();
    });

    it('should play kick on step 0', () => {
      scheduler.simulateTick(0, 0); // beat 0 = step 0
      
      expect(audioEngine.playedVoices).toHaveLength(1);
      expect(audioEngine.playedVoices[0].sampleId).toBe('kick');
      expect(audioEngine.playedVoices[0].gain).toBeCloseTo(0.72, 2); // 0.8 * 0.9
    });

    it('should play snare on step 4', () => {
      scheduler.simulateTick(0, 1); // beat 1 = step 4
      
      expect(audioEngine.playedVoices).toHaveLength(1);
      expect(audioEngine.playedVoices[0].sampleId).toBe('snare');
    });

    it('should play kick on step 8', () => {
      scheduler.simulateTick(0, 2); // beat 2 = step 8
      
      expect(audioEngine.playedVoices).toHaveLength(1);
      expect(audioEngine.playedVoices[0].sampleId).toBe('kick');
    });

    it('should update current step', () => {
      scheduler.simulateTick(0, 0);
      expect(sequencer.currentStep).toBe(0);
      
      scheduler.simulateTick(0, 1);
      expect(sequencer.currentStep).toBe(4);
      
      scheduler.simulateTick(0, 2);
      expect(sequencer.currentStep).toBe(8);
    });

    it('should loop pattern', () => {
      // Step 16 should wrap to step 0
      scheduler.simulateTick(0, 4); // beat 4 = step 16 -> wraps to 0
      expect(sequencer.currentStep).toBe(0);
    });

    it('should not play when stopped', () => {
      sequencer.stop();
      audioEngine.playedVoices = [];
      
      scheduler.simulateTick(0, 0);
      expect(audioEngine.playedVoices).toHaveLength(0);
    });
  });

  describe('track control', () => {
    beforeEach(() => {
      sequencer.setPattern(testPattern);
    });

    it('should toggle track mute', () => {
      const kickId = trackId('kick');
      sequencer.toggleMute(kickId);
      
      expect(sequencer.pattern!.tracks[0].muted).toBe(true);
      
      sequencer.toggleMute(kickId);
      expect(sequencer.pattern!.tracks[0].muted).toBe(false);
    });

    it('should not play muted track', () => {
      const kickId = trackId('kick');
      sequencer.toggleMute(kickId);
      sequencer.play();
      
      scheduler.simulateTick(0, 0); // Should have kick, but it's muted
      
      expect(audioEngine.playedVoices).toHaveLength(0);
    });

    it('should toggle track solo', () => {
      const kickId = trackId('kick');
      sequencer.toggleSolo(kickId);
      
      expect(sequencer.pattern!.tracks[0].soloed).toBe(true);
      
      sequencer.toggleSolo(kickId);
      expect(sequencer.pattern!.tracks[0].soloed).toBe(false);
    });

    it('should only play soloed tracks when solo is active', () => {
      const kickId = trackId('kick');
      sequencer.toggleSolo(kickId);
      sequencer.play();
      
      // Step 4 has snare but not kick
      scheduler.simulateTick(0, 1);
      
      // Snare should not play because kick is soloed
      expect(audioEngine.playedVoices).toHaveLength(0);
      
      audioEngine.playedVoices = [];
      
      // Step 0 has kick
      scheduler.simulateTick(0, 0);
      
      // Kick should play
      expect(audioEngine.playedVoices).toHaveLength(1);
      expect(audioEngine.playedVoices[0].sampleId).toBe('kick');
    });

    it('should set track volume', () => {
      const kickId = trackId('kick');
      const newVolume = gainValue(0.5);
      
      sequencer.setTrackVolume(kickId, newVolume);
      
      expect(sequencer.pattern!.tracks[0].volume).toBe(newVolume);
    });

    it('should apply track volume to playback', () => {
      const kickId = trackId('kick');
      sequencer.setTrackVolume(kickId, gainValue(0.5));
      sequencer.play();
      
      scheduler.simulateTick(0, 0);
      
      // Volume 0.5 * velocity 0.9 = 0.45
      expect(audioEngine.playedVoices[0].gain).toBeCloseTo(0.45, 2);
    });
  });

  describe('step editing', () => {
    beforeEach(() => {
      sequencer.setPattern(testPattern);
    });

    it('should toggle step', () => {
      const kickId = trackId('kick');
      const step1 = stepIndex(1);
      
      // Step 1 should be inactive initially
      expect(sequencer.pattern!.tracks[0].steps[1].active).toBe(false);
      
      sequencer.toggleStep(kickId, step1);
      expect(sequencer.pattern!.tracks[0].steps[1].active).toBe(true);
      
      sequencer.toggleStep(kickId, step1);
      expect(sequencer.pattern!.tracks[0].steps[1].active).toBe(false);
    });

    it('should set step velocity', () => {
      const kickId = trackId('kick');
      const step0 = stepIndex(0);
      const newVelocity = gainValue(0.5);
      
      sequencer.setStepVelocity(kickId, step0, newVelocity);
      
      expect(sequencer.pattern!.tracks[0].steps[0].velocity).toBe(newVelocity);
    });

    it('should apply step velocity to playback', () => {
      const kickId = trackId('kick');
      const step0 = stepIndex(0);
      sequencer.setStepVelocity(kickId, step0, gainValue(0.5));
      sequencer.play();
      
      scheduler.simulateTick(0, 0);
      
      // Volume 0.8 * velocity 0.5 = 0.4
      expect(audioEngine.playedVoices[0].gain).toBeCloseTo(0.4, 2);
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', () => {
      sequencer.setPattern(testPattern);
      sequencer.play();
      
      sequencer.destroy();
      
      expect(sequencer.status).toBe('stopped');
      expect(sequencer.pattern).toBe(null);
    });
  });
});
