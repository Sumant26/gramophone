import { create } from 'zustand'
import { AudioEngine } from './audioEngine'
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
 * Central playback state. Owns one AudioEngine instance (local files) and
 * one YouTubeEngine instance (streamed via the official IFrame API) for the
 * app's lifetime, and mirrors their state into React-observable store
 * fields. Every transport action (play/pause/next/previous/seek) goes
 * through here rather than touching either engine from components
 * directly. Which engine is "live" is decided per-track from
 * `currentTrack.source` ('local' by default, or 'youtube') — the two
 * engines never run at once.
 */
export const usePlayerStore = create((set, get) => {
  const localEngine = new AudioEngine({
    onEnded: () => get().handleTrackEnded(),
    onError: (err) => set({ error: err.message }),
  })

  const youtubeEngine = new YouTubeEngine({
    onEnded: () => get().handleTrackEnded(),
    onError: (err) => set({ error: err.message }),
    // The user can also drive playback from YouTube's own on-screen
    // controls, so mirror its reported state back — but only while a
    // YouTube track is actually current, so a stale event from a
    // previous video can't clobber local playback state.
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
    sleepTimerEndsAt: null,
    sleepTimerMinutes: 0, // the preset the user picked, for display (avoids recomputing from Date.now() in render)
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
