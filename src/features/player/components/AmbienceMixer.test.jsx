import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AmbienceMixer } from './AmbienceMixer'

describe('AmbienceMixer', () => {
  const defaultVolumes = { rain: 0.3, fire: 0, cafe: 0 }

  it('renders nothing when closed', () => {
    const { container } = render(
      <AmbienceMixer
        isOpen={false}
        ambienceVolumes={defaultVolumes}
        onSetVolume={vi.fn()}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders soundscape sliders and preset buttons when open', () => {
    const onSetVolume = vi.fn()
    const onClose = vi.fn()
    render(
      <AmbienceMixer
        isOpen={true}
        onClose={onClose}
        ambienceVolumes={defaultVolumes}
        onSetVolume={onSetVolume}
      />,
    )

    expect(screen.getByRole('dialog', { name: /ambience mixer/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/gentle rain volume/i)).toHaveValue('0.3')

    const slider = screen.getByLabelText(/gentle rain volume/i)
    fireEvent.change(slider, { target: { value: '0.8' } })
    expect(onSetVolume).toHaveBeenCalledWith('rain', 0.8)

    // Preset
    const rainyPreset = screen.getByRole('button', { name: /rainy lounge/i })
    fireEvent.click(rainyPreset)
    expect(onSetVolume).toHaveBeenCalledWith('rain', 0.6)
  })
})
