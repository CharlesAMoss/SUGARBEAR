/**
 * StepGrid - 16x16 grid for step sequencing
 * Displays tracks and steps with toggle functionality
 */

import React from 'react';
import { useSequencer } from '../../hooks/useSequencer';
import type { Track, TrackId } from '../../types/sequencer.types';
import { stepIndex } from '../../types/sequencer.types';
import './StepGrid.css';

export const StepGrid: React.FC = () => {
  const { pattern, toggleStep, currentStep, isPlaying } = useSequencer();

  if (!pattern) {
    return <div className="step-grid-empty">No pattern loaded</div>;
  }

  const handleStepClick = (trackId: TrackId, step: number) => {
    toggleStep(trackId, stepIndex(step));
  };

  return (
    <div className="step-grid">
      {pattern.tracks.map((track: Track) => (
        <div key={track.id} className="track-row">
          {/* Track label */}
          <div 
            className="track-label"
            style={{ borderLeftColor: track.color }}
          >
            <span className="track-name">{track.name}</span>
          </div>

          {/* Steps */}
          <div className="steps-container">
            {track.steps.map((step, index) => {
              const isActive = step.active;
              const isCurrent = isPlaying && index === currentStep;
              const isDownbeat = index % 4 === 0; // Highlight every 4th step
              const isMeasureStart = index === 0; // Highlight first step

              return (
                <button
                  key={index}
                  className={`
                    step
                    ${isActive ? 'step-active' : ''}
                    ${isCurrent ? 'step-current' : ''}
                    ${isDownbeat ? 'step-downbeat' : ''}
                    ${isMeasureStart ? 'step-measure-start' : ''}
                  `.trim()}
                  style={{
                    '--track-color': track.color,
                    '--step-velocity': step.velocity
                  } as React.CSSProperties}
                  onClick={() => handleStepClick(track.id, index)}
                  data-testid={`step-${track.id}-${index}`}
                  aria-label={`${track.name} step ${index + 1}`}
                  aria-pressed={isActive}
                >
                  <div className="step-inner" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Step numbers */}
      <div className="step-numbers">
        <div className="track-label-spacer" />
        <div className="steps-container">
          {Array.from({ length: pattern.length }, (_, i) => (
            <div
              key={i}
              className={`
                step-number
                ${i % 4 === 0 ? 'step-number-downbeat' : ''}
              `.trim()}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
