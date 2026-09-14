import { create } from 'zustand'
import { AudioEngine } from './audioEngine'
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
 * Central playback state. Owns one AudioEngine instance for the app's
 * lifetime and mirrors its state into React-observable store fields. Every
 * transport action (play/pause/next/previous/seek) goes through here rather
 * than touching AudioEngine from components directly.
 */
export const usePlayerStore = create((set, get) => {
  const engine = new AudioEngine({
    onEnded: () => get().handleTrackEnded(),
    onError: (err) => set({ error: err.message }),
  })

  return {
    engine,
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
      set({ isLoading: true, error: null, queueIndex: index, currentTrack: track })
      try {
        const file = await track.getFile()
        const { duration } = await engine.loadTrack(file)
        engine.play(0)
        set({ isLoading: false, isPlaying: true, duration, position: 0 })
        get().recordPlay(track.id)
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
      if (isPlaying) {
        engine.pause()
        set({ isPlaying: false })
      } else {
        engine.play()
        set({ isPlaying: true })
      }
    },

    stop() {
      engine.stop()
      set({ isPlaying: false, position: 0 })
    },

    seekTo(seconds) {
      engine.seek(seconds)
      set({ position: engine.getCurrentTime() })
    },

    skipForward() {
      get().seekTo(engine.getCurrentTime() + SKIP_SECONDS)
    },

    skipBackward() {
      get().seekTo(engine.getCurrentTime() - SKIP_SECONDS)
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
      if (engine.getCurrentTime() > 3) {
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
      engine.setVolume(value)
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
      const enabled = !get().crackleEnabled
      engine.setCrackleEnabled(enabled)
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
        set({ position: engine.getCurrentTime() })
      }
      if (sleepTimerEndsAt && Date.now() >= sleepTimerEndsAt) {
        get().togglePlayPause()
        set({ sleepTimerEndsAt: null, sleepTimerMinutes: 0 })
      }
    },

    getAnalyser() {
      return engine.getAnalyser()
    },
  }
})
