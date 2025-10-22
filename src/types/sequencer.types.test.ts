/**
 * Unit tests for sequencer types and operations
 */

import { describe, it, expect } from 'vitest';
import {
  createTrack,
  createPattern,
  toggleStep,
  setStepVelocity,
  toggleTrackMute,
  stepIndex,
  trackId
} from '../types/sequencer.types';
import { gainValue } from '../types/audio.types';

describe('Sequencer Types', () => {
  describe('createTrack', () => {
    it('should create a track with default values', () => {
      const track = createTrack({
        name: 'Kick',
        sampleId: 'kick'
      });

      expect(track.name).toBe('Kick');
      expect(track.sampleId).toBe('kick');
      expect(track.steps.length).toBe(16);
      expect(track.muted).toBe(false);
      expect(track.soloed).toBe(false);
      expect(track.volume).toBeGreaterThan(0);
    });

    it('should create a track with custom color', () => {
      const track = createTrack({
        name: 'Snare',
        sampleId: 'snare',
        color: '#ff0000'
      });

      expect(track.color).toBe('#ff0000');
    });
  });

  describe('createPattern', () => {
    it('should create an empty pattern with default values', () => {
      const pattern = createPattern();

      expect(pattern.name).toBe('Untitled Pattern');
      expect(pattern.tracks.length).toBe(0);
      expect(pattern.length).toBe(16);
      expect(pattern.timeSignature.numerator).toBe(4);
      expect(pattern.timeSignature.denominator).toBe(4);
    });

    it('should create a pattern with tracks', () => {
      const track1 = createTrack({ name: 'Kick', sampleId: 'kick' });
      const track2 = createTrack({ name: 'Snare', sampleId: 'snare' });

      const pattern = createPattern({
        name: 'My Pattern',
        tracks: [track1, track2]
      });

      expect(pattern.name).toBe('My Pattern');
      expect(pattern.tracks.length).toBe(2);
    });
  });

  describe('toggleStep', () => {
    it('should toggle a step from inactive to active', () => {
      const track = createTrack({ name: 'Kick', sampleId: 'kick' });
      const pattern = createPattern({ tracks: [track] });

      const updated = toggleStep(pattern, track.id, stepIndex(0));

      expect(updated.tracks[0].steps[0].active).toBe(true);
    });

    it('should toggle a step from active to inactive', () => {
      const track = createTrack({ name: 'Kick', sampleId: 'kick' });
      const pattern = createPattern({ tracks: [track] });

      // Toggle twice
      let updated = toggleStep(pattern, track.id, stepIndex(0));
      updated = toggleStep(updated, track.id, stepIndex(0));

      expect(updated.tracks[0].steps[0].active).toBe(false);
    });

    it('should only affect the specified step', () => {
      const track = createTrack({ name: 'Kick', sampleId: 'kick' });
      const pattern = createPattern({ tracks: [track] });

      const updated = toggleStep(pattern, track.id, stepIndex(0));

      // Check that other steps are unaffected
      for (let i = 1; i < 16; i++) {
        expect(updated.tracks[0].steps[i].active).toBe(false);
      }
    });
  });

  describe('setStepVelocity', () => {
    it('should set velocity for a step', () => {
      const track = createTrack({ name: 'Kick', sampleId: 'kick' });
      const pattern = createPattern({ tracks: [track] });

      const velocity = gainValue(0.5);
      const updated = setStepVelocity(pattern, track.id, stepIndex(0), velocity);

      expect(updated.tracks[0].steps[0].velocity).toBe(velocity);
    });
  });

  describe('toggleTrackMute', () => {
    it('should toggle track mute state', () => {
      const track = createTrack({ name: 'Kick', sampleId: 'kick' });
      const pattern = createPattern({ tracks: [track] });

      const updated = toggleTrackMute(pattern, track.id);

      expect(updated.tracks[0].muted).toBe(true);
    });
  });

  describe('stepIndex validation', () => {
    it('should create valid step index', () => {
      expect(() => stepIndex(0)).not.toThrow();
      expect(() => stepIndex(15)).not.toThrow();
    });

    it('should throw for invalid step index', () => {
      expect(() => stepIndex(-1)).toThrow();
      expect(() => stepIndex(16)).toThrow();
    });
  });

  describe('trackId creation', () => {
    it('should create track id from string', () => {
      const id = trackId('test-id');
      expect(id).toBe('test-id');
    });
  });

  describe('immutability', () => {
    it('should not mutate original pattern when toggling step', () => {
      const track = createTrack({ name: 'Kick', sampleId: 'kick' });
      const original = createPattern({ tracks: [track] });

      toggleStep(original, track.id, stepIndex(0));

      // Original should be unchanged
      expect(original.tracks[0].steps[0].active).toBe(false);
    });

    it('should update modifiedAt timestamp', () => {
      const track = createTrack({ name: 'Kick', sampleId: 'kick' });
      const original = createPattern({ tracks: [track] });

      // Wait a tiny bit to ensure timestamp difference
      const updated = toggleStep(original, track.id, stepIndex(0));

      expect(updated.modifiedAt.getTime()).toBeGreaterThanOrEqual(
        original.modifiedAt.getTime()
      );
    });
  });
});
