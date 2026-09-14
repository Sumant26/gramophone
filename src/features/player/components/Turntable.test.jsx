import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('exposes an accessible label reflecting the current title', () => {
    render(<Turntable isPlaying title="Kind of Blue" artist="Miles Davis" />)
    expect(
      screen.getByLabelText('Now playing record: Kind of Blue'),
    ).toBeInTheDocument()
  })
})
