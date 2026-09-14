import Dexie from 'dexie'

/**
 * Local IndexedDB store, via Dexie. This is what makes the library persist
 * across reloads without a backend: track metadata plus (where supported)
 * the FileSystemFileHandle itself, which Chromium can structured-clone
 * straight into IndexedDB and re-request permission for on next visit.
 */
export const db = new Dexie('gramophone-player')

db.version(1).stores({
  // id: stable hash of (name+size+lastModified); everything else is metadata
  tracks:
    'id, title, artist, album, genre, category, addedAt, playCount, lastPlayedAt, isFavorite',
  playlists: 'id, name, createdAt',
})

export default db
