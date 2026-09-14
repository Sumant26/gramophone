import { describe, it, expect } from 'vitest'
import { deriveCategories, filterTracksByCategory } from './deriveCategories'

const tracks = [
  { id: '1', genre: 'Jazz', isFavorite: true, lastPlayedAt: 100 },
  { id: '2', genre: 'Jazz', isFavorite: false, lastPlayedAt: null },
  { id: '3', genre: 'Lo-fi', isFavorite: false, lastPlayedAt: 200 },
  { id: '4', genre: '', isFavorite: true, lastPlayedAt: null },
]

describe('deriveCategories', () => {
  it('always includes the three smart categories first', () => {
    const categories = deriveCategories(tracks)
    expect(categories.slice(0, 3).map((c) => c.id)).toEqual([
      'smart:all',
      'smart:favorites',
      'smart:recent',
    ])
  })

  it('counts smart categories correctly', () => {
    const [all, favorites, recent] = deriveCategories(tracks)
    expect(all.count).toBe(4)
    expect(favorites.count).toBe(2)
    expect(recent.count).toBe(2)
  })

  it('groups genres and counts tracks per genre, treating blank genre as Uncategorized', () => {
    const categories = deriveCategories(tracks)
    const genreCats = categories.filter((c) => c.kind === 'genre')
    expect(genreCats).toEqual([
      { id: 'genre:Jazz', label: 'Jazz', count: 2, kind: 'genre' },
      { id: 'genre:Lo-fi', label: 'Lo-fi', count: 1, kind: 'genre' },
      {
        id: 'genre:Uncategorized',
        label: 'Uncategorized',
        count: 1,
        kind: 'genre',
      },
    ])
  })

  it('returns only smart categories for an empty library', () => {
    expect(deriveCategories([])).toHaveLength(3)
  })
})

describe('filterTracksByCategory', () => {
  it('returns everything for "All Songs" or no category', () => {
    expect(filterTracksByCategory(tracks, 'smart:all')).toHaveLength(4)
    expect(filterTracksByCategory(tracks, null)).toHaveLength(4)
  })

  it('filters favorites', () => {
    const result = filterTracksByCategory(tracks, 'smart:favorites')
    expect(result.map((t) => t.id)).toEqual(['1', '4'])
  })

  it('filters and sorts recently played, most recent first', () => {
    const result = filterTracksByCategory(tracks, 'smart:recent')
    expect(result.map((t) => t.id)).toEqual(['3', '1'])
  })

  it('filters by genre, including Uncategorized fallback', () => {
    expect(filterTracksByCategory(tracks, 'genre:Jazz').map((t) => t.id)).toEqual([
      '1',
      '2',
    ])
    expect(
      filterTracksByCategory(tracks, 'genre:Uncategorized').map((t) => t.id),
    ).toEqual(['4'])
  })
})
