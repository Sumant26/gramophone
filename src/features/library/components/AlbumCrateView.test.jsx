import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AlbumCrateView } from './AlbumCrateView'

const SAMPLE_TRACKS = [
  {
    id: 'track-1',
    title: 'Kind of Blue',
    artist: 'Miles Davis',
    album: 'Kind of Blue',
    durationSeconds: 320,
    isFavorite: false,
  },
  {
    id: 'track-2',
    title: 'So What',
    artist: 'Miles Davis',
    album: 'Kind of Blue',
    durationSeconds: 560,
    isFavorite: true,
  },
  {
    id: 'track-3',
    title: 'Blue Train',
    artist: 'John Coltrane',
    album: 'Blue Train',
    durationSeconds: 400,
    isFavorite: false,
  },
]

describe('AlbumCrateView', () => {
  it('renders an empty state when tracks array is empty', () => {
    render(<AlbumCrateView tracks={[]} />)
    expect(screen.getByText('No songs here yet')).toBeInTheDocument()
  })

  it('groups tracks into albums with titles and artists', () => {
    render(
      <AlbumCrateView
        tracks={SAMPLE_TRACKS}
        currentTrackId="track-1"
        isPlaying={false}
        onPlayTrack={vi.fn()}
      />,
    )

    expect(screen.getAllByText('Kind of Blue').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Blue Train').length).toBeGreaterThanOrEqual(1)
  })

  it('calls onPlayTrack when clicking Play Record button', () => {
    const onPlayTrack = vi.fn()
    render(
      <AlbumCrateView
        tracks={SAMPLE_TRACKS}
        currentTrackId={null}
        isPlaying={false}
        onPlayTrack={onPlayTrack}
      />,
    )

    const playButtons = screen.getAllByRole('button', { name: /Play Record/i })
    fireEvent.click(playButtons[0])
    expect(onPlayTrack).toHaveBeenCalledWith(SAMPLE_TRACKS[0], 0)
  })

  it('toggles song list drawer when clicking Songs button', () => {
    render(
      <AlbumCrateView
        tracks={SAMPLE_TRACKS}
        currentTrackId={null}
        isPlaying={false}
        onPlayTrack={vi.fn()}
      />,
    )

    const viewSongsButtons = screen.getAllByRole('button', { name: /Songs/i })
    fireEvent.click(viewSongsButtons[0])
    expect(screen.getByText('So What')).toBeInTheDocument()
  })

  it('filters by Favorites divider tab', () => {
    render(
      <AlbumCrateView
        tracks={SAMPLE_TRACKS}
        currentTrackId={null}
        isPlaying={false}
        onPlayTrack={vi.fn()}
      />,
    )

    const favTab = screen.getByRole('tab', { name: /Favorites/i })
    fireEvent.click(favTab)
    expect(screen.getAllByText('Kind of Blue').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('Blue Train')).not.toBeInTheDocument()
  })

  it('triggers onOpenGatefold when clicking Liner Notes', () => {
    const onOpenGatefold = vi.fn()
    render(
      <AlbumCrateView
        tracks={SAMPLE_TRACKS}
        currentTrackId={null}
        isPlaying={false}
        onPlayTrack={vi.fn()}
        onOpenGatefold={onOpenGatefold}
      />,
    )

    const linerNotesButtons = screen.getAllByRole('button', { name: /Liner Notes/i })
    fireEvent.click(linerNotesButtons[0])
    expect(onOpenGatefold).toHaveBeenCalled()
  })
})
