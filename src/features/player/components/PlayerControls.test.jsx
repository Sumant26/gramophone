import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerControls } from './PlayerControls'

function renderControls(overrides = {}) {
  const handlers = {
    onTogglePlayPause: vi.fn(),
    onStop: vi.fn(),
    onNext: vi.fn(),
    onPrevious: vi.fn(),
    onSkipForward: vi.fn(),
    onSkipBackward: vi.fn(),
    onSeek: vi.fn(),
    onToggleShuffle: vi.fn(),
    onCycleRepeat: vi.fn(),
  }
  render(
    <PlayerControls
      isPlaying={false}
      position={30}
      duration={180}
      shuffle={false}
      repeatMode="off"
      {...handlers}
      {...overrides}
    />,
  )
  return handlers
}

describe('PlayerControls', () => {
  it('shows a Play label when paused and calls onTogglePlayPause when clicked', async () => {
    const handlers = renderControls({ isPlaying: false })
    await userEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(handlers.onTogglePlayPause).toHaveBeenCalledTimes(1)
  })

  it('shows a Pause label when playing', () => {
    renderControls({ isPlaying: true })
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument()
  })

  it('wires up next/previous/stop/skip buttons', async () => {
    const handlers = renderControls()
    await userEvent.click(screen.getByRole('button', { name: 'Next track' }))
    await userEvent.click(screen.getByRole('button', { name: 'Previous track' }))
    await userEvent.click(screen.getByRole('button', { name: 'Stop' }))
    await userEvent.click(
      screen.getByRole('button', { name: 'Skip forward 10 seconds' }),
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Skip backward 10 seconds' }),
    )
    expect(handlers.onNext).toHaveBeenCalledTimes(1)
    expect(handlers.onPrevious).toHaveBeenCalledTimes(1)
    expect(handlers.onStop).toHaveBeenCalledTimes(1)
    expect(handlers.onSkipForward).toHaveBeenCalledTimes(1)
    expect(handlers.onSkipBackward).toHaveBeenCalledTimes(1)
  })

  it('displays formatted position and duration', () => {
    renderControls({ position: 65, duration: 185 })
    expect(screen.getByTestId('position')).toHaveTextContent('1:05')
    expect(screen.getByTestId('duration')).toHaveTextContent('3:05')
  })

  it('reflects shuffle and repeat state via aria-pressed / label', () => {
    renderControls({ shuffle: true, repeatMode: 'one' })
    expect(screen.getByRole('button', { name: 'Shuffle' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Repeat: one' })).toBeInTheDocument()
  })

  it('disables transport buttons when disabled=true', () => {
    renderControls({ disabled: true })
    expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next track' })).toBeDisabled()
  })
})
