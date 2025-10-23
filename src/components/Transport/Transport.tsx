/**
 * Transport - Playback controls (play/pause/stop, tempo, position)
 */

import React, { useState } from 'react';
import { useSequencer } from '../../hooks/useSequencer';
import { bpm as createBPM } from '../../types/transport.types';
import './Transport.css';

export const Transport: React.FC = () => {
  const { isPlaying, isPaused, play, pause, stop, tempo, setTempo, currentStep, pattern } = useSequencer();
  const [tempoBPM, setTempoBPM] = useState(tempo as number);

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseInt(e.target.value, 10);
    setTempoBPM(newTempo);
    setTempo(createBPM(newTempo));
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const displayStep = currentStep + 1; // 1-indexed for display
  const totalSteps = pattern?.length || 16;

  return (
    <div className="transport">
      <div className="transport-section transport-controls">
        <h2 className="transport-title">Transport</h2>
        
        <div className="transport-buttons">
          <button
            className={`transport-btn transport-btn-play ${isPlaying ? 'active' : ''}`}
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            className="transport-btn transport-btn-stop"
            onClick={stop}
            disabled={!isPlaying && !isPaused}
            aria-label="Stop"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
            <span>Stop</span>
          </button>
        </div>
      </div>

      <div className="transport-section transport-tempo">
        <h2 className="transport-title">Tempo</h2>
        <div className="tempo-control">
          <input
            type="range"
            min="60"
            max="200"
            value={tempoBPM}
            onChange={handleTempoChange}
            className="tempo-slider"
            aria-label="Tempo"
          />
          <div className="tempo-display">
            <span className="tempo-value">{tempoBPM}</span>
            <span className="tempo-label">BPM</span>
          </div>
        </div>
      </div>

      <div className="transport-section transport-position">
        <h2 className="transport-title">Position</h2>
        <div className="position-display">
          <span className="position-current">{displayStep}</span>
          <span className="position-separator">/</span>
          <span className="position-total">{totalSteps}</span>
        </div>
        <div className="position-bar">
          <div
            className="position-bar-fill"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
