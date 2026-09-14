import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VolumeKnob } from './VolumeKnob'

describe('VolumeKnob', () => {
  it('exposes the current value via ARIA slider attributes', () => {
    render(<VolumeKnob value={0.5} onChange={vi.fn()} />)
    const slider = screen.getByRole('slider', { name: 'Volume' })
    expect(slider).toHaveAttribute('aria-valuenow', '50')
  })

  it('increases volume on ArrowUp and decreases on ArrowDown', async () => {
    const onChange = vi.fn()
    render(<VolumeKnob value={0.5} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: 'Volume' })
    slider.focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(onChange).toHaveBeenLastCalledWith(0.55)
    await userEvent.keyboard('{ArrowDown}')
    expect(onChange).toHaveBeenLastCalledWith(0.45)
  })

  it('jumps to min/max on Home/End', async () => {
    const onChange = vi.fn()
    render(<VolumeKnob value={0.5} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: 'Volume' })
    slider.focus()
    await userEvent.keyboard('{Home}')
    expect(onChange).toHaveBeenLastCalledWith(0)
    await userEvent.keyboard('{End}')
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('clamps at 1 even with a large step', async () => {
    const onChange = vi.fn()
    render(<VolumeKnob value={0.98} onChange={onChange} />)
    const slider = screen.getByRole('slider', { name: 'Volume' })
    slider.focus()
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}')
    expect(onChange).toHaveBeenLastCalledWith(1)
  })
})
