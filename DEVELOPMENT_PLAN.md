# SUGARBEAR Development Plan

## Development Phases

This document outlines the phased development approach for SUGARBEAR. Each phase builds upon the previous, with clear testing criteria and exit conditions.

## 🎯 Project Requirements (MVP Scope)

### Core Features
- **Grid**: 16 tracks × 16 steps (1 bar in 4/4 time)
- **Tempo**: 60-200 BPM range
- **Genre Focus**: Breakbeat/Hip-hop patterns
- **UI Theme**: Dark mode, clean minimal interface
- **Responsive**: Seamless across all devices

### Feature Prioritization
1. ✅ Volume/velocity per step (Phase 2-3)
2. ✅ Mute/solo per track (Phase 2-3)
3. 🔮 MIDI support (Phase 4 / Future)
4. 🔮 Export/save patterns - localStorage + JSON (Phase 4)
5. 🔮 Effect processing (Phase 4 / Future)

### Future Features (Post-MVP)
- Polyrhythmic composition support (variable step lengths per track)
- Pattern chaining (song mode)
- Custom sample upload
- Preset drum kit switching
- Synthesis capabilities
- Dynamic track add/remove
- Swing/groove timing enhancements

---

## 📋 Phase 0: Foundation & Setup
**Goal**: Establish project structure, TypeScript architecture, and testing framework

### Tasks
- [x] Project initialization with Vite + React + TypeScript
- [ ] Install testing dependencies (Vitest, Testing Library)
- [ ] Create directory structure (`/audio`, `/sequencer`, `/store`, `/components`)
- [ ] Define core TypeScript types and interfaces
- [ ] Setup ESLint with strict TypeScript rules
- [ ] Create base type definitions

### Deliverables
- `/src/types/` - Core type definitions
  - `audio.types.ts` - Web Audio API types
  - `sequencer.types.ts` - Pattern, Track, Step types (16×16 grid)
  - `transport.types.ts` - Playback state types
  - `ui.types.ts` - Component prop types
- Testing configuration (Vitest + React Testing Library)
- Directory structure (`/audio`, `/sequencer`, `/store`, `/components`, `/hooks`, `/utils`)
- Type-safe project foundation with strict TypeScript

### MVP Configuration
- **Grid Size**: 16 tracks × 16 steps
- **Default Tracks**: Kick, Snare, Closed HH, Open HH, Clap, Rim, Tom Hi, Tom Mid, Tom Lo, Crash, Ride, Perc 1-5
- **Tempo**: 60-200 BPM (default 120)
- **Time Signature**: 4/4
- **UI**: Dark theme, minimal design

### Exit Criteria
- ✅ All TypeScript types compile without errors
- ✅ Testing framework runs successfully
- ✅ Project structure matches architecture document
- ✅ No linting errors with strict rules

### Testing
```bash
npm run test        # Unit tests pass
npm run lint        # No errors
npm run build       # Successful build
```

---

## 🎵 Phase 1: Audio Engine Core
**Goal**: Build Web Audio API wrapper with sample playback and scheduling

### Tasks
- [ ] Implement `AudioEngine` class
  - Initialize AudioContext
  - Create master gain node
  - Handle audio context suspension/resume
- [ ] Implement `SampleManager` class
  - Load audio samples from URLs
  - Decode audio data
  - Cache and retrieve samples by ID
- [ ] Implement `Scheduler` class
  - Lookahead scheduling algorithm
  - Schedule callbacks with precise timing
  - Handle tempo changes
- [ ] Create sample playback system
  - Trigger samples at scheduled times
  - Per-sample gain control
  - Clean up finished source nodes

### Deliverables
- `/src/audio/AudioEngine.ts`
- `/src/audio/SampleManager.ts`
- `/src/audio/Scheduler.ts`
- `/src/audio/Voice.ts`
- Unit tests for each module

