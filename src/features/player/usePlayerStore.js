import { create } from 'zustand'
import { AudioEngine } from './audioEngine'
import { AmbienceEngine } from './ambienceEngine'
import { YouTubeEngine } from '@/features/youtube/youtubeEngine'
import { db } from '@/db/db'

const SKIP_SECONDS = 10

function shuffleOrder(length) {
  const order = Array.from({ length }, (_, i) => i)
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}

/**
 * Central playback state. Owns one AudioEngine instance (local files),
 * one AmbienceEngine (soundscapes), and one YouTubeEngine instance (streamed).
 */
export const usePlayerStore = create((set, get) => {
  const localEngine = new AudioEngine({
    onEnded: () => get().handleTrackEnded(),
    onError: (err) => set({ error: err.message }),
  })

  const ambienceEngine = new AmbienceEngine()

  const youtubeEngine = new YouTubeEngine({
    onEnded: () => get().handleTrackEnded(),
    onError: (err) => set({ error: err.message }),
    onPlayingChange: (isPlaying) => {
      if (get().currentTrack?.source === 'youtube') set({ isPlaying })
    },
  })

  /** The engine that owns whatever is (or is about to be) playing. */
  function activeEngine() {
    return get().currentTrack?.source === 'youtube' ? youtubeEngine : localEngine
  }

  return {
    localEngine,
    ambienceEngine,
    youtubeEngine,
    queue: [], // array of track objects, in playback order
    queueIndex: -1,
    shuffledIndices: null, // when shuffle is on: a permutation over `queue`
    currentTrack: null,
    isPlaying: false,
    isLoading: false,
    position: 0,
    duration: 0,
    volume: 0.8,
    repeatMode: 'off', // 'off' | 'all' | 'one'
    shuffle: false,
    crackleEnabled: false,
    rpmSpeed: 33, // 33 | 45 | 78
    vinylStyle: 'black', // 'black' | 'amber' | 'marble' | 'picture'
    tubeWarmthEnabled: false,
    ambienceVolumes: {
      rain: 0,
      fire: 0,
      cafe: 0,
    },
    theme: 'walnut', // 'walnut' | 'maple' | 'midnight'
    isZenModeOpen: false,
    sleepTimerEndsAt: null,
    sleepTimerMinutes: 0, // the preset the user picked, for display
    error: null,

    /** Replace the queue and start playing at `startIndex`. */
    async playQueue(tracks, startIndex = 0) {
      set({
        queue: tracks,
        shuffledIndices: get().shuffle ? shuffleOrder(tracks.length) : null,
      })
      await get().playAtIndex(startIndex)
    },

    async playAtIndex(index) {
      const { queue } = get()
      const track = queue[index]
      if (!track) return
      const isYouTube = track.source === 'youtube'
      set({ isLoading: true, error: null, queueIndex: index, currentTrack: track })
      try {
        let duration
        if (isYouTube) {
          ;({ duration } = await youtubeEngine.loadTrack(track.videoId))
          youtubeEngine.play()
        } else {
          const file = await track.getFile()
          ;({ duration } = await localEngine.loadTrack(file))
          localEngine.play(0)
        }
        set({ isLoading: false, isPlaying: true, duration, position: 0 })
        if (!isYouTube) get().recordPlay(track.id)
      } catch (err) {
        set({ isLoading: false, isPlaying: false, error: String(err) })
      }
    },

    async recordPlay(trackId) {
      await db.tracks.update(trackId, {
        playCount: (await db.tracks.get(trackId))?.playCount + 1 || 1,
        lastPlayedAt: Date.now(),
      })
    },

    togglePlayPause() {
      const { isPlaying, currentTrack } = get()
      if (!currentTrack) return
      const engine = activeEngine()
      if (isPlaying) {
        engine.pause()
        set({ isPlaying: false })
      } else {
        engine.play()
        set({ isPlaying: true })
      }
    },

    stop() {
      activeEngine().stop()
      set({ isPlaying: false, position: 0 })
    },

    seekTo(seconds) {
      const engine = activeEngine()
      engine.seek(seconds)
      set({ position: engine.getCurrentTime() })
    },

    skipForward() {
      get().seekTo(activeEngine().getCurrentTime() + SKIP_SECONDS)
    },

    skipBackward() {
      get().seekTo(activeEngine().getCurrentTime() - SKIP_SECONDS)
    },

    next() {
      const { queue, queueIndex, shuffledIndices, repeatMode } = get()
      if (queue.length === 0) return

      if (shuffledIndices) {
        const pos = shuffledIndices.indexOf(queueIndex)
        const nextPos = pos + 1
        if (nextPos < shuffledIndices.length) {
          get().playAtIndex(shuffledIndices[nextPos])
        } else if (repeatMode === 'all') {
          set({ shuffledIndices: shuffleOrder(queue.length) })
          get().playAtIndex(get().shuffledIndices[0])
        } else {
          get().stop()
        }
        return
      }

      const nextIndex = queueIndex + 1
      if (nextIndex < queue.length) {
        get().playAtIndex(nextIndex)
      } else if (repeatMode === 'all') {
        get().playAtIndex(0)
      } else {
        get().stop()
      }
    },

    previous() {
      const { queue, queueIndex } = get()
      if (queue.length === 0) return
      // Standard player convention: restart current track if more than a
      // couple seconds in, otherwise go to the previous track.
      if (activeEngine().getCurrentTime() > 3) {
        get().seekTo(0)
        return
      }
      const prevIndex = Math.max(queueIndex - 1, 0)
      get().playAtIndex(prevIndex)
    },

    handleTrackEnded() {
      const { repeatMode } = get()
      if (repeatMode === 'one') {
        get().playAtIndex(get().queueIndex)
      } else {
        get().next()
      }
    },

    setVolume(value) {
      // Kept in sync on both engines (not just the active one) so the
      // level carries over seamlessly when the user switches between a
      // local track and a YouTube one.
      localEngine.setVolume(value)
      youtubeEngine.setVolume(value)
      set({ volume: value })
    },

    toggleShuffle() {
      const shuffle = !get().shuffle
      const { queue } = get()
      set({
        shuffle,
        shuffledIndices: shuffle ? shuffleOrder(queue.length) : null,
      })
    },

    cycleRepeatMode() {
      const order = ['off', 'all', 'one']
      const next = order[(order.indexOf(get().repeatMode) + 1) % order.length]
      set({ repeatMode: next })
    },

    toggleCrackle() {
      // Crackle ambience is synthesized from the local engine's own audio
      // graph — there's nothing to layer it onto for a YouTube stream, and
      // the UI hides this control for YouTube tracks accordingly.
      if (get().currentTrack?.source === 'youtube') return
      const enabled = !get().crackleEnabled
      localEngine.setCrackleEnabled(enabled)
      set({ crackleEnabled: enabled })
    },

    setSleepTimer(minutes) {
      if (!minutes) {
        set({ sleepTimerEndsAt: null, sleepTimerMinutes: 0 })
        return
      }
      set({
        sleepTimerEndsAt: Date.now() + minutes * 60_000,
        sleepTimerMinutes: minutes,
      })
    },

    clearSleepTimer() {
      set({ sleepTimerEndsAt: null, sleepTimerMinutes: 0 })
    },

    /** Called on a tick by the UI (rAF loop) to keep `position` in sync with the engine's real playback time. */
    syncPosition() {
      const { isPlaying, sleepTimerEndsAt } = get()
      if (isPlaying) {
        set({ position: activeEngine().getCurrentTime() })
      }
      if (sleepTimerEndsAt && Date.now() >= sleepTimerEndsAt) {
        get().togglePlayPause()
        set({ sleepTimerEndsAt: null, sleepTimerMinutes: 0 })
      }
    },

    setRpmSpeed(speed) {
      const validSpeeds = [33, 45, 78]
      const rpm = validSpeeds.includes(speed) ? speed : 33
      const playbackRate = rpm === 45 ? 1.35 : rpm === 78 ? 0.85 : 1.0
      localEngine.setPlaybackRate(playbackRate)
      set({ rpmSpeed: rpm })
    },

    setVinylStyle(style) {
      set({ vinylStyle: style })
    },

    setTubeWarmth(enabled) {
      localEngine.setTubeWarmth(enabled)
      set({ tubeWarmthEnabled: enabled })
    },

    setAmbienceVolume(layer, volume) {
      ambienceEngine.setLayerVolume(layer, volume)
      set((state) => ({
        ambienceVolumes: {
          ...state.ambienceVolumes,
          [layer]: volume,
        },
      }))
    },

    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme)
      set({ theme })
    },

    setIsZenModeOpen(open) {
      set({ isZenModeOpen: open })
    },

    needleSeek(fraction) {
      const { duration, currentTrack } = get()
      if (!currentTrack || duration <= 0) return
      const targetSeconds = Math.max(0, Math.min(fraction * duration, duration))
      localEngine.playNeedleDropEffect()
      ambienceEngine.playNeedleDrop(0.4)
      get().seekTo(targetSeconds)
    },

    /**
     * The Web Audio analyser node, for the visualizer — only meaningful
     * for local playback. YouTube's audio never touches our audio graph
     * (DRM/ToS), so there's nothing to analyse for a YouTube track; the
     * UI hides the visualizer in that case rather than showing a frozen one.
     */
    getAnalyser() {
      if (get().currentTrack?.source === 'youtube') return null
      return localEngine.getAnalyser()
    },

    /** Attaches the YouTubeEngine to its visible DOM mount. Called once by YouTubePlayerMount on first render; safe to call again (idempotent). */
    mountYouTubePlayer(container) {
      return youtubeEngine.mount(container)
    },
  }
})
