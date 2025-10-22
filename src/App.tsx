import { useState } from 'react'
import sugarbear from './assets/sugarbear.png'
import { AudioTest } from './AudioTest'
import './App.css'

function App() {
  const [showTest, setShowTest] = useState(false)

  return (
    <>
      {!showTest ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <img src={sugarbear} alt="Sugarbear logo" style={{ width: '37%', height: 'auto' }} />
          <h1>SUGARBEAR</h1>
          <p style={{ color: '#cbd5e1', marginBottom: '2rem' }}>
            Web Audio Sequencer & Drum Machine
          </p>
          <button 
            onClick={() => setShowTest(true)}
            style={{
              background: '#6366f1',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🎵 Test Audio Engine (Phase 1)
          </button>
        </div>
      ) : (
        <AudioTest />
      )}
    </>
  )
}

export default App
