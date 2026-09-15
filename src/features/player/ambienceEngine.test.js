import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { AmbienceEngine } from './ambienceEngine'

describe('AmbienceEngine', () => {
  let engine

  beforeEach(() => {
    engine = new AmbienceEngine()
  })

  afterEach(() => {
    engine?.dispose()
  })

  it('initializes with zero layer volumes', () => {
    expect(engine.layers.rain.volume).toBe(0)
    expect(engine.layers.fire.volume).toBe(0)
    expect(engine.layers.cafe.volume).toBe(0)
  })

  it('updates layer volume and connects nodes', () => {
    engine.setLayerVolume('rain', 0.6)
    expect(engine.layers.rain.volume).toBe(0.6)
    expect(engine.layers.rain.gainNode).toBeDefined()
  })

  it('clamps volume to [0, 1] range', () => {
    engine.setLayerVolume('fire', 1.5)
    expect(engine.layers.fire.volume).toBe(1)

    engine.setLayerVolume('fire', -0.5)
    expect(engine.layers.fire.volume).toBe(0)
  })

  it('synthesizes needle drop effect without throwing', () => {
    expect(() => engine.playNeedleDrop(0.5)).not.toThrow()
  })

  it('disposes all audio nodes cleanly', () => {
    engine.setLayerVolume('rain', 0.5)
    engine.dispose()
    expect(engine.masterGain).toBeNull()
  })
})
