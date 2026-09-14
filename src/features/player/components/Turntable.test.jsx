import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Turntable } from './Turntable'

describe('Turntable', () => {
  it('spins the record when playing', () => {
    render(<Turntable isPlaying title="Blue in Green" artist="Miles Davis" />)
    expect(screen.getByTestId('record')).toHaveClass('animate-spin-record')
  })

  it('does not spin the record when paused', () => {
    render(<Turntable isPlaying={false} title="Blue in Green" artist="Miles Davis" />)
    expect(screen.getByTestId('record')).not.toHaveClass('animate-spin-record')
  })

  it('renders album art when provided', () => {
    render(
      <Turntable isPlaying albumArtUrl="blob:cover.png" title="Song" artist="Artist" />,
    )
    expect(screen.getByRole('img', { hidden: true })).toBeTruthy()
  })

  it('shows a fallback label when there is no track loaded', () => {
    render(<Turntable isPlaying={false} />)
    expect(screen.getByText('No record selected')).toBeInTheDocument()
  })

  it('calls onTogglePlayPause when clicked', () => {
    const onToggle = vi.fn()
    render(
      <Turntable
        isPlaying={false}
        title="Kind of Blue"
        artist="Miles Davis"
        onTogglePlayPause={onToggle}
      />,
    )
    fireEvent.click(screen.getByTestId('turntable'))
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('exposes an accessible label reflecting the current title', () => {
    render(<Turntable isPlaying title="Kind of Blue" artist="Miles Davis" />)
    expect(screen.getByLabelText('Pause record: Kind of Blue')).toBeInTheDocument()
  })
})
