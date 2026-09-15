/**
 * AudioEngine
 *
 * A framework-agnostic wrapper around the Web Audio API. This is the single
 * place that talks to AudioContext — React components and the Zustand store
 * never touch AudioContext directly. Keeping this isolated is what makes it
 * possible to unit test playback logic (via the mock AudioContext in
 * src/test/setup.js) and to keep audio bugs from leaking into the UI layer.
 *
 * Playback model: AudioBufferSourceNode can only be started once, so "pause"
 * is implemented by stopping the source and remembering how far into the
 * buffer we were, then creating a fresh source node on resume. Position is
 * always derived from AudioContext.currentTime rather than a setInterval,
 * so it can't drift out of sync with what's actually audible.
 */

const CROSSFADE_SECONDS = 0.05

export class AudioEngine {
  /** @param {{ onEnded?: () => void, onError?: (err: Error) => void }} [handlers] */
  constructor(handlers = {}) {
    this.handlers = handlers
    /** @type {AudioContext | null} */
    this.context = null
    this.masterGain = null
    this.trackGain = null
    this.crackleGain = null
    this.analyser = null

    /** @type {AudioBuffer | null} */
    this.buffer = null
    /** @type {AudioBufferSourceNode | null} */
    this.source = null
    /** @type {AudioBufferSourceNode | null} */
    this.crackleSource = null

    this.isPlaying = false
    this.startedAtContextTime = 0
    this.pausedAtOffset = 0
    this.volume = 1
    this.crackleEnabled = false
    this.playbackRate = 1.0
    this.tubeWarmthEnabled = false

    this.warmthFilter = null
    this.bassWarmthFilter = null
  }

  /** Lazily create the AudioContext. Must be called from a user-gesture handler on first use (browser autoplay policy). */
  ensureContext() {
    if (this.context) return this.context

    const Ctx = window.AudioContext || window.webkitAudioContext
    this.context = new Ctx()

    this.masterGain = this.context.createGain()
    this.trackGain = this.context.createGain()
    this.crackleGain = this.context.createGain()
    this.crackleGain.gain.value = 0
    this.analyser = this.context.createAnalyser()
    this.analyser.fftSize = 2048

    // Vintage Tube warmth filters (biquad lowpass warmth + subtle low-shelf boost)
    this.warmthFilter = this.context.createBiquadFilter()
    this.warmthFilter.type = 'lowpass'
    this.warmthFilter.frequency.value = this.tubeWarmthEnabled ? 4800 : 20000
    this.warmthFilter.Q.value = 0.8

    this.bassWarmthFilter = this.context.createBiquadFilter()
    this.bassWarmthFilter.type = 'lowshelf'
    this.bassWarmthFilter.frequency.value = 140
    this.bassWarmthFilter.gain.value = this.tubeWarmthEnabled ? 3.5 : 0

    this.trackGain.connect(this.warmthFilter)
    this.warmthFilter.connect(this.bassWarmthFilter)
    this.bassWarmthFilter.connect(this.analyser)
    this.analyser.connect(this.masterGain)
    this.crackleGain.connect(this.masterGain)
    this.masterGain.connect(this.context.destination)
    this.masterGain.gain.value = this.volume

    return this.context
  }

  /**
   * Decode a File/Blob into an AudioBuffer and prepare it for playback.
   * Does not start playback.
   */
  async loadTrack(fileOrBlob) {
    const ctx = this.ensureContext()
    this._stopSourceNode()
    this.buffer = null
    this.pausedAtOffset = 0

    try {
      const arrayBuffer = await fileOrBlob.arrayBuffer()
      // decodeAudioData detaches/consumes the buffer in some browsers, so
      // this must be a fresh ArrayBuffer per call (fileOrBlob.arrayBuffer()
      // already returns a new one each time it's called).
      this.buffer = await ctx.decodeAudioData(arrayBuffer)
      return { duration: this.buffer.duration }
    } catch (err) {
      this.handlers.onError?.(
        err instanceof Error ? err : new Error('Failed to decode audio'),
      )
      throw err
    }
  }

  play(fromOffset = this.pausedAtOffset) {
    if (!this.buffer) return
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') ctx.resume()

    this._stopSourceNode()

    const source = ctx.createBufferSource()
    source.buffer = this.buffer
    source.playbackRate.value = this.playbackRate
    source.connect(this.trackGain)
    source.addEventListener('ended', this._handleEnded)

    const safeOffset = Math.min(Math.max(fromOffset, 0), this.buffer.duration)
    source.start(0, safeOffset)

    this.source = source
    this.startedAtContextTime = ctx.currentTime - safeOffset / this.playbackRate
    this.isPlaying = true

    if (this.crackleEnabled) this._startCrackle()
  }

  pause() {
    if (!this.isPlaying) return
    this.pausedAtOffset = this.getCurrentTime()
    this._stopSourceNode()
    this._stopCrackle()
    this.isPlaying = false
  }

  stop() {
    this._stopSourceNode()
    this._stopCrackle()
    this.isPlaying = false
    this.pausedAtOffset = 0
  }

