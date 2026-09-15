import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ZenTurntableModal } from './ZenTurntableModal'

describe('ZenTurntableModal', () => {
  const mockTrack = {
    id: 'z1',
    title: 'Warm Hearth Solitude',
    artist: 'Vinyl Ensembles',
    pictureUrl: null,
  }

  it('renders nothing when closed', () => {
    const { container } = render(<ZenTurntableModal isOpen={false} onClose={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders fullscreen mode with turntable, track info, and closes on Esc or click', () => {
    const onClose = vi.fn()
    const onTogglePlayPause = vi.fn()
    render(
      <ZenTurntableModal
        isOpen={true}
        onClose={onClose}
        currentTrack={mockTrack}
        isPlaying={true}
        onTogglePlayPause={onTogglePlayPause}
      />,
    )

    expect(screen.getAllByText('Warm Hearth Solitude').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Vinyl Ensembles').length).toBeGreaterThanOrEqual(1)

    // Test Exit button click
    fireEvent.click(screen.getByRole('button', { name: /exit zen fullscreen mode/i }))
    expect(onClose).toHaveBeenCalled()

    // Test Escape key
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
