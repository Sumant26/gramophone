import { describe, it, expect, vi } from 'vitest'
import {
  isSupportedAudioFile,
  hashTrackId,
  readTags,
  SUPPORTED_EXTENSIONS,
} from './metadata'

vi.mock('jsmediatags', () => ({
  default: {
    read: vi.fn((file, { onSuccess, onError }) => {
      if (file.name === 'broken.mp3') {
        onError({ type: 'parseFailure' })
        return
      }
      onSuccess({
        tags: {
          title: file.name === 'untitled.mp3' ? '' : 'Test Song',
          artist: 'Test Artist',
          album: 'Test Album',
          genre: 'Jazz',
          track: '3',
          picture: null,
        },
      })
    }),
  },
}))

function makeFile(name, size = 1024) {
  return { name, size, lastModified: 1700000000000 }
}

describe('isSupportedAudioFile', () => {
  it.each(SUPPORTED_EXTENSIONS)('accepts .%s files', (ext) => {
    expect(isSupportedAudioFile(makeFile(`song.${ext}`))).toBe(true)
  })

  it('rejects unsupported extensions', () => {
    expect(isSupportedAudioFile(makeFile('notes.txt'))).toBe(false)
    expect(isSupportedAudioFile(makeFile('video.mp4'))).toBe(false)
  })

  it('is case-insensitive', () => {
    expect(isSupportedAudioFile(makeFile('song.MP3'))).toBe(true)
  })
})

describe('hashTrackId', () => {
  it('is stable for the same file identity', () => {
    const a = hashTrackId(makeFile('song.mp3'))
    const b = hashTrackId(makeFile('song.mp3'))
    expect(a).toBe(b)
  })

  it('differs when name, size, or lastModified differ', () => {
    const base = hashTrackId(makeFile('song.mp3', 1024))
    expect(hashTrackId(makeFile('other.mp3', 1024))).not.toBe(base)
    expect(hashTrackId(makeFile('song.mp3', 2048))).not.toBe(base)
  })
})

describe('readTags', () => {
  it('resolves parsed tags for a well-tagged file', async () => {
    const result = await readTags(makeFile('song.mp3'))
    expect(result).toMatchObject({
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      genre: 'Jazz',
      trackNumber: 3,
    })
  })

  it('falls back to the filename when title tag is empty', async () => {
    const result = await readTags(makeFile('untitled.mp3'))
    expect(result.title).toBe('untitled')
  })

  it('falls back to Unknown/Uncategorized when tags fail to parse', async () => {
    const result = await readTags(makeFile('broken.mp3'))
    expect(result).toMatchObject({
      title: 'broken',
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      genre: 'Uncategorized',
    })
  })
})
