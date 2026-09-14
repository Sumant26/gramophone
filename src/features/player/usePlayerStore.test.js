import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/db/db', () => ({
  db: {
    tracks: {
      get: vi.fn().mockResolvedValue({ playCount: 0 }),
      update: vi.fn().mockResolvedValue(undefined),
    },
  },
}))

const { usePlayerStore } = await import('./usePlayerStore')

function makeTrack(id, name = `${id}.mp3`) {
  return {
    id,
    title: name,
    getFile: vi.fn().mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
    }),
  }
}

describe('usePlayerStore', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      queue: [],
      queueIndex: -1,
      shuffledIndices: null,
      currentTrack: null,
      isPlaying: false,
      position: 0,
      duration: 0,
      repeatMode: 'off',
      shuffle: false,
      error: null,
    })
  })

  it('playQueue loads and plays the track at startIndex', async () => {
    const tracks = [makeTrack('a'), makeTrack('b'), makeTrack('c')]
    await usePlayerStore.getState().playQueue(tracks, 1)
    const state = usePlayerStore.getState()
    expect(state.currentTrack.id).toBe('b')
    expect(state.queueIndex).toBe(1)
    expect(state.isPlaying).toBe(true)
  })

  it('togglePlayPause flips isPlaying', async () => {
    const tracks = [makeTrack('a')]
    await usePlayerStore.getState().playQueue(tracks, 0)
    expect(usePlayerStore.getState().isPlaying).toBe(true)
    usePlayerStore.getState().togglePlayPause()
    expect(usePlayerStore.getState().isPlaying).toBe(false)
    usePlayerStore.getState().togglePlayPause()
    expect(usePlayerStore.getState().isPlaying).toBe(true)
  })

  it('next advances to the following track in the queue', async () => {
    const tracks = [makeTrack('a'), makeTrack('b')]
    await usePlayerStore.getState().playQueue(tracks, 0)
    usePlayerStore.getState().next()
    await vi.waitFor(() => expect(usePlayerStore.getState().currentTrack.id).toBe('b'))
  })

  it('next stops playback at the end of the queue when repeat is off', async () => {
    const tracks = [makeTrack('a')]
    await usePlayerStore.getState().playQueue(tracks, 0)
    usePlayerStore.getState().next()
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })

  it('next wraps to the first track when repeat mode is "all"', async () => {
    const tracks = [makeTrack('a'), makeTrack('b')]
    await usePlayerStore.getState().playQueue(tracks, 1)
    usePlayerStore.setState({ repeatMode: 'all' })
    usePlayerStore.getState().next()
    await vi.waitFor(() => expect(usePlayerStore.getState().currentTrack.id).toBe('a'))
  })

  it('previous restarts the current track once played past 3 seconds', async () => {
    const tracks = [makeTrack('a'), makeTrack('b')]
    await usePlayerStore.getState().playQueue(tracks, 1)
    usePlayerStore.getState().localEngine.context.currentTime = 10 // > 3s in
    usePlayerStore.getState().previous()
    expect(usePlayerStore.getState().queueIndex).toBe(1)
  })

  it('previous moves to the prior track when near the start', async () => {
    const tracks = [makeTrack('a'), makeTrack('b')]
    await usePlayerStore.getState().playQueue(tracks, 1)
    usePlayerStore.getState().previous()
    await vi.waitFor(() => expect(usePlayerStore.getState().currentTrack.id).toBe('a'))
  })

  it('cycleRepeatMode cycles off -> all -> one -> off', () => {
    const { cycleRepeatMode } = usePlayerStore.getState()
    expect(usePlayerStore.getState().repeatMode).toBe('off')
    cycleRepeatMode()
    expect(usePlayerStore.getState().repeatMode).toBe('all')
    cycleRepeatMode()
    expect(usePlayerStore.getState().repeatMode).toBe('one')
    cycleRepeatMode()
    expect(usePlayerStore.getState().repeatMode).toBe('off')
  })

  it('toggleShuffle builds a shuffled index permutation covering the whole queue', async () => {
    const tracks = [makeTrack('a'), makeTrack('b'), makeTrack('c')]
    usePlayerStore.setState({ queue: tracks })
    usePlayerStore.getState().toggleShuffle()
    const { shuffledIndices } = usePlayerStore.getState()
    expect(shuffledIndices).toHaveLength(3)
    expect([...shuffledIndices].sort()).toEqual([0, 1, 2])
  })

  it('setVolume clamps via the engine and updates state', () => {
    usePlayerStore.getState().setVolume(0.5)
    expect(usePlayerStore.getState().volume).toBe(0.5)
  })

  it('setSleepTimer(0) clears the timer', () => {
    usePlayerStore.getState().setSleepTimer(10)
    expect(usePlayerStore.getState().sleepTimerEndsAt).not.toBeNull()
    usePlayerStore.getState().setSleepTimer(0)
    expect(usePlayerStore.getState().sleepTimerEndsAt).toBeNull()
  })
})
