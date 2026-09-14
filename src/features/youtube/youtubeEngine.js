import { loadYouTubeIframeApi } from './loadYouTubeIframeApi'

/**
 * YouTubeEngine
 *
 * Wraps the official YouTube IFrame Player API behind the same small
 * surface as `AudioEngine` (play/pause/stop/seek/getCurrentTime/
 * getDuration/setVolume/dispose) so `usePlayerStore` can treat a YouTube
 * track and a local file mostly the same way.
 *
 * Important differences from AudioEngine, which is why this stays a
 * separate class rather than a mode on AudioEngine:
 *  - Playback is entirely YouTube's — there is no access to raw audio
 *    samples, so this engine cannot feed the visualizer or the vinyl-
 *    crackle layer. Callers should not call getAnalyser()-style methods
 *    on this engine (it doesn't have one).
 *  - YouTube's terms require the player element to remain visibly
 *    rendered at a reasonable size — it cannot be hidden or 0×0. The
 *    consuming component (YouTubePlayerMount) is responsible for that;
 *    this class only owns playback control, not layout.
 *  - The user can control playback directly from YouTube's own on-screen
 *    controls, so this engine reports state changes back via
 *    `handlers.onPlayingChange(boolean)` in addition to `onEnded`/
 *    `onError`, so the store can stay in sync either way.
 */
export class YouTubeEngine {
  constructor(handlers = {}) {
    this.handlers = handlers
    this.player = null
    this._readyPromise = null
    this._cuedPromise = null
    this._resolveCued = null
  }

  /**
   * Creates the YT.Player bound to `container` (a real DOM element).
   * Idempotent — calling it again with the same engine instance is a
   * no-op once a player already exists, since YT.Player takes ownership
   * of the container's contents on construction.
   */
  mount(container) {
    if (this._readyPromise) return this._readyPromise

    this._readyPromise = loadYouTubeIframeApi().then(
      (YT) =>
        new Promise((resolve) => {
          this.player = new YT.Player(container, {
            height: '100%',
            width: '100%',
            playerVars: { playsinline: 1, modestbranding: 1 },
            events: {
              onReady: () => resolve(this.player),
              onStateChange: (event) => this._handleStateChange(YT, event),
              onError: (event) =>
                this.handlers.onError?.(
                  new Error(`YouTube player error (code ${event.data})`),
                ),
            },
          })
        }),
    )

    return this._readyPromise
  }

  /**
   * Cues (loads without playing) a video by its YouTube video id and
   * resolves once its duration is known — mirrors AudioEngine.loadTrack's
   * "decode but don't play" contract.
   */
  async loadTrack(videoId) {
    if (!this._readyPromise) {
      throw new Error('YouTubeEngine.mount() must be called before loadTrack()')
    }
    await this._readyPromise

    this._cuedPromise = new Promise((resolve) => {
      this._resolveCued = resolve
    })
    this.player.cueVideoById(videoId)
    await this._cuedPromise

    return { duration: this.player.getDuration() }
  }

  play() {
    this.player?.playVideo()
  }

  pause() {
    this.player?.pauseVideo()
  }

  stop() {
    this.player?.stopVideo()
  }

  seek(seconds) {
    this.player?.seekTo(Math.max(seconds, 0), true)
  }

  getCurrentTime() {
    return this.player?.getCurrentTime?.() ?? 0
  }

  getDuration() {
    return this.player?.getDuration?.() ?? 0
  }

  setVolume(value) {
    this.player?.setVolume?.(Math.round(Math.min(Math.max(value, 0), 1) * 100))
  }

  dispose() {
    this.player?.destroy?.()
    this.player = null
    this._readyPromise = null
  }

  // --- internals -----------------------------------------------------

  _handleStateChange(YT, event) {
    const { CUED, ENDED, PLAYING, PAUSED } = YT.PlayerState

    if (event.data === CUED && this._resolveCued) {
      this._resolveCued()
      this._resolveCued = null
    }
    if (event.data === ENDED) {
      this.handlers.onEnded?.()
    }
    if (event.data === PLAYING) {
      this.handlers.onPlayingChange?.(true)
    }
    if (event.data === PAUSED) {
      this.handlers.onPlayingChange?.(false)
    }
  }
}
