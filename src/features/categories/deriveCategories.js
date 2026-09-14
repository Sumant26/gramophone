/**
 * Derives the browsable category list from the current track library.
 * Kept as a pure function (no store dependency) so it's trivial to unit
 * test and to reuse from both the Zustand selector and anywhere else that
 * needs "what categories exist right now".
 */
export function deriveCategories(tracks) {
  const genreCounts = new Map()
  let favoritesCount = 0
  let recentlyPlayedCount = 0

  for (const track of tracks) {
    const genre = track.genre?.trim() || 'Uncategorized'
    genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1)
    if (track.isFavorite) favoritesCount += 1
    if (track.lastPlayedAt) recentlyPlayedCount += 1
  }

  const genreCategories = [...genreCounts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([genre, count]) => ({
      id: `genre:${genre}`,
      label: genre,
      count,
      kind: 'genre',
    }))

  const smart = [
    { id: 'smart:all', label: 'All Songs', count: tracks.length, kind: 'smart' },
    {
      id: 'smart:favorites',
      label: 'Favorites',
      count: favoritesCount,
      kind: 'smart',
    },
    {
      id: 'smart:recent',
      label: 'Recently Played',
      count: recentlyPlayedCount,
      kind: 'smart',
    },
  ]

  return [...smart, ...genreCategories]
}

/** Filters tracks against a category id produced by deriveCategories(). */
export function filterTracksByCategory(tracks, categoryId) {
  if (!categoryId || categoryId === 'smart:all') return tracks
  if (categoryId === 'smart:favorites') return tracks.filter((t) => t.isFavorite)
  if (categoryId === 'smart:recent') {
    return tracks
      .filter((t) => t.lastPlayedAt)
      .sort((a, b) => b.lastPlayedAt - a.lastPlayedAt)
  }
  if (categoryId.startsWith('genre:')) {
    const genre = categoryId.slice('genre:'.length)
    return tracks.filter((t) => (t.genre?.trim() || 'Uncategorized') === genre)
  }
  return tracks
}