### Exit Criteria
- ✅ Can initialize AudioContext successfully
- ✅ Can load and decode audio samples
- ✅ Can play single sample on demand
- ✅ Scheduler maintains precise timing (tested with logging)
- ✅ All audio tests pass
- ✅ No audio glitches or clicks

### Testing
```typescript
// Test: Load and play sample
const engine = new AudioEngine();
await engine.init();
const sampleId = await engine.loadSample('kick', '/samples/kick.wav');
engine.playSample(sampleId); // Should hear kick drum

// Test: Scheduling precision
const times: number[] = [];
scheduler.schedule(120, () => times.push(audioContext.currentTime));
// Verify times are evenly spaced
```

---

## 🎛️ Phase 2: Sequencer Logic
**Goal**: Implement pattern management, track logic, and transport control

### Tasks
- [ ] Implement `Pattern` class
  - Create/update patterns
  - Add/remove tracks
  - Immutable update methods
- [ ] Implement `Track` class
  - Step array management
  - Track properties (name, volume, mute, solo)
  - Velocity per step
- [ ] Implement `Sequencer` class
  - Pattern playback logic
  - Transport state machine (stop, play, pause)
  - Tempo control (BPM)
  - Current step tracking
- [ ] Implement `Transport` class
  - State transitions
  - Playback position calculation
  - Loop handling

### Deliverables
- `/src/sequencer/Pattern.ts`
- `/src/sequencer/Track.ts`
- `/src/sequencer/Sequencer.ts`
- `/src/sequencer/Transport.ts`
- Unit tests for pattern manipulation
- Integration tests with audio engine

### Exit Criteria
- ✅ Can create patterns with multiple tracks
- ✅ Can toggle steps on/off
- ✅ Transport state transitions work correctly
- ✅ Sequencer triggers correct samples at correct times
- ✅ Tempo changes apply correctly
- ✅ Mute/solo logic works
- ✅ All sequencer tests pass

### Testing
```typescript
// Test: Pattern playback
const pattern = new Pattern({
  tracks: [
    { id: 'kick', steps: [1,0,0,0, 1,0,0,0], sampleId: 'kick' },
    { id: 'snare', steps: [0,0,1,0, 0,0,1,0], sampleId: 'snare' }
  ],
  length: 8
});

sequencer.setPattern(pattern);
sequencer.play();
// Verify: Kick plays on steps 0 and 4, snare on steps 2 and 6
```

---

## 🎨 Phase 3: UI Components & Visualization
**Goal**: Build React components with smooth animations and user feedback

### Tasks
- [ ] Implement state management
  - Context provider for sequencer
  - Custom hooks (`useSequencer`, `useAudioEngine`)
  - Action reducers
- [ ] Build `StepGrid` component
  - Render track rows and step columns
  - Handle step toggle clicks
  - Visual feedback for active steps
- [ ] Build `Transport` component
  - Play/pause/stop buttons
  - Tempo slider
  - Current position display
- [ ] Build `TrackControls` component
  - Track name/label
  - Volume slider
  - Mute/solo buttons
- [ ] Build `StepIndicator` component
  - Animated playback position
  - Smooth 60fps animation using RAF
  - Highlight current step
- [ ] Implement CSS animations
  - Button press feedback
  - Step activation glow
  - Playback indicator movement

### Deliverables
- `/src/store/SequencerContext.tsx`
- `/src/hooks/useSequencer.ts`
- `/src/components/StepGrid/`
- `/src/components/Transport/`
- `/src/components/TrackControls/`
- `/src/components/StepIndicator/`
- Component tests

### Exit Criteria
- ✅ Grid renders correctly for any pattern size
- ✅ Clicking steps updates pattern immediately
- ✅ Transport controls work (play/pause/stop)
- ✅ Tempo slider updates BPM smoothly
- ✅ Playback indicator animates smoothly at 60fps
- ✅ All UI components are responsive
- ✅ Animations are smooth and elegant
- ✅ Component tests pass

