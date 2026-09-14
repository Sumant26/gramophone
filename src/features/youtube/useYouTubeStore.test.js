import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('./youtubeApi', () => ({
  searchYouTubeMusic: vi.fn(),
}))

const { useYouTubeStore } = await import('./useYouTubeStore')
const { searchYouTubeMusic } = await import('./youtubeApi')

describe('useYouTubeStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useYouTubeStore.setState({
      query: '',
      results: [],
      isSearching: false,
      errorMessage: null,
    })
    searchYouTubeMusic.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('setQuery debounces before actually searching', async () => {
    searchYouTubeMusic.mockResolvedValue({ ok: true, error: null, results: [] })
    useYouTubeStore.getState().setQuery('lofi')
    expect(searchYouTubeMusic).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(400)
    expect(searchYouTubeMusic).toHaveBeenCalledTimes(1)
    expect(searchYouTubeMusic).toHaveBeenCalledWith(
      'lofi',
      expect.objectContaining({ signal: expect.anything() }),
    )
  })

  it('clearing the query resets results without searching', () => {
    useYouTubeStore.setState({ results: [{ videoId: '1' }] })
    useYouTubeStore.getState().setQuery('')
    expect(useYouTubeStore.getState().results).toEqual([])
    expect(searchYouTubeMusic).not.toHaveBeenCalled()
  })

  it('populates results on a successful search', async () => {
    searchYouTubeMusic.mockResolvedValue({
      ok: true,
      error: null,
      results: [{ videoId: 'a', title: 'Track A' }],
    })
    useYouTubeStore.getState().setQuery('jazz')
    await vi.advanceTimersByTimeAsync(400)
    expect(useYouTubeStore.getState().results).toEqual([
      { videoId: 'a', title: 'Track A' },
    ])
    expect(useYouTubeStore.getState().isSearching).toBe(false)
  })

  it('maps a missing_api_key error to a friendly, actionable message', async () => {
    searchYouTubeMusic.mockResolvedValue({
      ok: false,
      error: 'missing_api_key',
      results: [],
    })
    useYouTubeStore.getState().setQuery('jazz')
    await vi.advanceTimersByTimeAsync(400)
    expect(useYouTubeStore.getState().errorMessage).toMatch(/VITE_YOUTUBE_API_KEY/)
  })

  it('reset() clears query, results, and pending state', () => {
    useYouTubeStore.setState({
      query: 'jazz',
      results: [{ videoId: 'a' }],
      errorMessage: 'oops',
    })
    useYouTubeStore.getState().reset()
    const state = useYouTubeStore.getState()
    expect(state.query).toBe('')
    expect(state.results).toEqual([])
    expect(state.errorMessage).toBeNull()
  })

  it('a superseded (aborted) search does not clobber a later result', async () => {
    let resolveFirst
    searchYouTubeMusic
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          }),
      )
      .mockResolvedValueOnce({
        ok: true,
        error: null,
        results: [{ videoId: 'second' }],
      })

    useYouTubeStore.getState().setQuery('first')
    await vi.advanceTimersByTimeAsync(400)
    useYouTubeStore.getState().setQuery('second')
    await vi.advanceTimersByTimeAsync(400)

    // The second search's real fetch resolves before the stale first one.
    resolveFirst?.({ ok: true, error: null, results: [{ videoId: 'stale' }] })
    await Promise.resolve()

    expect(useYouTubeStore.getState().results).toEqual([{ videoId: 'second' }])
  })
})
