import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { searchYouTubeMusic, getYouTubeApiKey } from './youtubeApi'

function mockFetchOnce(body, { ok = true, status = 200 } = {}) {
  global.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  })
}

describe('youtubeApi', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_YOUTUBE_API_KEY', 'test-key-123')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('getYouTubeApiKey reads from the Vite env', () => {
    expect(getYouTubeApiKey()).toBe('test-key-123')
  })

  it('returns missing_api_key without calling fetch when no key is configured', async () => {
    vi.stubEnv('VITE_YOUTUBE_API_KEY', '')
    global.fetch = vi.fn()
    const result = await searchYouTubeMusic('lofi beats')
    expect(result).toEqual({ ok: false, error: 'missing_api_key', results: [] })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns an empty ok result for a blank query without calling fetch', async () => {
    global.fetch = vi.fn()
    const result = await searchYouTubeMusic('   ')
    expect(result).toEqual({ ok: true, error: null, results: [] })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('maps a successful response into lightweight result objects', async () => {
    mockFetchOnce({
      items: [
        {
          id: { videoId: 'abc123' },
          snippet: {
            title: 'Kind of Blue (Full Album)',
            channelTitle: 'Miles Davis - Topic',
            thumbnails: { medium: { url: 'https://img/medium.jpg' } },
            publishedAt: '2020-01-01T00:00:00Z',
          },
        },
      ],
    })

    const result = await searchYouTubeMusic('kind of blue')
    expect(result.ok).toBe(true)
    expect(result.results).toEqual([
      {
        videoId: 'abc123',
        title: 'Kind of Blue (Full Album)',
        channelTitle: 'Miles Davis - Topic',
        thumbnailUrl: 'https://img/medium.jpg',
        publishedAt: '2020-01-01T00:00:00Z',
      },
    ])
  })

  it('filters out items without a videoId (e.g. channel/playlist results)', async () => {
    mockFetchOnce({
      items: [{ id: { channelId: 'xyz' }, snippet: { title: 'Not a video' } }],
    })
    const result = await searchYouTubeMusic('something')
    expect(result.results).toEqual([])
  })

  it('falls back to the default thumbnail when medium is unavailable', async () => {
    mockFetchOnce({
      items: [
        {
          id: { videoId: 'abc' },
          snippet: {
            title: 'Track',
            channelTitle: 'Channel',
            thumbnails: { default: { url: 'https://img/default.jpg' } },
          },
        },
      ],
    })
    const result = await searchYouTubeMusic('x')
    expect(result.results[0].thumbnailUrl).toBe('https://img/default.jpg')
  })

  it('reports quota_or_key_invalid on a 403 response', async () => {
    mockFetchOnce({}, { ok: false, status: 403 })
    const result = await searchYouTubeMusic('x')
    expect(result).toEqual({ ok: false, error: 'quota_or_key_invalid', results: [] })
  })

  it('reports request_failed on other non-ok responses', async () => {
    mockFetchOnce({}, { ok: false, status: 500 })
    const result = await searchYouTubeMusic('x')
    expect(result).toEqual({ ok: false, error: 'request_failed', results: [] })
  })

  it('reports network_error when fetch itself rejects', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('offline'))
    const result = await searchYouTubeMusic('x')
    expect(result).toEqual({ ok: false, error: 'network_error', results: [] })
  })

  it('rethrows an AbortError rather than swallowing it', async () => {
    const abortError = new Error('aborted')
    abortError.name = 'AbortError'
    global.fetch = vi.fn().mockRejectedValue(abortError)
    await expect(searchYouTubeMusic('x')).rejects.toThrow('aborted')
  })
})
