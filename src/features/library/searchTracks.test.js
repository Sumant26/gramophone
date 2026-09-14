import { describe, it, expect } from 'vitest'
import { searchTracks } from './searchTracks'

const tracks = [
  { id: '1', title: 'Blue in Green', artist: 'Miles Davis', album: 'Kind of Blue' },
  { id: '2', title: 'Take Five', artist: 'Dave Brubeck', album: 'Time Out' },
  { id: '3', title: 'So What', artist: 'Miles Davis', album: 'Kind of Blue' },
]

describe('searchTracks', () => {
  it('returns all tracks for an empty query', () => {
    expect(searchTracks(tracks, '')).toHaveLength(3)
    expect(searchTracks(tracks, '   ')).toHaveLength(3)
  })

  it('matches by title, case-insensitively', () => {
    // Matches track 1 by title ("Blue in Green") and track 3 by album
    // ("Kind of Blue") — searchTracks matches across all three fields.
    expect(searchTracks(tracks, 'blue')).toHaveLength(2)
    expect(searchTracks(tracks, 'BLUE')).toHaveLength(2)
    expect(searchTracks(tracks, 'green')).toHaveLength(1)
  })

  it('matches by artist', () => {
    expect(searchTracks(tracks, 'davis')).toHaveLength(2)
  })

  it('matches by album', () => {
    expect(searchTracks(tracks, 'kind of blue')).toHaveLength(2)
  })

  it('returns an empty array when nothing matches', () => {
    expect(searchTracks(tracks, 'zzz')).toHaveLength(0)
  })
})
