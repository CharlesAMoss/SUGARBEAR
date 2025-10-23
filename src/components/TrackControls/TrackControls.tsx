/**
 * TrackControls - Per-track mute/solo/volume controls
 */

import React, { useState } from 'react';
import { useSequencer } from '../../hooks/useSequencer';
import type { Track } from '../../types/sequencer.types';
import { gainValue } from '../../types/audio.types';
import './TrackControls.css';

interface TrackControlsProps {
  track: Track;
}

export const TrackControl: React.FC<TrackControlsProps> = ({ track }) => {
  const { toggleMute, toggleSolo, setTrackVolume } = useSequencer();
  const [volume, setVolume] = useState((track.volume as number) * 100);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    setTrackVolume(track.id, gainValue(newVolume / 100));
  };

  const handleMuteClick = () => {
    toggleMute(track.id);
  };

  const handleSoloClick = () => {
    toggleSolo(track.id);
  };

  return (
    <div className="track-control">
      <div
        className="track-control-color"
        style={{ background: track.color }}
      />
      
      <div className="track-control-name">
        {track.name}
      </div>

      <div className="track-control-buttons">
        <button
          className={`track-btn track-btn-mute ${track.muted ? 'active' : ''}`}
          onClick={handleMuteClick}
          aria-label={`${track.muted ? 'Unmute' : 'Mute'} ${track.name}`}
          aria-pressed={track.muted}
        >
          M
        </button>
        
        <button
          className={`track-btn track-btn-solo ${track.soloed ? 'active' : ''}`}
          onClick={handleSoloClick}
          aria-label={`${track.soloed ? 'Unsolo' : 'Solo'} ${track.name}`}
          aria-pressed={track.soloed}
        >
          S
        </button>
      </div>

      <div className="track-control-volume">
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          aria-label={`${track.name} volume`}
          style={{ '--track-color': track.color } as React.CSSProperties}
        />
        <span className="volume-value">{Math.round(volume)}%</span>
      </div>
    </div>
  );
};

export const TrackControlsPanel: React.FC = () => {
  const { pattern } = useSequencer();

  if (!pattern) {
    return <div className="track-controls-empty">No pattern loaded</div>;
  }

  return (
    <div className="track-controls-panel">
      <h2 className="track-controls-title">Track Controls</h2>
      <div className="track-controls-list">
        {pattern.tracks.map((track) => (
          <TrackControl key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
};
