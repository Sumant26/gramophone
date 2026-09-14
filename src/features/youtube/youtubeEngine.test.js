import { describe, it, expect, vi, beforeEach } from 'vitest'

const PlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
}

/** A minimal fake matching the bits of window.YT this engine touches. */
class FakePlayer {
  constructor(container, config) {
    this.container = container
    this.config = config
    this.duration = 0
    this.currentTime = 0
    this.cueVideoById = vi.fn((videoId) => {
      this.videoId = videoId
      this.duration = 180
    })
    this.playVideo = vi.fn()
    this.pauseVideo = vi.fn()
    this.stopVideo = vi.fn()
    this.seekTo = vi.fn((t) => {
      this.currentTime = t
    })
    this.getCurrentTime = vi.fn(() => this.currentTime)
    this.getDuration = vi.fn(() => this.duration)
    this.setVolume = vi.fn()
    this.destroy = vi.fn()
    // The real API calls onReady asynchronously; tests trigger it
    // explicitly via `player.config.events.onReady()`.
  }
}

vi.mock('./loadYouTubeIframeApi', () => ({
  loadYouTubeIframeApi: vi.fn(
    () => new Promise((resolve) => resolve({ Player: FakePlayer, PlayerState })),
  ),
}))

const { YouTubeEngine } = await import('./youtubeEngine')

async function mountAndReady(engine, container = {}) {
  const readyPromise = engine.mount(container)
  // Let the mocked loadYouTubeIframeApi's promise resolve and the
  // FakePlayer construct, then fire onReady as the real API would.
  await Promise.resolve()
  await Promise.resolve()
  engine.player.config.events.onReady()
  return readyPromise
}

describe('YouTubeEngine', () => {
  let engine

  beforeEach(() => {
    engine = new YouTubeEngine()
  })

  it('mount() is idempotent — a second call returns the same promise', () => {
    const p1 = engine.mount({})
    const p2 = engine.mount({})
    expect(p1).toBe(p2)
  })

  it('loadTrack cues the video and resolves once CUED fires, reporting duration', async () => {
    await mountAndReady(engine)
    const loadPromise = engine.loadTrack('abc123')
    // loadTrack awaits the already-resolved _readyPromise first, which
    // still defers its continuation by a microtask — let that flush
    // before the CUED event is "received", or cueVideoById won't have
    // run yet and there'll be nothing listening for it.
    await Promise.resolve()
    engine.player.config.events.onStateChange({ data: PlayerState.CUED })
    const result = await loadPromise
    expect(engine.player.cueVideoById).toHaveBeenCalledWith('abc123')
    expect(result).toEqual({ duration: 180 })
  })

  it('loadTrack throws if called before mount()', async () => {
    await expect(engine.loadTrack('abc123')).rejects.toThrow('mount()')
  })

  it('play/pause/stop/seek delegate to the underlying player', async () => {
    await mountAndReady(engine)
    engine.play()
    engine.pause()
    engine.stop()
    engine.seek(42)
    expect(engine.player.playVideo).toHaveBeenCalled()
    expect(engine.player.pauseVideo).toHaveBeenCalled()
    expect(engine.player.stopVideo).toHaveBeenCalled()
    expect(engine.player.seekTo).toHaveBeenCalledWith(42, true)
  })

  it("setVolume converts a 0-1 value to YouTube's 0-100 scale", async () => {
    await mountAndReady(engine)
    engine.setVolume(0.5)
    expect(engine.player.setVolume).toHaveBeenCalledWith(50)
  })

  it('fires onEnded when the player reports ENDED', async () => {
    const onEnded = vi.fn()
    engine = new YouTubeEngine({ onEnded })
    await mountAndReady(engine)
    engine.player.config.events.onStateChange({ data: PlayerState.ENDED })
    expect(onEnded).toHaveBeenCalledTimes(1)
  })

  it('fires onPlayingChange(true/false) on PLAYING/PAUSED so external YouTube-UI clicks stay in sync', async () => {
    const onPlayingChange = vi.fn()
    engine = new YouTubeEngine({ onPlayingChange })
    await mountAndReady(engine)
    engine.player.config.events.onStateChange({ data: PlayerState.PLAYING })
    engine.player.config.events.onStateChange({ data: PlayerState.PAUSED })
    expect(onPlayingChange).toHaveBeenNthCalledWith(1, true)
    expect(onPlayingChange).toHaveBeenNthCalledWith(2, false)
  })

  it('fires onError with a descriptive message on a player error', async () => {
    const onError = vi.fn()
    engine = new YouTubeEngine({ onError })
    await mountAndReady(engine)
    engine.player.config.events.onError({ data: 150 })
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0].message).toContain('150')
  })

  it('getCurrentTime/getDuration return 0 before the player exists', () => {
    expect(engine.getCurrentTime()).toBe(0)
    expect(engine.getDuration()).toBe(0)
  })

  it('dispose destroys the player and resets mount state', async () => {
    await mountAndReady(engine)
    const destroy = engine.player.destroy
    engine.dispose()
    expect(destroy).toHaveBeenCalled()
    expect(engine.player).toBeNull()
  })
})
