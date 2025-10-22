import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Web Audio API for tests (not available in jsdom)
class AudioContextMock {
  currentTime = 0;
  destination = {};
  state = 'running';
  sampleRate = 44100;
  
  createGain() {
    return {
      gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
      connect: () => {},
      disconnect: () => {}
    };
  }
  
  createBufferSource() {
    return {
      buffer: null,
      playbackRate: { value: 1 },
      connect: () => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
      addEventListener: () => {}
    };
  }
  
  decodeAudioData() {
    return Promise.resolve({
      duration: 1.0,
      length: 44100,
      numberOfChannels: 2,
      sampleRate: 44100
    });
  }
  
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  
  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }
  
  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
  
  addEventListener() {
    // Mock event listener
  }
  
  removeEventListener() {
    // Mock event listener removal
  }
}

// @ts-expect-error - Mocking global AudioContext
global.AudioContext = AudioContextMock;
// @ts-expect-error - Mocking global AudioContext
global.webkitAudioContext = AudioContextMock;
