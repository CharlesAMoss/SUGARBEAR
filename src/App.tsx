import { useState } from 'react'
import { SequencerProvider } from './store/SequencerContext'
import { useAudioEngine } from './hooks/useAudioEngine'
import { useSequencer } from './hooks/useSequencer'
import { Transport } from './components/Transport'
import { StepGrid } from './components/StepGrid'
import { TrackControlsPanel } from './components/TrackControls'
import { createPattern, createTrack } from './types/sequencer.types'
import { DEFAULT_DRUM_KIT } from './constants'
import sugarbear from './assets/sugarbear.png'
import './App.css'

// Main sequencer interface
function SequencerApp() {
  const { init, isInitialized, isRunning } = useAudioEngine();
  const { setPattern, pattern } = useSequencer();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Initialize audio engine
      await init();
      
      // Create default pattern with all 16 tracks
      const tracks = DEFAULT_DRUM_KIT.map(drum => 
        createTrack({
          id: drum.id,
          name: drum.name,
          sampleId: drum.id,
          color: drum.color
        })
      );

      const defaultPattern = createPattern({
        name: 'New Pattern',
        tracks
      });

      setPattern(defaultPattern);
      
      // Load samples (they'll load in background)
      // Note: Samples will show as "not loaded" until actual .wav files are in /public/samples/
      console.log('Pattern created with', tracks.length, 'tracks');
      console.log('Ready to sequence! (Note: Add .wav files to /public/samples/ to hear sounds)');
      
    } catch (err) {
      console.error('Failed to initialize:', err);
      setError('Failed to initialize audio engine. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="welcome-screen">
        <img src={sugarbear} alt="Sugarbear" className="logo" />
        <h1>SUGARBEAR</h1>
        <p className="tagline">16-Track Drum Sequencer & Beat Machine</p>
        
        <button 
          onClick={handleStart}
          disabled={isLoading}
          className="start-button"
        >
          {isLoading ? '⏳ Initializing...' : '🎵 Start Sequencing'}
        </button>

        {error && <p className="error-message">{error}</p>}
        
        <div className="welcome-features">
          <div className="feature">✨ 16x16 Step Grid</div>
          <div className="feature">🎛️ Per-Track Controls</div>
          <div className="feature">🎵 60-200 BPM Range</div>
          <div className="feature">🎨 Dark Mode UI</div>
        </div>
      </div>
    );
  }

  return (
    <div className="sequencer-app">
      <header className="app-header">
        <h1 className="app-title">SUGARBEAR</h1>
        <div className="app-status">
          <span className={`status-indicator ${isRunning ? 'active' : ''}`} />
          <span className="status-text">{isRunning ? 'Ready' : 'Suspended'}</span>
        </div>
      </header>

      <main className="app-main">
        <Transport />
        <TrackControlsPanel />
        <StepGrid />
      </main>

      <footer className="app-footer">
        <p>
          Pattern: {pattern?.name || 'No pattern'} | 
          Tracks: {pattern?.tracks.length || 0} | 
          Steps: {pattern?.length || 0}
        </p>
        <p className="sample-note">
          💡 Add .wav files to <code>/public/samples/</code> to hear sounds
        </p>
      </footer>
    </div>
  );
}

// App wrapper with provider
function App() {
  return (
    <SequencerProvider>
      <SequencerApp />
    </SequencerProvider>
  )
}

export default App
