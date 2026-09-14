/** Case-insensitive search across title, artist, and album. Pure/testable. */
export function searchTracks(tracks, query) {
  const q = query.trim().toLowerCase()
  if (!q) return tracks
  return tracks.filter((t) =>
    [t.title, t.artist, t.album].some((field) => field?.toLowerCase().includes(q)),
  )
}
