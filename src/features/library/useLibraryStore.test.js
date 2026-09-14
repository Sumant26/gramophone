import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/db/db', () => ({
  db: {
    tracks: {
      toArray: vi.fn().mockResolvedValue([]),
      bulkPut: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
    },
  },
}))

vi.mock('./metadata', () => ({
  isSupportedAudioFile: (file) => file.name.endsWith('.mp3'),
  hashTrackId: (file) => `id-${file.name}`,
  readTags: vi.fn().mockResolvedValue({
    title: 'Song',
    artist: 'Artist',
    album: 'Album',
    genre: 'Jazz',
    trackNumber: 1,
    pictureUrl: null,
  }),
}))

const { useLibraryStore } = await import('./useLibraryStore')
const { db } = await import('@/db/db')

function makeFile(name) {
  return { name, size: 100, lastModified: 1 }
}

describe('useLibraryStore', () => {
  beforeEach(() => {
    useLibraryStore.setState({
      tracks: [],
      isScanning: false,
      scanProgress: { done: 0, total: 0 },
      error: null,
      selectedCategoryId: 'smart:all',
      searchQuery: '',
    })
    vi.clearAllMocks()
  })

  it('addFiles filters out unsupported extensions and adds the rest', async () => {
    await useLibraryStore
      .getState()
      .addFiles([makeFile('song.mp3'), makeFile('notes.txt')])
    const { tracks } = useLibraryStore.getState()
    expect(tracks).toHaveLength(1)
    expect(tracks[0].title).toBe('Song')
  })

  it('addFiles is a no-op when nothing supported is passed', async () => {
    await useLibraryStore.getState().addFiles([makeFile('notes.txt')])
    expect(useLibraryStore.getState().tracks).toHaveLength(0)
  })

  it('persists new track metadata to IndexedDB', async () => {
    await useLibraryStore.getState().addFiles([makeFile('song.mp3')])
    expect(db.tracks.bulkPut).toHaveBeenCalledTimes(1)
    const [persisted] = db.tracks.bulkPut.mock.calls[0][0]
    expect(persisted.getFile).toBeUndefined() // functions aren't persisted
    expect(persisted.title).toBe('Song')
  })

  it('merging the same file twice replaces rather than duplicates', async () => {
    await useLibraryStore.getState().addFiles([makeFile('song.mp3')])
    await useLibraryStore.getState().addFiles([makeFile('song.mp3')])
    expect(useLibraryStore.getState().tracks).toHaveLength(1)
  })

  it('toggleFavorite flips isFavorite and persists it', async () => {
    await useLibraryStore.getState().addFiles([makeFile('song.mp3')])
    const id = useLibraryStore.getState().tracks[0].id
    await useLibraryStore.getState().toggleFavorite(id)
    expect(useLibraryStore.getState().tracks[0].isFavorite).toBe(true)
    expect(db.tracks.update).toHaveBeenCalledWith(id, { isFavorite: true })
  })

  it('clearLibrary empties tracks and the DB table', async () => {
    await useLibraryStore.getState().addFiles([makeFile('song.mp3')])
    await useLibraryStore.getState().clearLibrary()
    expect(useLibraryStore.getState().tracks).toHaveLength(0)
    expect(db.tracks.clear).toHaveBeenCalled()
  })

  it('setSearchQuery and setSelectedCategory update state', () => {
    useLibraryStore.getState().setSearchQuery('lofi')
    useLibraryStore.getState().setSelectedCategory('genre:Jazz')
    expect(useLibraryStore.getState().searchQuery).toBe('lofi')
    expect(useLibraryStore.getState().selectedCategoryId).toBe('genre:Jazz')
  })
})
