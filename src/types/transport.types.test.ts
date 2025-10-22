/**
 * Unit tests for transport types and time conversions
 */

import { describe, it, expect } from 'vitest';
import {
  bpm,
  beatsToSeconds,
  secondsToBeats,
  stepToBeat,
  beatToStep,
  DEFAULT_BPM
} from '../types/transport.types';
import { beatTime } from '../types/audio.types';

describe('Transport Types', () => {
  describe('bpm validation', () => {
    it('should create valid BPM', () => {
      expect(bpm(120)).toBe(120);
    });

    it('should clamp BPM to minimum', () => {
      expect(bpm(30)).toBe(60);
    });

    it('should clamp BPM to maximum', () => {
      expect(bpm(300)).toBe(200);
    });
  });

  describe('time conversions', () => {
    it('should convert beats to seconds at 120 BPM', () => {
      const result = beatsToSeconds(beatTime(4), bpm(120));
      expect(result).toBeCloseTo(2.0); // 4 beats at 120 BPM = 2 seconds
    });

    it('should convert beats to seconds at 60 BPM', () => {
      const result = beatsToSeconds(beatTime(4), bpm(60));
      expect(result).toBeCloseTo(4.0); // 4 beats at 60 BPM = 4 seconds
    });

    it('should convert seconds to beats at 120 BPM', () => {
      const result = secondsToBeats(2.0, bpm(120));
      expect(result).toBeCloseTo(4.0); // 2 seconds at 120 BPM = 4 beats
    });

    it('should be inverse operations', () => {
      const beats = beatTime(8);
      const tempo = bpm(140);
      
      const seconds = beatsToSeconds(beats, tempo);
      const backToBeats = secondsToBeats(seconds, tempo);
      
      expect(backToBeats).toBeCloseTo(beats as number);
    });
  });

  describe('step conversions', () => {
    it('should convert step to beat (16th notes)', () => {
      expect(stepToBeat(0)).toBe(0);
      expect(stepToBeat(4)).toBe(1);
      expect(stepToBeat(8)).toBe(2);
      expect(stepToBeat(16)).toBe(4);
    });

    it('should convert beat to step', () => {
      expect(beatToStep(beatTime(0))).toBe(0);
      expect(beatToStep(beatTime(1))).toBe(4);
      expect(beatToStep(beatTime(2))).toBe(8);
      expect(beatToStep(beatTime(4))).toBe(16);
    });

    it('should be inverse operations', () => {
      const step = 12;
      const beat = stepToBeat(step);
      const backToStep = beatToStep(beat);
      
      expect(backToStep).toBe(step);
    });
  });

  describe('DEFAULT_BPM', () => {
    it('should be 120', () => {
      expect(DEFAULT_BPM).toBe(120);
    });
  });
});
