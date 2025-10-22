/**
 * Sequencer - Main sequencer controller
 * Integrates AudioEngine and Scheduler with Pattern playback
 */

import type {
  Pattern,
  TrackId,
  StepIndex
} from '../types/sequencer.types';
import type {
  TransportState,
  PlaybackStatus,
  BPM
} from '../types/transport.types';
import type {
  IAudioEngine,
  IScheduler,
  BeatTime,
  Seconds,
  GainValue
} from '../types/audio.types';
import { beatTime, gainValue } from '../types/audio.types';

/**
 * Sequencer configuration
 */
export interface SequencerConfig {
  readonly stepsPerBeat: number; // 4 for 16th notes
  readonly beatsPerBar: number;  // 4 for 4/4 time
}

/**
 * Default configuration (16th notes, 4/4 time)
 */
const DEFAULT_CONFIG: SequencerConfig = {
  stepsPerBeat: 4,
  beatsPerBar: 4
};

/**
 * Main Sequencer class
 * Connects pattern data with audio playback
 */
export class Sequencer {
  private _audioEngine: IAudioEngine;
  private _scheduler: IScheduler;
  private _pattern: Pattern | null = null;
  private _transportState: TransportState = { status: 'stopped' };
  private _currentStep: number = 0;
  private _config: SequencerConfig;
  private _soloedTracks: Set<TrackId> = new Set();

  constructor(
    audioEngine: IAudioEngine,
    scheduler: IScheduler,
    config: SequencerConfig = DEFAULT_CONFIG
  ) {
    this._audioEngine = audioEngine;
    this._scheduler = scheduler;
    this._config = config;
  }

  /**
   * Get current transport state
   */
  get transportState(): TransportState {
    return this._transportState;
  }

  /**
   * Get current playback status
   */
  get status(): PlaybackStatus {
    return this._transportState.status;
  }

  /**
   * Get current pattern
   */
  get pattern(): Pattern | null {
    return this._pattern;
  }

  /**
   * Get current step position
   */
  get currentStep(): number {
    return this._currentStep;
  }

  /**
   * Get current tempo
   */
  get tempo(): BPM {
    return this._scheduler.getTempo() as BPM;
  }

  /**
   * Set the current pattern
   */
  setPattern(pattern: Pattern): void {
    this._pattern = pattern;
    this._currentStep = 0;
    console.log('Pattern set:', {
      id: pattern.id,
      name: pattern.name,
      tracks: pattern.tracks.length,
      length: pattern.length
    });
  }

  /**
   * Set tempo
   */
  setTempo(newTempo: BPM): void {
    this._scheduler.setTempo(newTempo);
    console.log(`Tempo changed to ${newTempo} BPM`);
  }

  /**
   * Start playback
   */
  play(): void {
    if (this._transportState.status === 'playing') {
      console.warn('Sequencer already playing');
      return;
    }

    if (!this._pattern) {
      console.warn('No pattern loaded');
      return;
    }

    // Update transport state
    const startTime = this._audioEngine.currentTime;
    this._transportState = {
      status: 'playing',
      startBeat: beatTime(0),
      startTime
    };

    // Start scheduler with callback
    this._scheduler.start((time: Seconds, beat: BeatTime) => {
      this._onSchedulerTick(time, beat);
    });

    console.log('Sequencer started', {
      tempo: this.tempo,
      patternLength: this._pattern.length
    });
  }

  /**
   * Pause playback
   */
  pause(): void {
    if (this._transportState.status !== 'playing') {
      console.warn('Sequencer not playing');
      return;
    }

    const currentBeat = this._scheduler.getCurrentBeat();
    this._transportState = {
      status: 'paused',
      pausedBeat: currentBeat
    };

    this._scheduler.stop();
    console.log('Sequencer paused at beat', currentBeat);
  }

  /**
   * Stop playback and reset position
   */
  stop(): void {
    this._transportState = { status: 'stopped' };
    this._scheduler.stop();
    this._currentStep = 0;
    console.log('Sequencer stopped');
  }

