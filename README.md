# 🐻 SUGARBEAR - Web Audio Sequencer & Drum Machine

A professional-grade drum machine and step sequencer built with React, TypeScript, and the Web Audio API. Create, compose, and perform beat patterns with precision timing, smooth animations, and an elegant dark-themed interface.

![Phase 3 Complete](https://img.shields.io/badge/Phase%203-Complete-22c55e)
![Tests](https://img.shields.io/badge/tests-94%20passing-22c55e)
![Build](https://img.shields.io/badge/build-passing-22c55e)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

## 🎯 Project Overview

SUGARBEAR is a browser-based drum machine that allows users to:
- **Chart sequences** of up to 16 drum sounds on a 16-step grid
- **Compose loops** with precise timing control (60-200 BPM)
- **Perform live** with real-time playback and visual feedback
- **Mix tracks** with individual volume, mute, and solo controls

### ✨ Current Features (Phase 3 Complete)

- 🥁 **16-track step sequencer** with 16 steps per pattern
- ⏱️ **Precise timing** using Web Audio API scheduling (lookahead + double-buffering)
- 🎨 **Smooth animations** with 60fps playback indicator and step highlighting
- 🎛️ **Transport controls** - Play, Pause, Stop, and Tempo slider (60-200 BPM)
- 🔊 **Per-track controls** - Volume sliders, Mute (M), Solo (S) buttons
- 🌙 **Dark theme UI** with color-coded tracks and gradient accents
- 📱 **Responsive design** - Works on mobile, tablet, and desktop
- 📦 **Sample-based audio** - Supports custom .wav drum samples

## 🏗️ Technical Stack

- **React 19.1** - UI framework with Context API for state management
- **TypeScript 5.9** - Strict type-safe development
- **Web Audio API** - Low-latency audio scheduling (<10ms jitter)
- **Vite 7.1** - Fast build tooling with HMR (597ms build time)
- **Vitest** - Unit testing framework (94/94 tests passing)
- **CSS3** - Grid layouts, animations, and custom properties

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add drum samples (REQUIRED for sound)
# - Create /public/samples/ directory (already exists)
# - Add 16 .wav files (kick.wav, snare.wav, etc.)
# - See /public/samples/README.md for sample sources

# 3. Run development server
npm run dev

# 4. Open http://localhost:5173
# 5. Click "Start Sequencing" button
# 6. Click steps in grid to program beats
# 7. Click Play to hear your pattern!
```

### 🎵 Adding Drum Samples

The sequencer needs 16 drum sample files in `/public/samples/`:

**Required Files**:
- `kick.wav`, `snare.wav`, `clap.wav`
- `hat-closed.wav`, `hat-open.wav`, `rim.wav`
- `tom-hi.wav`, `tom-mid.wav`, `tom-lo.wav`
- `crash.wav`, `ride.wav`
- `perc-1.wav`, `perc-2.wav`, `perc-3.wav`, `perc-4.wav`, `perc-5.wav`

**Free Sample Sources**:
- [99Sounds](https://99sounds.org/) - Free sample packs
- [Splice](https://splice.com/sounds/samples) - Free + paid
- [Freesound](https://freesound.org/) - Creative Commons samples

See [/public/samples/README.md](./public/samples/README.md) for detailed instructions.

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture and technical design
- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) - Phased development roadmap
- [PHASE_3_COMPLETE.md](./PHASE_3_COMPLETE.md) - Phase 3 completion summary
- [/public/samples/README.md](./public/samples/README.md) - Drum sample guide

## 🗺️ Development Roadmap

The project follows a phased development approach:

- ✅ **Phase 0**: Foundation & TypeScript setup (COMPLETE)
- ✅ **Phase 1**: Web Audio API core engine (COMPLETE)
- ✅ **Phase 2**: Sequencer logic & state management (COMPLETE)
- ✅ **Phase 3**: UI components & visualization (COMPLETE)
- ⏳ **Phase 4**: Advanced features & polish (PLANNED)

### Current Status

**Phase 3 Complete** - Fully functional drum sequencer with UI!

- 94/94 tests passing ✅
- Build successful (216.88 KB) ✅
- 0 lint errors ✅
- 3 major UI components built ✅
- Dark theme styling complete ✅
- Responsive design implemented ✅

**Next**: Add drum samples to `/public/samples/` to hear sound!

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for detailed phase descriptions and [PHASE_3_COMPLETE.md](./PHASE_3_COMPLETE.md) for Phase 3 summary.

## 🎮 Usage

### Programming a Pattern

1. **Click steps** in the grid to toggle them on/off
2. **Adjust tempo** with the slider (60-200 BPM)
3. **Set volumes** for each track with the sliders
4. **Mute/Solo** tracks with M/S buttons
5. **Click Play** to start playback
6. **Watch** the current step pulse as it plays

### Understanding the Grid

- **Rows**: 16 drum tracks (Kick, Snare, Clap, Hats, Toms, Cymbals, Percussion)
- **Columns**: 16 steps in the pattern
- **Colors**: Each track has a unique color for easy identification
- **Active steps**: Filled with track color
- **Current step**: Pulses during playback
- **Downbeats**: Every 4th step is slightly highlighted

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

**Test Coverage**:
- 94 tests across 6 test suites
- AudioEngine, SampleManager, Scheduler tests
- Sequencer logic tests
- All tests passing ✅

## 🏗️ Building

```bash
# Development build with HMR
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**Build Output**:
- Bundle size: 216.88 KB (67.31 KB gzipped)
- Build time: ~600ms
- Output: `dist/` directory

## 🎨 Architecture Highlights

### Component Structure

```
App (SequencerProvider)
├── Welcome Screen
│   └── Start Button (initializes audio)
└── Sequencer Interface
    ├── Transport (play/pause/stop, tempo)
    ├── TrackControls Panel (16 tracks)
    │   └── TrackControl (mute, solo, volume)
    └── StepGrid (16×16 grid)
        └── TrackRow × 16
            └── Step × 16
```

### State Management

- **SequencerContext**: Global state with React Context API
- **useSequencer**: Hook for pattern/transport control
- **useAudioEngine**: Hook for audio initialization
- **RequestAnimationFrame**: 60fps UI updates during playback

### Audio Architecture

- **AudioEngine**: Web Audio API management, node graph
- **SampleManager**: Sample loading and caching
- **Scheduler**: Lookahead scheduling with double-buffering
- **Sequencer**: Pattern state and playback logic

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical documentation.

## 📦 Project Structure

```
sugarbear/
├── src/
│   ├── audio/           # Audio engine core (Phase 1)
│   │   ├── AudioEngine.ts
│   │   ├── SampleManager.ts
│   │   └── Scheduler.ts
│   ├── sequencer/       # Sequencer logic (Phase 2)
│   │   └── Sequencer.ts
│   ├── store/           # State management (Phase 2)
│   │   └── SequencerContext.tsx
│   ├── hooks/           # Custom React hooks (Phase 2)
│   │   ├── useSequencer.ts
│   │   └── useAudioEngine.ts
│   ├── components/      # UI components (Phase 3)
│   │   ├── StepGrid/
│   │   ├── Transport/
│   │   └── TrackControls/
│   ├── types/           # TypeScript types (Phase 0)
│   ├── constants/       # App configuration (Phase 0)
│   ├── utils/           # Helper functions (Phase 0)
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/
│   └── samples/         # Drum sample .wav files (ADD HERE)
│       └── README.md    # Sample sourcing guide
├── tests/               # Unit tests (94 tests)
└── docs/                # Documentation
    ├── ARCHITECTURE.md
    ├── DEVELOPMENT_PLAN.md
    └── PHASE_3_COMPLETE.md
```

## 🔮 Planned Features (Phase 4)

- **Pattern Save/Load** - LocalStorage and JSON export
- **Velocity Editing** - Per-step velocity control
- **Sample Management UI** - Loading progress, error handling
- **Pattern Chaining** - Song mode with multiple patterns
- **MIDI Support** - MIDI input and clock sync
- **Audio Effects** - Reverb, delay, filters per track
- **Preset Kits** - Switchable drum kit presets

## 🤝 Contributing

This is a learning project, but feedback and suggestions are welcome!

## 📄 License

MIT

---

**Built with 💜 and TypeScript**