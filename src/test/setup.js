import 'fake-indexeddb/auto'
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

// jsdom has no Web Audio API — provide a minimal, deterministic mock so
// components/hooks that reach into AudioEngine can be unit tested without
// a real audio backend. Individual test files can override methods with
// vi.spyOn() as needed.
class MockAudioParam {
  constructor(value = 1) {
    this.value = value
  }
  linearRampToValueAtTime = vi.fn()
  exponentialRampToValueAtTime = vi.fn()
  setValueAtTime = vi.fn()
  cancelScheduledValues = vi.fn()
}

class MockAnalyserNode {
  fftSize = 2048
  frequencyBinCount = 1024
  connect = vi.fn()
  disconnect = vi.fn()
  getByteFrequencyData = vi.fn((array) => array.fill(0))
  getByteTimeDomainData = vi.fn((array) => array.fill(128))
}

class MockGainNode {
  gain = new MockAudioParam(1)
  connect = vi.fn()
  disconnect = vi.fn()
}

class MockBiquadFilterNode {
  type = 'lowpass'
  frequency = new MockAudioParam(1000)
  Q = new MockAudioParam(1)
  gain = new MockAudioParam(0)
  connect = vi.fn()
  disconnect = vi.fn()
}

class MockOscillatorNode {
  type = 'sine'
  frequency = new MockAudioParam(440)
  connect = vi.fn()
  disconnect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}

class MockAudioBufferSourceNode {
  buffer = null
  loop = false
  playbackRate = new MockAudioParam(1)
  connect = vi.fn()
  disconnect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
  addEventListener = vi.fn()
}

class MockAudioContext {
  state = 'running'
  currentTime = 0
  sampleRate = 44100
  destination = {}
  createGain = vi.fn(() => new MockGainNode())
  createAnalyser = vi.fn(() => new MockAnalyserNode())
  createBiquadFilter = vi.fn(() => new MockBiquadFilterNode())
  createOscillator = vi.fn(() => new MockOscillatorNode())
  createBufferSource = vi.fn(() => new MockAudioBufferSourceNode())
  createBuffer = vi.fn((channels, length) => ({
    numberOfChannels: channels,
    length,
    getChannelData: vi.fn(() => new Float32Array(length)),
  }))
  decodeAudioData = vi.fn(
    () =>
      new Promise((resolve) =>
        resolve({ duration: 180, getChannelData: () => new Float32Array(1) }),
      ),
  )
  resume = vi.fn(() => Promise.resolve())
  suspend = vi.fn(() => Promise.resolve())
  close = vi.fn(() => Promise.resolve())
}

globalThis.AudioContext = MockAudioContext
globalThis.webkitAudioContext = MockAudioContext

if (!globalThis.matchMedia) {
  globalThis.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
  globalThis.URL.revokeObjectURL = vi.fn()
}
