import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GatefoldModal } from './GatefoldModal'

describe('GatefoldModal', () => {
  const mockAlbum = {
    key: 'Test Album:::Test Artist',
    title: 'Test Album',
    artist: 'Test Artist',
    coverUrl: null,
    tracks: [
      {
        track: { id: 't1', title: 'Side A Track 1', durationSeconds: 180 },
        originalIndex: 0,
      },
      {
        track: { id: 't2', title: 'Side A Track 2', durationSeconds: 210 },
        originalIndex: 1,
      },
    ],
  }

  it('renders nothing when closed', () => {
    const { container } = render(
      <GatefoldModal album={mockAlbum} isOpen={false} onClose={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders liner notes and plays selected track', () => {
    const onPlayTrack = vi.fn()
    const onClose = vi.fn()
    render(
      <GatefoldModal
        album={mockAlbum}
        isOpen={true}
        onClose={onClose}
        onPlayTrack={onPlayTrack}
        currentTrackId="t1"
        isPlaying={true}
      />,
    )

    expect(
      screen.getByRole('dialog', { name: /gatefold liner notes/i }),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Test Album').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Side A Track 1')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Side A Track 2'))
    expect(onPlayTrack).toHaveBeenCalledWith(mockAlbum.tracks[1].track, 1)

    fireEvent.click(screen.getByRole('button', { name: /close gatefold/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
