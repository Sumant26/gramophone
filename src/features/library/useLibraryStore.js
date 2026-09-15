import { create } from 'zustand'
import { db } from '@/db/db'
import { isSupportedAudioFile, hashTrackId, readTags } from './metadata'

/**
 * Turns a File into a persistable track record + something that can hand
 * back the actual File later (`getFile`). Metadata is written to IndexedDB
 * so the library list, favorites and play counts survive a reload; the
 * File itself is only kept in memory for this session unless it came from
 * a FileSystemFileHandle (see addFromDirectory), since plain <input>/drop
 * File objects can't be reopened after a reload.
 */
async function buildTrackRecord(file, { fileHandle } = {}) {
  const id = hashTrackId(file)
  const tags = await readTags(file)
  return {
    id,
    title: tags.title,
    artist: tags.artist,
    album: tags.album,
    genre: tags.genre,
    trackNumber: tags.trackNumber,
    pictureUrl: tags.pictureUrl,
    addedAt: Date.now(),
    playCount: 0,
    lastPlayedAt: null,
    isFavorite: false,
    hasHandle: Boolean(fileHandle),
    getFile: fileHandle ? () => fileHandle.getFile() : async () => file,
  }
}

async function walkDirectory(dirHandle, onFile) {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile()
      if (isSupportedAudioFile(file)) await onFile(file, entry)
    } else if (entry.kind === 'directory') {
      await walkDirectory(entry, onFile)
    }
  }
}

export const useLibraryStore = create((set, get) => ({
  tracks: [],
  isScanning: false,
  scanProgress: { done: 0, total: 0 },
  error: null,
  selectedCategoryId: 'smart:all',
  searchQuery: '',

  async loadFromDb() {
    const saved = await db.tracks.toArray()
    // Records from a previous session have no live File/handle attached
    // yet (handles, when present, are restored separately). Mark them so
    // the UI can prompt for re-linking before playback if needed.
    set({
      tracks: saved.map((t) => ({
        ...t,
        getFile:
          t.getFile ??
          (async () => {
            throw new Error('File not linked — re-import this track.')
          }),
      })),
    })
  },

  async addFiles(fileList) {
    const files = Array.from(fileList).filter(isSupportedAudioFile)
    if (files.length === 0) return
    set({
      isScanning: true,
      scanProgress: { done: 0, total: files.length },
      error: null,
    })

    const newTracks = []
    for (const file of files) {
      const record = await buildTrackRecord(file)
      newTracks.push(record)
      set((state) => ({
        scanProgress: { ...state.scanProgress, done: state.scanProgress.done + 1 },
      }))
    }

    await get()._mergeAndPersist(newTracks)
    set({ isScanning: false })
  },

  async addFromDirectory(dirHandle) {
    set({ isScanning: true, scanProgress: { done: 0, total: 0 }, error: null })
    const newTracks = []
    try {
      await walkDirectory(dirHandle, async (file, entry) => {
        const record = await buildTrackRecord(file, { fileHandle: entry })
        newTracks.push(record)
        set((state) => ({
          scanProgress: { done: state.scanProgress.done + 1, total: newTracks.length },
        }))
      })
      await get()._mergeAndPersist(newTracks)
    } catch (err) {
      set({ error: String(err) })
    } finally {
      set({ isScanning: false })
    }
  },

  async _mergeAndPersist(newTracks) {
    set((state) => {
      const byId = new Map(state.tracks.map((t) => [t.id, t]))
      for (const t of newTracks) byId.set(t.id, t)
      return { tracks: [...byId.values()] }
    })
    // Persist metadata only (getFile/fileHandle functions aren't
    // structured-cloneable in the general case for plain File-backed
    // tracks, so we store the describable fields).
    await db.tracks.bulkPut(newTracks.map(({ getFile: _getFile, ...meta }) => meta))
  },

  async toggleFavorite(trackId) {
    set((state) => ({
      tracks: state.tracks.map((t) =>
        t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t,
      ),
    }))
    const track = get().tracks.find((t) => t.id === trackId)
    if (track) await db.tracks.update(trackId, { isFavorite: track.isFavorite })
  },

  async addYouTubeTrack(track) {
    const record = {
      id: track.id || `youtube:${track.videoId}`,
      source: 'youtube',
      videoId: track.videoId,
      title: track.title,
      artist: track.artist || 'YouTube Music',
      album: track.album || track.title,
      genre: 'Streaming',
      pictureUrl: track.pictureUrl || null,
      durationSeconds: track.durationSeconds || null,
      addedAt: Date.now(),
      playCount: 0,
      lastPlayedAt: null,
      isFavorite: false,
    }
    await get()._mergeAndPersist([record])
  },

  async addYouTubeAlbum(albumTitle, artist, results) {
    const newTracks = results.map((result, idx) => ({
      id: `youtube:${result.videoId}`,
      source: 'youtube',
      videoId: result.videoId,
      title: result.title,
      artist: artist || result.channelTitle || 'YouTube Artist',
      album: albumTitle,
      trackNumber: idx + 1,
      genre: 'Streaming',
      pictureUrl: result.thumbnailUrl || null,
      durationSeconds: null,
      addedAt: Date.now(),
      playCount: 0,
      lastPlayedAt: null,
      isFavorite: false,
    }))
    await get()._mergeAndPersist(newTracks)
  },

  async removeTrack(trackId) {
    set((state) => ({
      tracks: state.tracks.filter((t) => t.id !== trackId),
    }))
    await db.tracks.delete(trackId)
  },

  async createMixtapeAlbum(albumTitle, artist, trackIds, mood = 'Cozy Cafe') {
    const { tracks } = get()
    const selectedTracks = tracks.filter((t) => trackIds.includes(t.id))
    const updatedTracks = selectedTracks.map((t, idx) => ({
      ...t,
      album: albumTitle,
      artist: artist || t.artist,
      trackNumber: idx + 1,
      genre: mood,
    }))
    await get()._mergeAndPersist(updatedTracks)
  },

  setSelectedCategory(categoryId) {
    set({ selectedCategoryId: categoryId })
  },

  setSearchQuery(query) {
    set({ searchQuery: query })
  },

  async clearLibrary() {
    set({ tracks: [] })
    await db.tracks.clear()
  },
}))
