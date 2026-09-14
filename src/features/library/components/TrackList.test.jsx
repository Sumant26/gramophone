import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TrackList } from './TrackList'

const tracks = [
  {
    id: '1',
    title: 'Blue in Green',
    artist: 'Miles Davis',
    album: 'Kind of Blue',
    isFavorite: false,
  },
  {
    id: '2',
    title: 'So What',
    artist: 'Miles Davis',
    album: 'Kind of Blue',
    isFavorite: true,
  },
]

describe('TrackList', () => {
  it('shows an empty state when there are no tracks', () => {
    render(
      <TrackList
        tracks={[]}
        currentTrackId={null}
        isPlaying={false}
        onPlayTrack={vi.fn()}
        onToggleFavorite={vi.fn()}
      />,
    )
    expect(screen.getByText(/No songs here yet/)).toBeInTheDocument()
  })

  it('renders every track with title and artist/album', () => {
    render(
      <TrackList
        tracks={tracks}
        currentTrackId={null}
        isPlaying={false}
        onPlayTrack={vi.fn()}
        onToggleFavorite={vi.fn()}
      />,
    )
    expect(screen.getByText('Blue in Green')).toBeInTheDocument()
    expect(screen.getAllByText(/Miles Davis/)).toHaveLength(2)
  })

  it('calls onPlayTrack with the track and its index when clicked', async () => {
    const onPlayTrack = vi.fn()
    render(
      <TrackList
        tracks={tracks}
        currentTrackId={null}
        isPlaying={false}
        onPlayTrack={onPlayTrack}
        onToggleFavorite={vi.fn()}
      />,
    )
    await userEvent.click(screen.getByText('So What'))
    expect(onPlayTrack).toHaveBeenCalledWith(tracks[1], 1)
  })

  it('toggling favorite does not also trigger onPlayTrack', async () => {
    const onPlayTrack = vi.fn()
    const onToggleFavorite = vi.fn()
    render(
      <TrackList
        tracks={tracks}
        currentTrackId={null}
        isPlaying={false}
        onPlayTrack={onPlayTrack}
        onToggleFavorite={onToggleFavorite}
      />,
    )
    await userEvent.click(screen.getAllByLabelText(/favorites/)[0])
    expect(onToggleFavorite).toHaveBeenCalledWith('1')
    expect(onPlayTrack).not.toHaveBeenCalled()
  })
})
