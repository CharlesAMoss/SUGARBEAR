/**
 * AudioEngine Manual Test Page
 * Interactive testing of audio engine components
 */

import { useState, useEffect } from 'react';
import { AudioEngine, Scheduler } from './audio';
import { gainValue } from './types/audio.types';
import { bpm } from './types/transport.types';
import './AudioTest.css';

export function AudioTest() {
  const [engine, setEngine] = useState<AudioEngine | null>(null);
  const [scheduler, setScheduler] = useState<Scheduler | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const [tempo, setTempo] = useState(120);
  const [masterGain, setMasterGain] = useState(0.8);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Initialize audio engine
  const handleInit = async () => {
    try {
      const audioEngine = new AudioEngine();
      await audioEngine.init();
      await audioEngine.resume();
      
      const audioScheduler = new Scheduler(
        audioEngine.context!,
        bpm(tempo)
      );
      
      setEngine(audioEngine);
      setScheduler(audioScheduler);
      setIsInitialized(true);
      addLog('✅ Audio engine initialized');
      addLog(`Sample rate: ${audioEngine.sampleRate} Hz`);
    } catch (err) {
      addLog(`❌ Init failed: ${err}`);
    }
  };

  // Load test samples (you'll need to provide these)
  const handleLoadSamples = async () => {
    if (!engine) return;
    
    try {
      addLog('📥 Loading samples...');
      // Note: You'll need to provide sample files in public/samples/
      // For now, this will fail gracefully
      
      const samples = [
        { id: 'kick', url: '/samples/kick.wav' },
        { id: 'snare', url: '/samples/snare.wav' },
        { id: 'hat', url: '/samples/hat.wav' }
      ];
      
      for (const sample of samples) {
        try {
          await engine.loadSample(sample.id, sample.url);
          addLog(`✅ Loaded: ${sample.id}`);
        } catch {
          addLog(`⚠️ Failed to load ${sample.id}`);
        }
      }
    } catch (err) {
      addLog(`❌ Load failed: ${err}`);
    }
  };

  // Play a single sample
  const handlePlaySample = (sampleId: string) => {
    if (!engine) return;
    
    try {
      engine.playSampleNow(sampleId, gainValue(0.8));
      addLog(`🔊 Played: ${sampleId}`);
    } catch (error) {
      addLog(`❌ Play failed: ${error}`);
    }
  };

  // Start scheduler
  const handleStartScheduler = () => {
    if (!scheduler || !engine) return;
    
    scheduler.start((time, beat) => {
      const step = Math.floor((beat as number) * 4) % 16;
      
      // Update UI
      if (step !== currentBeat) {
        setCurrentBeat(step);
      }
      
      // Play kick on beats 0, 4, 8, 12
      if (step % 4 === 0 && engine.hasSample('kick')) {
        engine.playVoice({
          sampleId: 'kick',
          startTime: time,
          gain: gainValue(0.9)
        });
      }
      
      // Play snare on beats 4, 12
      if ((step === 4 || step === 12) && engine.hasSample('snare')) {
        engine.playVoice({
          sampleId: 'snare',
          startTime: time,
          gain: gainValue(0.8)
        });
      }
      
      // Play hi-hat on every step
      if (engine.hasSample('hat')) {
        engine.playVoice({
          sampleId: 'hat',
          startTime: time,
          gain: gainValue(0.6)
        });
      }
    });
    
    setIsPlaying(true);
    addLog('▶️ Scheduler started');
  };

  // Stop scheduler
  const handleStopScheduler = () => {
    if (!scheduler) return;
    
    scheduler.stop();
    setIsPlaying(false);
    setCurrentBeat(0);
    addLog('⏹️ Scheduler stopped');
  };

  // Update tempo
  const handleTempoChange = (newTempo: number) => {
    setTempo(newTempo);
    if (scheduler) {
      scheduler.setTempo(bpm(newTempo));
      addLog(`🎵 Tempo: ${newTempo} BPM`);
    }
  };

  // Update master gain
  const handleGainChange = (newGain: number) => {
    setMasterGain(newGain);
    if (engine) {
      engine.setMasterGain(gainValue(newGain));
      addLog(`🔊 Volume: ${Math.round(newGain * 100)}%`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      scheduler?.stop();
      engine?.close();
    };
  }, [engine, scheduler]);

  return (
    <div className="audio-test">
      <h1>🎵 Audio Engine Test</h1>
      
      <div className="test-section">
        <h2>1. Initialization</h2>
        <button onClick={handleInit} disabled={isInitialized}>
          {isInitialized ? '✅ Initialized' : 'Initialize Audio Engine'}
        </button>
        {isInitialized && (
          <button onClick={handleLoadSamples}>
            Load Test Samples
          </button>
        )}
      </div>

      {isInitialized && (
        <>
          <div className="test-section">
            <h2>2. Manual Sample Playback</h2>
            <div className="button-group">
              <button onClick={() => handlePlaySample('kick')}>
                Play Kick
              </button>
              <button onClick={() => handlePlaySample('snare')}>
                Play Snare
              </button>
              <button onClick={() => handlePlaySample('hat')}>
                Play Hat
              </button>
            </div>
          </div>

          <div className="test-section">
            <h2>3. Scheduler Test</h2>
            <div className="controls">
              <button 
                onClick={handleStartScheduler} 
                disabled={isPlaying}
              >
                ▶️ Start
              </button>
              <button 
                onClick={handleStopScheduler} 
                disabled={!isPlaying}
              >
                ⏹️ Stop
              </button>
            </div>
            
            {isPlaying && (
              <div className="step-indicator">
                {Array.from({ length: 16 }, (_, i) => (
                  <div 
                    key={i}
                    className={`step ${i === currentBeat ? 'active' : ''}`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="test-section">
            <h2>4. Controls</h2>
            <div className="slider-group">
              <label>
                Tempo: {tempo} BPM
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={tempo}
                  onChange={(e) => handleTempoChange(Number(e.target.value))}
                />
              </label>
              
              <label>
                Master Volume: {Math.round(masterGain * 100)}%
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterGain}
                  onChange={(e) => handleGainChange(Number(e.target.value))}
                />
              </label>
            </div>
          </div>
        </>
      )}

      <div className="test-section log-section">
        <h2>Console</h2>
        <div className="log">
          {log.map((entry, i) => (
            <div key={i} className="log-entry">{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