  seek(timeSeconds) {
    const wasPlaying = this.isPlaying
    this.pausedAtOffset = Math.min(Math.max(timeSeconds, 0), this.buffer?.duration ?? 0)
    if (wasPlaying) {
      this.play(this.pausedAtOffset)
    }
  }

  getCurrentTime() {
    if (!this.buffer) return 0
    if (!this.isPlaying) return this.pausedAtOffset
    const elapsed =
      (this.context.currentTime - this.startedAtContextTime) * this.playbackRate
    return Math.min(elapsed, this.buffer.duration)
  }

  getDuration() {
    return this.buffer?.duration ?? 0
  }

  setVolume(value) {
    this.volume = Math.min(Math.max(value, 0), 1)
    if (this.masterGain && this.context) {
      this.masterGain.gain.setValueAtTime(this.volume, this.context.currentTime)
    }
  }

  setPlaybackRate(rate) {
    this.playbackRate = Math.max(rate, 0.25)
    if (this.source && this.context) {
      this.source.playbackRate.setValueAtTime(
        this.playbackRate,
        this.context.currentTime,
      )
    }
  }

  setTubeWarmth(enabled) {
    this.tubeWarmthEnabled = enabled
    if (!this.context) return
    const now = this.context.currentTime
    if (this.warmthFilter) {
      this.warmthFilter.frequency.cancelScheduledValues(now)
      this.warmthFilter.frequency.linearRampToValueAtTime(
        enabled ? 4800 : 20000,
        now + CROSSFADE_SECONDS,
      )
    }
    if (this.bassWarmthFilter) {
      this.bassWarmthFilter.gain.cancelScheduledValues(now)
      this.bassWarmthFilter.gain.linearRampToValueAtTime(
        enabled ? 3.5 : 0,
        now + CROSSFADE_SECONDS,
      )
    }
  }

  playNeedleDropEffect() {
    if (!this.context) return
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') ctx.resume()
    const now = ctx.currentTime

    // Low-frequency vinyl needle drop thump
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(80, now)
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.1)

    oscGain.gain.setValueAtTime(0, now)
    oscGain.gain.linearRampToValueAtTime(0.3, now + 0.01)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

    osc.connect(oscGain)
    oscGain.connect(this.masterGain)

    osc.start(now)
    osc.stop(now + 0.2)
  }

  setCrackleEnabled(enabled) {
    this.crackleEnabled = enabled
    if (!this.context) return
    if (enabled && this.isPlaying) {
      this._startCrackle()
    } else {
      this._stopCrackle()
    }
  }

  getAnalyser() {
    return this.analyser
  }

  dispose() {
    this._stopSourceNode()
    this._stopCrackle()
    this.context?.close()
    this.context = null
  }

  // --- internals -----------------------------------------------------

  _handleEnded = () => {
    // A source node also fires 'ended' when we call stop() on it ourselves
    // (e.g. from pause()/seek()). Only treat it as a real track end if we
    // still believe we're playing this exact source.
    if (!this.isPlaying) return
    this.isPlaying = false
    this.pausedAtOffset = 0
    this._stopCrackle()
    this.handlers.onEnded?.()
  }

  _stopSourceNode() {
    if (!this.source) return
    try {
      this.source.removeEventListener?.('ended', this._handleEnded)
      this.source.stop()
    } catch {
      // already stopped — safe to ignore
    }
    this.source.disconnect()
    this.source = null
  }

  /** Synthesizes a soft vinyl-crackle ambience: filtered white noise with a slow gain fade-in, since we can't ship a licensed sample. */
  _startCrackle() {
    if (!this.context || this.crackleSource) return
    const ctx = this.context
    const bufferSeconds = 2
    const buffer = ctx.createBuffer(1, ctx.sampleRate * bufferSeconds, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      // Sparse random pops + a low noise floor approximate vinyl crackle.
      const pop = Math.random() < 0.0015 ? (Math.random() * 2 - 1) * 0.6 : 0
      const floor = (Math.random() * 2 - 1) * 0.02
      data[i] = pop + floor
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(this.crackleGain)
    source.start(0)

    this.crackleGain.gain.cancelScheduledValues(ctx.currentTime)
    this.crackleGain.gain.setValueAtTime(0, ctx.currentTime)
    this.crackleGain.gain.linearRampToValueAtTime(
      0.15,
      ctx.currentTime + CROSSFADE_SECONDS,
    )

    this.crackleSource = source
  }

  _stopCrackle() {
    if (!this.crackleSource) return
    const ctx = this.context
    try {
      if (ctx) {
        this.crackleGain.gain.cancelScheduledValues(ctx.currentTime)
        this.crackleGain.gain.setValueAtTime(
          this.crackleGain.gain.value,
          ctx.currentTime,
        )
        this.crackleGain.gain.linearRampToValueAtTime(
          0,
          ctx.currentTime + CROSSFADE_SECONDS,
        )
      }
      this.crackleSource.stop((ctx?.currentTime ?? 0) + CROSSFADE_SECONDS + 0.01)
    } catch {
      // already stopped — safe to ignore
    }
    this.crackleSource = null
  }
}
