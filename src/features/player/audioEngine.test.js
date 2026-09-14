import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AudioEngine } from './audioEngine'

function makeFakeFile(bytes = new Uint8Array([1, 2, 3]).buffer) {
  return {
    arrayBuffer: vi.fn().mockResolvedValue(bytes),
  }
}

describe('AudioEngine', () => {
  let engine

  beforeEach(() => {
    engine = new AudioEngine()
  })

  it('lazily creates the AudioContext only on first use', () => {
    expect(engine.context).toBeNull()
    engine.ensureContext()
    expect(engine.context).not.toBeNull()
  })

  it('decodes a track and reports its duration', async () => {
    const { duration } = await engine.loadTrack(makeFakeFile())
    expect(duration).toBe(180) // mocked decodeAudioData duration
    expect(engine.getDuration()).toBe(180)
  })

  it('starts playback from 0 by default and marks isPlaying', async () => {
    await engine.loadTrack(makeFakeFile())
    engine.play()
    expect(engine.isPlaying).toBe(true)
    expect(engine.source).not.toBeNull()
  })

  it('pause captures the current offset and stops the source', async () => {
    await engine.loadTrack(makeFakeFile())
    engine.play()
    engine.context.currentTime = 42
    engine.pause()
    expect(engine.isPlaying).toBe(false)
    expect(engine.pausedAtOffset).toBe(42)
    expect(engine.source).toBeNull()
  })

  it('resumes from the paused offset', async () => {
    await engine.loadTrack(makeFakeFile())
    engine.play()
    engine.context.currentTime = 10
    engine.pause()
    engine.context.currentTime = 10 // resume happens "immediately" after pause
    engine.play()
    expect(engine.getCurrentTime()).toBe(10)
    engine.context.currentTime = 15
    expect(engine.getCurrentTime()).toBe(15)
  })

  it('stop resets position to zero', async () => {
    await engine.loadTrack(makeFakeFile())
    engine.play()
    engine.context.currentTime = 30
    engine.stop()
    expect(engine.isPlaying).toBe(false)
    expect(engine.pausedAtOffset).toBe(0)
    expect(engine.getCurrentTime()).toBe(0)
  })

  it('seek clamps to [0, duration] and preserves playing state', async () => {
    await engine.loadTrack(makeFakeFile())
    engine.play()
    engine.seek(-5)
    expect(engine.pausedAtOffset).toBe(0)
    engine.seek(9999)
    expect(engine.pausedAtOffset).toBe(180)
    expect(engine.isPlaying).toBe(true)
  })

  it('seek while paused does not resume playback', async () => {
    await engine.loadTrack(makeFakeFile())
    engine.seek(20)
    expect(engine.isPlaying).toBe(false)
    expect(engine.pausedAtOffset).toBe(20)
  })

  it('clamps volume to [0, 1]', () => {
    engine.ensureContext()
    engine.setVolume(2)
    expect(engine.volume).toBe(1)
    engine.setVolume(-1)
    expect(engine.volume).toBe(0)
  })

  it('fires onEnded when the underlying source ends during playback', async () => {
    const onEnded = vi.fn()
    engine = new AudioEngine({ onEnded })
    await engine.loadTrack(makeFakeFile())
    engine.play()
    const source = engine.source
    // Simulate the browser firing 'ended' naturally.
    engine._handleEnded()
    expect(onEnded).toHaveBeenCalledTimes(1)
    expect(engine.isPlaying).toBe(false)
    void source
  })

  it('does not fire onEnded when we stop the source ourselves (e.g. via pause)', async () => {
    const onEnded = vi.fn()
    engine = new AudioEngine({ onEnded })
    await engine.loadTrack(makeFakeFile())
    engine.play()
    engine.pause()
    expect(onEnded).not.toHaveBeenCalled()
  })

  it('reports a decode error through onError and rethrows', async () => {
    const onError = vi.fn()
    engine = new AudioEngine({ onError })
    engine.ensureContext()
    engine.context.decodeAudioData = vi.fn().mockRejectedValue(new Error('bad file'))
    await expect(engine.loadTrack(makeFakeFile())).rejects.toThrow('bad file')
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('enabling crackle ambience while playing starts a looping noise source', async () => {
    await engine.loadTrack(makeFakeFile())
    engine.play()
    engine.setCrackleEnabled(true)
    expect(engine.crackleSource).not.toBeNull()
    expect(engine.crackleSource.loop).toBe(true)
  })

  it('disabling crackle ambience stops the noise source', async () => {
    await engine.loadTrack(makeFakeFile())
    engine.play()
    engine.setCrackleEnabled(true)
    engine.setCrackleEnabled(false)
    expect(engine.crackleSource).toBeNull()
  })
})
