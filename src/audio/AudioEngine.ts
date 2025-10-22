/**
 * AudioEngine - Core Web Audio API management
 * Handles AudioContext lifecycle, master gain, and sample playback
 */

import type {
  IAudioEngine,
  AudioEngineState,
  AudioSample,
  VoiceConfig,
  GainValue,
  Seconds
} from '../types/audio.types';
import { gainValue, seconds } from '../types/audio.types';
import { SampleManager } from './SampleManager.js';
import { AUDIO } from '../constants';

export class AudioEngine implements IAudioEngine {
  private _context: AudioContext | null = null;
  private _masterGain: GainNode | null = null;
  private _sampleManager: SampleManager | null = null;
  private _state: AudioEngineState = 'uninitialized';

  /**
   * Get current engine state
   */
  get state(): AudioEngineState {
    return this._state;
  }

  /**
   * Get current audio time in seconds
   */
  get currentTime(): Seconds {
    if (!this._context) {
      return seconds(0);
    }
    return seconds(this._context.currentTime);
  }

  /**
   * Get sample rate
   */
  get sampleRate(): number {
    return this._context?.sampleRate ?? AUDIO.SAMPLE_RATE;
  }

  /**
   * Get AudioContext (for advanced use)
   */
  get context(): AudioContext | null {
    return this._context;
  }

  /**
   * Initialize the audio engine
   * Must be called after user interaction (browser requirement)
   */
  async init(): Promise<void> {
    if (this._context) {
      console.warn('AudioEngine already initialized');
      return;
    }

    try {
      // Create AudioContext
      this._context = new AudioContext();

      // Create master gain node
      this._masterGain = this._context.createGain();
      this._masterGain.gain.value = AUDIO.MASTER_GAIN_DEFAULT;
      this._masterGain.connect(this._context.destination);

      // Create sample manager
      this._sampleManager = new SampleManager(this._context);

      // Update state based on context state
      this._updateState();

      // Listen for state changes
      this._context.addEventListener('statechange', () => {
        this._updateState();
      });

      console.log('AudioEngine initialized', {
        sampleRate: this._context.sampleRate,
        state: this._context.state
      });
    } catch (error) {
      this._state = 'closed';
      throw new Error(`Failed to initialize AudioEngine: ${error}`);
    }
  }

  /**
   * Resume audio context (required after user interaction)
   */
  async resume(): Promise<void> {
    if (!this._context) {
      throw new Error('AudioEngine not initialized');
    }

    if (this._context.state === 'suspended') {
      await this._context.resume();
      this._updateState();
    }
  }

  /**
   * Suspend audio context (pause all audio)
   */
  async suspend(): Promise<void> {
    if (!this._context) {
      throw new Error('AudioEngine not initialized');
    }

    if (this._context.state === 'running') {
      await this._context.suspend();
      this._updateState();
    }
  }

  /**
   * Close audio context and cleanup resources
   */
  async close(): Promise<void> {
    if (!this._context) {
      return;
    }

    await this._context.close();
    this._sampleManager?.clear();
    this._context = null;
    this._masterGain = null;
    this._sampleManager = null;
    this._state = 'closed';

    console.log('AudioEngine closed');
  }

  /**
   * Load an audio sample
   */
  async loadSample(id: string, url: string): Promise<AudioSample> {
    if (!this._sampleManager) {
      throw new Error('AudioEngine not initialized');
    }

    return this._sampleManager.load(id, url);
  }

  /**
   * Get a loaded sample
   */
  getSample(id: string): AudioSample | undefined {
    return this._sampleManager?.get(id);
  }

  /**
   * Check if sample is loaded
   */
  hasSample(id: string): boolean {
    return this._sampleManager?.has(id) ?? false;
  }

  /**
   * Play a voice/note
   */
  playVoice(config: VoiceConfig): void {
    if (!this._context || !this._masterGain) {
      throw new Error('AudioEngine not initialized');
    }

    if (this._state !== 'running') {
      console.warn('AudioEngine not running, cannot play voice');
      return;
    }

    const sample = this.getSample(config.sampleId);
    if (!sample) {
      console.warn(`Sample not found: ${config.sampleId}`);
      return;
    }

    // Create buffer source
    const source = this._context.createBufferSource();
    source.buffer = sample.buffer;
    source.playbackRate.value = config.playbackRate ?? 1.0;

    // Create gain node for this voice
    const gainNode = this._context.createGain();
    gainNode.gain.value = config.gain;

    // Connect: source -> gain -> master
    source.connect(gainNode);
    gainNode.connect(this._masterGain);

    // Schedule playback
    const startTime = config.startTime;
    source.start(startTime);

    // Cleanup after playback
    source.addEventListener('ended', () => {
      source.disconnect();
      gainNode.disconnect();
    });
  }

  /**
   * Play a sample immediately (convenience method)
   */
  playSampleNow(sampleId: string, gain: GainValue = gainValue(1.0)): void {
    this.playVoice({
      sampleId,
      startTime: this.currentTime,
      gain
    });
  }

  /**
   * Set master gain/volume
   */
  setMasterGain(gain: GainValue): void {
    if (!this._masterGain) {
      throw new Error('AudioEngine not initialized');
    }

    // Smooth ramp to prevent clicks
    const now = this.currentTime;
    this._masterGain.gain.setValueAtTime(this._masterGain.gain.value, now);
    this._masterGain.gain.linearRampToValueAtTime(gain, seconds(now + AUDIO.FADE_TIME));
  }

  /**
   * Get master gain
   */
  getMasterGain(): GainValue {
    if (!this._masterGain) {
      return AUDIO.MASTER_GAIN_DEFAULT;
    }
    return gainValue(this._masterGain.gain.value);
  }

  /**
   * Update internal state based on AudioContext state
   */
  private _updateState(): void {
    if (!this._context) {
      this._state = 'uninitialized';
      return;
    }

    switch (this._context.state) {
      case 'running':
        this._state = 'running';
        break;
      case 'suspended':
        this._state = 'suspended';
        break;
      case 'closed':
        this._state = 'closed';
        break;
      default:
        this._state = 'uninitialized';
    }
  }
}
