/**
 * Unit tests for SampleManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SampleManager } from './SampleManager';

// Mock AudioContext
class MockAudioContext {
  sampleRate = 44100;
  
  async decodeAudioData(): Promise<AudioBuffer> {
    // Create a mock AudioBuffer
    return {
      duration: 1.0,
      length: 44100,
      numberOfChannels: 2,
      sampleRate: 44100,
      getChannelData: () => new Float32Array(44100),
      copyFromChannel: () => {},
      copyToChannel: () => {}
    } as AudioBuffer;
  }
}

// Mock fetch
globalThis.fetch = vi.fn();

describe('SampleManager', () => {
  let manager: SampleManager;
  let mockContext: MockAudioContext;

  beforeEach(() => {
    mockContext = new MockAudioContext();
    manager = new SampleManager(mockContext as unknown as AudioContext);
    
    // Reset fetch mock
    vi.clearAllMocks();
  });

  describe('loading samples', () => {
    it('should load a sample successfully', async () => {
      // Mock successful fetch
      const mockArrayBuffer = new ArrayBuffer(1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockArrayBuffer
      });

      const sample = await manager.load('kick', '/samples/kick.wav');

      expect(sample.id).toBe('kick');
      expect(sample.buffer).toBeDefined();
      expect(sample.metadata.duration).toBeGreaterThan(0);
    });

    it('should return cached sample on second load', async () => {
      const mockArrayBuffer = new ArrayBuffer(1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockArrayBuffer
      });

      const sample1 = await manager.load('kick', '/samples/kick.wav');
      const sample2 = await manager.load('kick', '/samples/kick.wav');

      expect(sample1).toBe(sample2);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1); // Only called once
    });

    it('should throw error on failed fetch', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(manager.load('kick', '/samples/kick.wav')).rejects.toThrow();
    });

    it('should extract name from URL', async () => {
      const mockArrayBuffer = new ArrayBuffer(1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockArrayBuffer
      });

      const sample = await manager.load('kick', '/samples/kick-drum.wav');
      expect(sample.metadata.name).toBe('kick-drum');
    });
  });

  describe('sample retrieval', () => {
    beforeEach(async () => {
      const mockArrayBuffer = new ArrayBuffer(1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockArrayBuffer
      });
      
      await manager.load('kick', '/samples/kick.wav');
    });

    it('should get loaded sample', () => {
      const sample = manager.get('kick');
      expect(sample).toBeDefined();
      expect(sample?.id).toBe('kick');
    });

    it('should return undefined for non-existent sample', () => {
      const sample = manager.get('non-existent');
      expect(sample).toBeUndefined();
    });

    it('should check if sample exists', () => {
      expect(manager.has('kick')).toBe(true);
      expect(manager.has('non-existent')).toBe(false);
    });

    it('should get all samples', () => {
      const all = manager.getAll();
      expect(all.length).toBe(1);
      expect(all[0].id).toBe('kick');
    });
  });

  describe('load status', () => {
    it('should return idle status for non-loaded sample', () => {
      const status = manager.getStatus('kick');
      expect(status.status).toBe('idle');
    });

    it('should update status during loading', async () => {
      const mockArrayBuffer = new ArrayBuffer(1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: async () => mockArrayBuffer
      });

      const loadPromise = manager.load('kick', '/samples/kick.wav');
      
      // Check status during load (may be loading or loaded depending on timing)
      const status = manager.getStatus('kick');
      expect(['loading', 'loaded']).toContain(status.status);

      await loadPromise;

      // Should be loaded after await
      const finalStatus = manager.getStatus('kick');
      expect(finalStatus.status).toBe('loaded');
    });
  });

  describe('batch operations', () => {
    it('should load multiple samples in parallel', async () => {
      const mockArrayBuffer = new ArrayBuffer(1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockArrayBuffer
      });

      const samples = await manager.loadBatch([
        { id: 'kick', url: '/samples/kick.wav' },
        { id: 'snare', url: '/samples/snare.wav' },
        { id: 'hat', url: '/samples/hat.wav' }
      ]);

      expect(samples.length).toBe(3);
      expect(manager.has('kick')).toBe(true);
      expect(manager.has('snare')).toBe(true);
      expect(manager.has('hat')).toBe(true);
    });

    it('should clear all samples', async () => {
      const mockArrayBuffer = new ArrayBuffer(1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockArrayBuffer
      });

      await manager.load('kick', '/samples/kick.wav');
      expect(manager.has('kick')).toBe(true);

      manager.clear();
      expect(manager.has('kick')).toBe(false);
      expect(manager.getAll().length).toBe(0);
    });

    it('should remove specific sample', async () => {
      const mockArrayBuffer = new ArrayBuffer(1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockArrayBuffer
      });

      await manager.loadBatch([
        { id: 'kick', url: '/samples/kick.wav' },
        { id: 'snare', url: '/samples/snare.wav' }
      ]);

      manager.remove('kick');
      expect(manager.has('kick')).toBe(false);
      expect(manager.has('snare')).toBe(true);
    });
  });

  describe('memory usage', () => {
    beforeEach(async () => {
      const mockArrayBuffer = new ArrayBuffer(1000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        arrayBuffer: async () => mockArrayBuffer
      });
      
      await manager.load('kick', '/samples/kick.wav');
    });

    it('should calculate memory usage', () => {
      const usage = manager.getMemoryUsage();
      expect(usage).toBeGreaterThan(0);
    });

    it('should format memory usage', () => {
      const formatted = manager.getMemoryUsageFormatted();
      expect(formatted).toMatch(/\d+(\.\d+)?\s*(B|KB|MB)/);
    });
  });
});

