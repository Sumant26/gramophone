import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VacuumTube } from './VacuumTube'

describe('VacuumTube', () => {
  it('renders with inactive label and calls onToggle on click', () => {
    const onToggle = vi.fn()
    render(<VacuumTube isActive={false} onToggle={onToggle} />)

    const button = screen.getByRole('button', { name: /vacuum tube warmth/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(button)
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('renders active state when isActive is true', () => {
    render(<VacuumTube isActive={true} isPlaying={true} />)
    const button = screen.getByRole('button', { name: /vacuum tube warmth/i })
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Tube On')).toBeInTheDocument()
  })
})
