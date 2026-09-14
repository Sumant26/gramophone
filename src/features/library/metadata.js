import jsmediatags from 'jsmediatags'

export const SUPPORTED_EXTENSIONS = [
  'mp3',
  'flac',
  'wav',
  'ogg',
  'm4a',
  'aac',
  'opus',
  'weba',
]

export function isSupportedAudioFile(file) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return SUPPORTED_EXTENSIONS.includes(ext ?? '')
}

/**
 * Deterministic, fast (non-cryptographic) FNV-1a hash used to build a
 * stable track id from name+size+lastModified — stable across sessions
 * without needing to hash full file contents (which would be slow for a
 * large library).
 */
export function hashTrackId(file) {
  const input = `${file.name}:${file.size}:${file.lastModified ?? 0}`
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16)
}

const UNKNOWN = {
  title: undefined,
  artist: 'Unknown Artist',
  album: 'Unknown Album',
  genre: 'Uncategorized',
  pictureUrl: null,
}

/**
 * Reads ID3/Vorbis/MP4 tags from an audio file. Falls back to a filename-
 * derived title and "Unknown"/"Uncategorized" fields when a file has no
 * (or unreadable) tags, rather than failing the whole import.
 */
export function readTags(file) {
  return new Promise((resolve) => {
    jsmediatags.read(file, {
      onSuccess: ({ tags }) => {
        let pictureUrl = null
        if (tags.picture) {
          const { data, format } = tags.picture
          const bytes = new Uint8Array(data)
          const blob = new Blob([bytes], { type: format })
          pictureUrl = URL.createObjectURL(blob)
        }
        resolve({
          title: tags.title || fallbackTitle(file),
          artist: tags.artist || UNKNOWN.artist,
          album: tags.album || UNKNOWN.album,
          genre: tags.genre || UNKNOWN.genre,
          trackNumber: tags.track ? Number.parseInt(tags.track, 10) : null,
          pictureUrl,
        })
      },
      onError: () => {
        resolve({
          title: fallbackTitle(file),
          artist: UNKNOWN.artist,
          album: UNKNOWN.album,
          genre: UNKNOWN.genre,
          trackNumber: null,
          pictureUrl: null,
        })
      },
    })
  })
}

function fallbackTitle(file) {
  return file.name.replace(/\.[^/.]+$/, '')
}
