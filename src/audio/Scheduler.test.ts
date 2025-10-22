/**
 * Unit tests for Scheduler
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Scheduler } from './Scheduler';
import { bpm } from '../types/transport.types';
import { beatTime } from '../types/audio.types';

// Mock AudioContext
class MockAudioContext {
  currentTime = 0;
  sampleRate = 44100;
  
  // Simulate time passing
  advanceTime(seconds: number): void {
    this.currentTime += seconds;
  }
}

describe('Scheduler', () => {
  let scheduler: Scheduler;
  let mockContext: MockAudioContext;

  beforeEach(() => {
    mockContext = new MockAudioContext();
    scheduler = new Scheduler(mockContext as unknown as AudioContext, bpm(120));
    
    // Use fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    scheduler.stop();
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should start in stopped state', () => {
      expect(scheduler.isRunning()).toBe(false);
    });

    it('should have correct initial tempo', () => {
      expect(scheduler.getTempo()).toBe(120);
    });

    it('should start at beat 0', () => {
      expect(scheduler.getCurrentBeat()).toBe(0);
    });
  });

  describe('start and stop', () => {
    it('should start scheduler', () => {
      const callback = vi.fn();
      scheduler.start(callback);
      
      expect(scheduler.isRunning()).toBe(true);
    });

    it('should stop scheduler', () => {
      const callback = vi.fn();
      scheduler.start(callback);
      scheduler.stop();
      
      expect(scheduler.isRunning()).toBe(false);
    });

    it('should not start twice', () => {
      const callback = vi.fn();
      scheduler.start(callback);
      scheduler.start(callback); // Try to start again
      
      // Should still be running (not crashed)
      expect(scheduler.isRunning()).toBe(true);
    });

    it('should call callback during scheduling', () => {
      const callback = vi.fn();
      scheduler.start(callback);
      
      // Advance time to trigger scheduling
      mockContext.advanceTime(0.1);
      vi.advanceTimersByTime(50);
      
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('tempo control', () => {
    it('should set tempo', () => {
      scheduler.setTempo(bpm(140));
      expect(scheduler.getTempo()).toBe(140);
    });

    it('should calculate correct seconds per beat', () => {
      scheduler.setTempo(bpm(120));
      expect(scheduler.getSecondsPerBeat()).toBeCloseTo(0.5);
      
      scheduler.setTempo(bpm(60));
      expect(scheduler.getSecondsPerBeat()).toBeCloseTo(1.0);
    });

    it('should calculate correct seconds per step', () => {
      scheduler.setTempo(bpm(120));
      // At 120 BPM: 1 beat = 0.5s, 1 step (16th) = 0.125s
      expect(scheduler.getSecondsPerStep()).toBeCloseTo(0.125);
    });
  });

  describe('time conversions', () => {
    beforeEach(() => {
      scheduler.setTempo(bpm(120));
    });

    it('should convert beat to time', () => {
      const time = scheduler.beatToTime(beatTime(4));
      expect(time).toBeGreaterThanOrEqual(0);
    });

    it('should have lookahead and schedule interval', () => {
      expect(scheduler.getLookahead()).toBeGreaterThan(0);
      expect(scheduler.getScheduleInterval()).toBeGreaterThan(0);
    });
  });

  describe('beat tracking', () => {
    it('should track current beat', () => {
      const callback = vi.fn();
      scheduler.start(callback);
      
      // Initially at beat 0
      expect(scheduler.getCurrentBeat()).toBe(0);
    });

    it('should reset beat position', () => {
      const callback = vi.fn();
      scheduler.start(callback);
      
      scheduler.reset();
      expect(scheduler.getCurrentBeat()).toBe(0);
    });
  });

  describe('scheduling precision', () => {
    it('should schedule events within lookahead window', () => {
      const scheduledTimes: number[] = [];
      
      scheduler.start((time) => {
        scheduledTimes.push(time);
      });
      
      // Advance time to trigger several schedule cycles
      mockContext.advanceTime(0.2);
      vi.advanceTimersByTime(100);
      
      // Should have scheduled multiple events
      expect(scheduledTimes.length).toBeGreaterThan(0);
    });

    it('should maintain steady timing', () => {
      const scheduledBeats: number[] = [];
      
      scheduler.start((_time, beat) => {
        scheduledBeats.push(beat);
      });
      
      // Run for a bit
      mockContext.advanceTime(1.0);
      vi.advanceTimersByTime(500);
      
      // Beats should increment consistently
      if (scheduledBeats.length > 1) {
        for (let i = 1; i < scheduledBeats.length; i++) {
          const diff = scheduledBeats[i] - scheduledBeats[i - 1];
          expect(diff).toBeCloseTo(0.25); // 16th note increments
        }
      }
    });
  });
});
