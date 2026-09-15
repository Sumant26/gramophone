import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MixtapeModal } from './MixtapeModal'

describe('MixtapeModal', () => {
  const mockTracks = [
    { id: '1', title: 'Coffee Chill', artist: 'Lo-Fi Artist' },
    { id: '2', title: 'Rainy Piano', artist: 'Jazz Trio' },
  ]

  it('renders nothing when closed', () => {
    const { container } = render(
      <MixtapeModal tracks={mockTracks} isOpen={false} onClose={vi.fn()} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('submits a new custom mixtape album with selected tracks', () => {
    const onCreate = vi.fn()
    const onClose = vi.fn()
    render(
      <MixtapeModal
        tracks={mockTracks}
        isOpen={true}
        onClose={onClose}
        onCreateMixtape={onCreate}
      />,
    )

    expect(
      screen.getByRole('dialog', { name: /custom vinyl pressing studio/i }),
    ).toBeInTheDocument()

    const titleInput = screen.getByPlaceholderText(/Autumn Rainy Afternoon/i)
    fireEvent.change(titleInput, { target: { value: 'My Custom LP' } })

    // Click to add first track
    fireEvent.click(screen.getByText('Coffee Chill'))

    // Click submit button
    const submitBtn = screen.getByRole('button', { name: /press record to crate/i })
    expect(submitBtn).not.toBeDisabled()
    fireEvent.click(submitBtn)

    expect(onCreate).toHaveBeenCalledWith(
      'My Custom LP',
      'Custom Mixtape',
      ['1'],
      'Cozy Cafe',
    )
    expect(onClose).toHaveBeenCalled()
  })
})
