# SUGARBEAR Architecture

## System Architecture Overview

SUGARBEAR follows a layered architecture pattern separating concerns between audio processing, application logic, and UI presentation.

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React)                     │
│  - Transport Controls  - Step Grid  - Track Controls   │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│              Application Layer (TypeScript)             │
│  - Sequencer Logic  - Pattern Manager  - State Mgmt    │
└────────────────┬────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────┐
│              Audio Engine (Web Audio API)               │
│  - AudioContext  - Scheduling  - Sample Playback        │
└─────────────────────────────────────────────────────────┘
```

## Core Modules

### 1. Audio Engine (`src/audio/`)

**Purpose**: Low-level Web Audio API interface for scheduling and playback

**Key Components**:
- `AudioEngine.ts` - Manages AudioContext, master gain, and audio graph
- `SampleManager.ts` - Loads, stores, and retrieves audio samples
- `Scheduler.ts` - Precision timing using lookahead scheduling pattern
- `Voice.ts` - Individual sound playback with gain/effects per instance

**TypeScript Strengths Used**:
- Strict type definitions for Web Audio API nodes
- Branded types for time values (seconds vs. beats)
- Generic types for sample loading promises
- Discriminated unions for scheduling events

### 2. Sequencer Logic (`src/sequencer/`)

**Purpose**: Musical timing, pattern management, and sequencing logic

**Key Components**:
- `Sequencer.ts` - Main sequencer controller (transport, tempo, playback)
- `Pattern.ts` - Immutable pattern data structure
- `Track.ts` - Individual track with steps and properties
- `Transport.ts` - Playback state machine (stopped, playing, paused)

**TypeScript Strengths Used**:
- Immutable data patterns with `Readonly<>` and `ReadonlyArray<>`
- State machines with discriminated unions
- Builder pattern for complex object creation
- Type guards for runtime safety

### 3. State Management (`src/store/`)

**Purpose**: Application state management with React integration

**Key Components**:
- `SequencerContext.tsx` - React Context for sequencer state
- `useSequencer.ts` - Custom hook for sequencer operations
- `useAudioEngine.ts` - Hook for audio engine lifecycle
- `reducers/` - State update logic (patterns, tracks, transport)

**TypeScript Strengths Used**:
- Generic hooks with type inference
- Discriminated unions for action types
- Readonly state objects
- Type-safe context providers

### 4. UI Components (`src/components/`)

**Purpose**: React components with smooth animations and user feedback

**Key Components**:
- `StepGrid/` - Main sequencer grid with step buttons
- `Transport/` - Play/pause/stop controls and tempo slider
- `TrackControls/` - Volume, mute, solo, and track settings
- `StepIndicator/` - Animated playback position indicator
- `Visualizer/` - Optional audio visualization

**TypeScript Strengths Used**:
- Strictly typed props with React.FC or explicit interfaces
- Discriminated unions for component variants
- Type-safe event handlers
- Generic components for reusability

## Data Flow

### Playback Flow
```
User clicks Play
    ↓
Transport updates state (PLAYING)
    ↓
Sequencer starts scheduler loop
    ↓
Scheduler looks ahead and queues notes
    ↓
Audio Engine triggers samples at precise times
    ↓
UI updates step indicator (requestAnimationFrame)
```

### Pattern Editing Flow
```
User clicks step in grid
    ↓
UI dispatches action with (trackId, stepIndex)
    ↓
Reducer updates pattern (immutable update)
    ↓
State change triggers re-render
    ↓
Grid reflects new pattern state
```

## Web Audio API Strategy

### Scheduling Pattern
We use the **lookahead scheduling** pattern (recommended by Web Audio API docs):

1. **Lookahead**: Check 100ms ahead of current time
2. **Schedule**: Queue events in the near future (25ms window)
3. **Loop**: Use setInterval at 25ms intervals
4. **Precision**: Web Audio API handles exact timing

This prevents audio glitches from main thread blocking while maintaining precise timing.

### Audio Graph
```
Sample Buffers
    ↓
BufferSourceNode (one per note)
    ↓
GainNode (per track)
    ↓
GainNode (master)
    ↓
AudioContext.destination
```

## TypeScript Design Patterns

### 1. Branded Types
```typescript
type Seconds = number & { __brand: 'Seconds' };
type BeatTime = number & { __brand: 'BeatTime' };
```
Prevents mixing audio time with musical time.

### 2. Builder Pattern
```typescript
class PatternBuilder {
  addTrack(track: Track): this { /* ... */ }
  setTempo(bpm: number): this { /* ... */ }
  build(): Pattern { /* ... */ }
}
```
Fluent API for complex object creation.

### 3. State Machines
```typescript
type TransportState = 
  | { status: 'stopped' }
  | { status: 'playing', startTime: number }
  | { status: 'paused', pauseTime: number };
```
Type-safe state transitions.

### 4. Immutable Updates
```typescript
const updateStep = (pattern: Pattern, trackId: string, stepIdx: number): Pattern => ({
  ...pattern,
  tracks: pattern.tracks.map(track => 
    track.id === trackId 
      ? { ...track, steps: toggleStep(track.steps, stepIdx) }
      : track
  )
});
```
Functional updates prevent mutations.

## Performance Considerations

1. **Audio Thread**: All timing-critical code runs on Web Audio API's dedicated thread
2. **UI Thread**: React updates use batching and concurrent features
3. **Memoization**: Use `React.memo`, `useMemo`, `useCallback` for expensive operations
4. **Animation**: `requestAnimationFrame` for smooth 60fps playback indicator
5. **Sample Loading**: Lazy loading and caching strategies

## Testing Strategy

- **Unit Tests**: Pure functions (pattern manipulation, time calculations)
- **Integration Tests**: Sequencer + Audio Engine interaction
- **Component Tests**: React components with user interactions
- **E2E Tests**: Full playback scenarios

## Browser Compatibility

- Modern browsers with Web Audio API support
- Chrome/Edge 89+, Firefox 88+, Safari 14.1+
- No IE11 support (uses modern JavaScript/TypeScript features)

## Future Extensibility

- Plugin architecture for effects
- MIDI input/output support
- Pattern import/export formats
- Cloud storage integration
- Collaborative editing
