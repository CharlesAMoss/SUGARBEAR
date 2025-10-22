/**
 * Scheduler - Precision audio scheduling using lookahead pattern
 * Implements the Web Audio API recommended scheduling approach
 */

import type {
  IScheduler,
  SchedulerCallback,
  SchedulerConfig,
  Seconds,
  BeatTime
} from '../types/audio.types';
import { seconds, beatTime } from '../types/audio.types';
import type { BPM } from '../types/transport.types';
import { bpm as createBPM } from '../types/transport.types';
import { AUDIO } from '../constants';

export class Scheduler implements IScheduler {
  private _context: AudioContext;
  private _config: SchedulerConfig;
  private _bpm: BPM;
  private _isRunning: boolean = false;
  private _intervalId: number | null = null;
  private _callback: SchedulerCallback | null = null;
  
  // Timing state
  private _currentBeat: BeatTime = beatTime(0);
  private _nextNoteTime: Seconds = seconds(0);

  constructor(
    context: AudioContext,
    initialBPM: BPM = createBPM(120),
    config: Partial<SchedulerConfig> = {}
  ) {
    this._context = context;
    this._bpm = initialBPM;
    this._config = {
      lookahead: seconds(config.lookahead ?? AUDIO.LOOKAHEAD_TIME),
      scheduleInterval: config.scheduleInterval ?? AUDIO.SCHEDULE_INTERVAL
    };
  }

  /**
   * Start the scheduler
   */
  start(callback: SchedulerCallback): void {
    if (this._isRunning) {
      console.warn('Scheduler already running');
      return;
    }

    this._callback = callback;
    this._isRunning = true;
    this._currentBeat = beatTime(0);
    this._nextNoteTime = seconds(this._context.currentTime);

    // Start the scheduling loop
    this._intervalId = window.setInterval(() => {
      this._scheduleLoop();
    }, this._config.scheduleInterval);

    console.log('Scheduler started', {
      bpm: this._bpm,
      lookahead: this._config.lookahead,
      scheduleInterval: this._config.scheduleInterval
    });
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (!this._isRunning) {
      return;
    }

    this._isRunning = false;
    
    if (this._intervalId !== null) {
      window.clearInterval(this._intervalId);
      this._intervalId = null;
    }

    this._callback = null;
    this._currentBeat = beatTime(0);
    this._nextNoteTime = seconds(0);
    
    console.log('Scheduler stopped');
  }

  /**
   * Check if scheduler is running
   */
  isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * Get current beat position
   */
  getCurrentBeat(): BeatTime {
    return this._currentBeat;
  }

  /**
   * Set tempo
   */
  setTempo(newBPM: BPM): void {
    this._bpm = newBPM;
    console.log(`Tempo changed to ${newBPM} BPM`);
  }

  /**
   * Get tempo
   */
  getTempo(): number {
    return this._bpm;
  }

  /**
   * Reset playback position
   */
  reset(): void {
    this._currentBeat = beatTime(0);
    this._nextNoteTime = seconds(this._context.currentTime);
  }

  /**
   * Main scheduling loop
   * Looks ahead and schedules events in the near future
   */
  private _scheduleLoop(): void {
    if (!this._callback || !this._isRunning) {
      return;
    }

    const currentTime = seconds(this._context.currentTime);
    const lookaheadEndTime = seconds(currentTime + this._config.lookahead);

    // Schedule all events that fall within the lookahead window
    while (this._nextNoteTime < lookaheadEndTime) {
      // Call the callback with the scheduled time and beat
      this._callback(this._nextNoteTime, this._currentBeat);

      // Advance to next beat
      this._advanceNote();
    }
  }

  /**
   * Advance to the next note/beat
   */
  private _advanceNote(): void {
    // Calculate time for one 16th note at current BPM
    const secondsPerBeat = 60.0 / this._bpm;
    const secondsPerSixteenth = secondsPerBeat / 4;

    // Advance time
    this._nextNoteTime = seconds(this._nextNoteTime + secondsPerSixteenth);
    
    // Advance beat (in 16th note increments)
    this._currentBeat = beatTime((this._currentBeat as number) + 0.25);
  }

  /**
   * Get seconds per beat at current tempo
   */
  getSecondsPerBeat(): number {
    return 60.0 / this._bpm;
  }

  /**
   * Get seconds per step (16th note)
   */
  getSecondsPerStep(): number {
    return this.getSecondsPerBeat() / 4;
  }

  /**
   * Get lookahead time
   */
  getLookahead(): Seconds {
    return this._config.lookahead;
  }

  /**
   * Get schedule interval
   */
  getScheduleInterval(): number {
    return this._config.scheduleInterval;
  }

  /**
   * Calculate the exact time for a specific beat
   */
  beatToTime(beat: BeatTime): Seconds {
    const secondsPerBeat = 60.0 / this._bpm;
    const timeOffset = (beat as number) * secondsPerBeat;
    return seconds(this._nextNoteTime + timeOffset);
  }

  /**
   * Convert time to beat position
   */
  timeToBeat(time: Seconds): BeatTime {
    const secondsPerBeat = 60.0 / this._bpm;
    const elapsedTime = time - this._nextNoteTime;
    return beatTime(elapsedTime / secondsPerBeat);
  }
}
