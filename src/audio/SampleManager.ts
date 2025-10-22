/**
 * SampleManager - Audio sample loading and caching
 * Handles fetch, decode, and storage of audio samples
 */

import type {
  ISampleManager,
  AudioSample,
  SampleMetadata,
  SampleLoadStatus
} from '../types/audio.types';
import { seconds } from '../types/audio.types';
import { ERROR_MESSAGES } from '../constants';

export class SampleManager implements ISampleManager {
  private _context: AudioContext;
  private _samples: Map<string, AudioSample> = new Map();
  private _loadStatus: Map<string, SampleLoadStatus> = new Map();

  constructor(context: AudioContext) {
    this._context = context;
  }

  /**
   * Load an audio sample from URL
   */
  async load(id: string, url: string): Promise<AudioSample> {
    // Check if already loaded
    const existing = this._samples.get(id);
    if (existing) {
      console.log(`Sample ${id} already loaded, returning cached version`);
      return existing;
    }

    // Check if already loading
    const status = this._loadStatus.get(id);
    if (status && status.status === 'loading') {
      console.warn(`Sample ${id} is already being loaded`);
      throw new Error(`Sample ${id} is already loading`);
    }

    // Mark as loading
    this._loadStatus.set(id, { status: 'loading', progress: 0 });

    try {
      // Fetch audio file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Update progress
      this._loadStatus.set(id, { status: 'loading', progress: 0.5 });

      // Decode audio data
      const audioBuffer = await this._context.decodeAudioData(arrayBuffer);

      // Create metadata
      const metadata: SampleMetadata = {
        id,
        name: this._extractNameFromUrl(url),
        url,
        duration: seconds(audioBuffer.duration),
        size: arrayBuffer.byteLength
      };

      // Create sample object
      const sample: AudioSample = {
        id,
        buffer: audioBuffer,
        metadata
      };

      // Cache the sample
      this._samples.set(id, sample);
      this._loadStatus.set(id, { status: 'loaded', sample });

      console.log(`Sample loaded: ${id}`, {
        duration: audioBuffer.duration,
        channels: audioBuffer.numberOfChannels,
        sampleRate: audioBuffer.sampleRate,
        size: `${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`
      });

      return sample;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      this._loadStatus.set(id, { status: 'error', error: errorObj });
      
      console.error(`Failed to load sample ${id}:`, error);
      throw new Error(`${ERROR_MESSAGES.SAMPLE_LOAD_FAILED}: ${id} - ${errorObj.message}`);
    }
  }

  /**
   * Get a loaded sample
   */
  get(id: string): AudioSample | undefined {
    return this._samples.get(id);
  }

  /**
   * Get all loaded samples
   */
  getAll(): ReadonlyArray<AudioSample> {
    return Array.from(this._samples.values());
  }

  /**
   * Check if sample is loaded
   */
  has(id: string): boolean {
    return this._samples.has(id);
  }

  /**
   * Get loading status for a sample
   */
  getStatus(id: string): SampleLoadStatus {
    return this._loadStatus.get(id) ?? { status: 'idle' };
  }

  /**
   * Clear all samples
   */
  clear(): void {
    this._samples.clear();
    this._loadStatus.clear();
    console.log('All samples cleared');
  }

  /**
   * Remove a specific sample
   */
  remove(id: string): void {
    this._samples.delete(id);
    this._loadStatus.delete(id);
  }

  /**
   * Load multiple samples in parallel
   */
  async loadBatch(samples: Array<{ id: string; url: string }>): Promise<AudioSample[]> {
    const promises = samples.map(({ id, url }) => this.load(id, url));
    return Promise.all(promises);
  }

  /**
   * Preload samples without waiting
   */
  preload(samples: Array<{ id: string; url: string }>): void {
    samples.forEach(({ id, url }) => {
      this.load(id, url).catch(error => {
        console.error(`Failed to preload sample ${id}:`, error);
      });
    });
  }

  /**
   * Extract filename from URL
   */
  private _extractNameFromUrl(url: string): string {
    const parts = url.split('/');
    const filename = parts[parts.length - 1] || 'Unknown';
    return filename.replace(/\.[^/.]+$/, ''); // Remove extension
  }

  /**
   * Get total memory usage of loaded samples
   */
  getMemoryUsage(): number {
    let totalBytes = 0;
    for (const sample of this._samples.values()) {
      totalBytes += sample.metadata.size;
    }
    return totalBytes;
  }

  /**
   * Get memory usage in human-readable format
   */
  getMemoryUsageFormatted(): string {
    const bytes = this.getMemoryUsage();
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
}
