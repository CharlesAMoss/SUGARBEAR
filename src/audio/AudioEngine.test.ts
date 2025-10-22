/**
 * Unit tests for AudioEngine
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AudioEngine } from './AudioEngine';
import { gainValue } from '../types/audio.types';

describe('AudioEngine', () => {
  let engine: AudioEngine;

  beforeEach(() => {
    engine = new AudioEngine();
  });

  afterEach(async () => {
    await engine.close();
  });

  describe('initialization', () => {
    it('should start in uninitialized state', () => {
      expect(engine.state).toBe('uninitialized');
    });

    it('should initialize successfully', async () => {
      await engine.init();
      expect(engine.state).not.toBe('uninitialized');
      expect(engine.context).not.toBeNull();
    });

    it('should have valid sample rate after init', async () => {
      await engine.init();
      expect(engine.sampleRate).toBeGreaterThan(0);
    });

    it('should not re-initialize if already initialized', async () => {
      await engine.init();
      const context1 = engine.context;
      
      await engine.init(); // Try to init again
      const context2 = engine.context;
      
      expect(context1).toBe(context2); // Should be same instance
    });
  });

  describe('lifecycle', () => {
    beforeEach(async () => {
      await engine.init();
    });

    it('should resume when suspended', async () => {
      await engine.suspend();
      await engine.resume();
      expect(engine.state).toBe('running');
    });

    it('should close successfully', async () => {
      await engine.close();
      expect(engine.state).toBe('closed');
      expect(engine.context).toBeNull();
    });
  });

  describe('master gain', () => {
    beforeEach(async () => {
      await engine.init();
    });

    it('should set master gain', () => {
      const newGain = gainValue(0.5);
      engine.setMasterGain(newGain);
      
      // Give it a moment for the ramp
      setTimeout(() => {
        expect(engine.getMasterGain()).toBeCloseTo(0.5);
      }, 10);
    });

    it('should get master gain', () => {
      const gain = engine.getMasterGain();
      expect(gain).toBeGreaterThan(0);
      expect(gain).toBeLessThanOrEqual(1);
    });
  });

  describe('error handling', () => {
    it('should throw when resuming before init', async () => {
      await expect(engine.resume()).rejects.toThrow('not initialized');
    });

    it('should throw when setting gain before init', () => {
      expect(() => engine.setMasterGain(gainValue(0.5))).toThrow('not initialized');
    });

    it('should throw when playing voice before init', () => {
      expect(() => engine.playSampleNow('test')).toThrow('not initialized');
    });
  });

  describe('currentTime', () => {
    it('should return 0 when not initialized', () => {
      expect(engine.currentTime).toBe(0);
    });

    it('should return valid time after init', async () => {
      await engine.init();
      expect(engine.currentTime).toBeGreaterThanOrEqual(0);
    });
  });
});