### Testing
```typescript
// Test: Step toggle
render(<StepGrid pattern={pattern} />);
const step = screen.getByTestId('step-kick-0');
fireEvent.click(step);
expect(pattern.tracks[0].steps[0]).toBe(1);

// Test: Transport play
fireEvent.click(screen.getByText('Play'));
expect(sequencer.isPlaying()).toBe(true);
```

---

## 🚀 Phase 4: Advanced Features & Polish
**Goal**: Add enhanced features, export options, and final polish

### Tasks
- [ ] Pattern save/load
  - LocalStorage persistence
  - JSON export/import
- [ ] Additional output options
  - Audio recording/export (WAV)
  - MIDI export
  - Share pattern URL
- [ ] Sample management UI
  - Load custom samples
  - Sample library browser
  - Preset drum kits
- [ ] Advanced sequencer features
  - Per-step velocity control
  - Swing/groove timing
  - Pattern chaining
- [ ] Effects processing (optional)
  - Reverb, delay
  - Filter per track
- [ ] Performance optimizations
  - Code splitting
  - Lazy loading
  - Bundle size optimization
- [ ] Accessibility
  - Keyboard controls
  - Screen reader support
  - ARIA labels
- [ ] Documentation
  - User guide
  - API documentation
  - Tutorial/walkthrough

### Deliverables
- Feature-complete application
- Export functionality
- Sample management system
- Polished UI/UX
- Complete documentation

### Exit Criteria
- ✅ Can save and load patterns
- ✅ Can export patterns as JSON
- ✅ Can load custom samples
- ✅ Advanced features work correctly
- ✅ Application is performant (60fps UI, no audio glitches)
- ✅ Accessible via keyboard
- ✅ User documentation complete
- ✅ All tests pass (unit, integration, E2E)

### Testing
- Full E2E test suite
- Performance benchmarks
- Cross-browser testing
- Accessibility audit

---

## 📊 Progress Tracking

| Phase | Status | Started | Completed | Tests |
|-------|--------|---------|-----------|-------|
| Phase 0: Foundation | ✅ Complete | Oct 22, 2025 | Oct 22, 2025 | 25/25 ✅ |
| Phase 1: Audio Engine | ✅ Complete | Oct 22, 2025 | Oct 22, 2025 | 69/69 ✅ |
| Phase 2: Sequencer Logic | ✅ Complete | Oct 22, 2025 | Oct 22, 2025 | 94/94 ✅ |
| Phase 3: UI Components | ⏳ Not Started | - | - | - |
| Phase 4: Advanced Features | ⏳ Not Started | - | - | - |

---

## 🧪 Testing Strategy Per Phase

### Phase 0
- TypeScript compilation checks
- Linting validation

### Phase 1
- Unit tests for audio utilities
- Manual audio playback verification
- Timing precision tests

### Phase 2
- Unit tests for pattern logic
- Integration tests (sequencer + audio)
- State transition tests

### Phase 3
- Component unit tests
- User interaction tests
- Visual regression tests (optional)
- Animation performance tests

### Phase 4
- E2E test scenarios
- Performance profiling
- Cross-browser compatibility
- Accessibility testing

---

## 🎯 Success Metrics

- **Performance**: Maintain 60fps UI during playback
- **Timing**: Audio scheduling accurate within ±1ms
- **Reliability**: Zero audio glitches during normal operation
- **Code Quality**: 100% TypeScript strict mode, 0 linting errors
- **Test Coverage**: >80% coverage for core modules
- **User Experience**: Smooth, responsive, elegant interface

---

## 📝 Notes

- Each phase should be completed and tested before moving to the next
- Phase exit criteria must be met before phase sign-off
- Testing is integral to each phase, not a separate phase
- User feedback can trigger iteration within phases
- Architecture can evolve based on learnings, with documentation updates
