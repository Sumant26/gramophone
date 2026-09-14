import { describe, it, expect } from 'vitest'
import { toQueueTrack } from './toQueueTrack'

describe('toQueueTrack', () => {
  it('maps a YouTube search result into the common track shape', () => {
    const track = toQueueTrack({
      videoId: 'abc123',
      title: 'Kind of Blue (Full Album)',
      channelTitle: 'Miles Davis - Topic',
      thumbnailUrl: 'https://img/medium.jpg',
      publishedAt: '2020-01-01T00:00:00Z',
    })

    expect(track).toEqual({
      id: 'youtube:abc123',
      source: 'youtube',
      videoId: 'abc123',
      title: 'Kind of Blue (Full Album)',
      artist: 'Miles Davis - Topic',
      album: 'YouTube',
      pictureUrl: 'https://img/medium.jpg',
      durationSeconds: null,
      isFavorite: false,
    })
  })

  it('gives every mapped track a stable id derived from its videoId', () => {
    const a = toQueueTrack({ videoId: 'xyz', title: 'A', channelTitle: 'C' })
    const b = toQueueTrack({ videoId: 'xyz', title: 'A', channelTitle: 'C' })
    expect(a.id).toBe(b.id)
  })
})