  /**
   * Toggle track mute
   */
  toggleMute(trackId: TrackId): void {
    if (!this._pattern) return;

    const updatedTracks = this._pattern.tracks.map(track =>
      track.id === trackId
        ? { ...track, muted: !track.muted }
        : track
    );

    this._pattern = {
      ...this._pattern,
      tracks: updatedTracks,
      modifiedAt: new Date()
    };

    console.log(`Track ${trackId} mute toggled`);
  }

  /**
   * Toggle track solo
   */
  toggleSolo(trackId: TrackId): void {
    if (!this._pattern) return;

    const track = this._pattern.tracks.find(t => t.id === trackId);
    if (!track) return;

    // Update solo set
    if (track.soloed) {
      this._soloedTracks.delete(trackId);
    } else {
      this._soloedTracks.add(trackId);
    }

    // Update track
    const updatedTracks = this._pattern.tracks.map(t =>
      t.id === trackId
        ? { ...t, soloed: !t.soloed }
        : t
    );

    this._pattern = {
      ...this._pattern,
      tracks: updatedTracks,
      modifiedAt: new Date()
    };

    console.log(`Track ${trackId} solo toggled`, {
      soloedTracks: Array.from(this._soloedTracks)
    });
  }

  /**
   * Set track volume
   */
  setTrackVolume(trackId: TrackId, volume: GainValue): void {
    if (!this._pattern) return;

    const updatedTracks = this._pattern.tracks.map(track =>
      track.id === trackId
        ? { ...track, volume }
        : track
    );

    this._pattern = {
      ...this._pattern,
      tracks: updatedTracks,
      modifiedAt: new Date()
    };
  }

  /**
   * Toggle a step on/off
   */
  toggleStep(trackId: TrackId, stepIndex: StepIndex): void {
    if (!this._pattern) return;

    const updatedTracks = this._pattern.tracks.map(track => {
      if (track.id !== trackId) return track;

      const updatedSteps = track.steps.map((step, idx) =>
        idx === stepIndex
          ? { ...step, active: !step.active }
          : step
      );

      return { ...track, steps: updatedSteps };
    });

    this._pattern = {
      ...this._pattern,
      tracks: updatedTracks,
      modifiedAt: new Date()
    };
  }

  /**
   * Set step velocity
   */
  setStepVelocity(trackId: TrackId, stepIndex: StepIndex, velocity: GainValue): void {
    if (!this._pattern) return;

    const updatedTracks = this._pattern.tracks.map(track => {
      if (track.id !== trackId) return track;

      const updatedSteps = track.steps.map((step, idx) =>
        idx === stepIndex
          ? { ...step, velocity }
          : step
      );

      return { ...track, steps: updatedSteps };
    });

    this._pattern = {
      ...this._pattern,
      tracks: updatedTracks,
      modifiedAt: new Date()
    };
  }

  /**
   * Scheduler callback - called for each scheduled beat
   */
  private _onSchedulerTick(time: Seconds, beat: BeatTime): void {
    if (!this._pattern || this._transportState.status !== 'playing') {
      return;
    }

    // Convert beat to step index
    // Each beat = 4 steps (16th notes), so beat * 4
    const stepInSequence = Math.floor((beat as number) * this._config.stepsPerBeat);
    const step = stepInSequence % this._pattern.length;

    // Update current step for UI
    this._currentStep = step;

    // Check if any tracks are soloed
    const hasSoloedTracks = this._soloedTracks.size > 0;

    // Process each track
    for (const track of this._pattern.tracks) {
      // Skip if muted
      if (track.muted) continue;

      // Skip if solo is active but this track is not soloed
      if (hasSoloedTracks && !track.soloed) continue;

      // Check if step is active
      const stepData = track.steps[step];
      if (!stepData || !stepData.active) continue;

      // Calculate final gain (track volume * step velocity)
      const finalGain = gainValue((track.volume as number) * (stepData.velocity as number));

      // Play the sample
      this._audioEngine.playVoice({
        sampleId: track.sampleId,
        startTime: time,
        gain: finalGain
      });
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stop();
    this._pattern = null;
    this._soloedTracks.clear();
  }
}
