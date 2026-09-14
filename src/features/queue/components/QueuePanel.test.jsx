import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueuePanel } from './QueuePanel'

const queue = [
  { id: '1', title: 'Blue in Green' },
  { id: '2', title: 'So What' },
]

describe('QueuePanel', () => {
  it('shows an empty state when the queue has no tracks', () => {
    render(
      <QueuePanel queue={[]} queueIndex={-1} onSelect={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByText('Queue is empty.')).toBeInTheDocument()
  })

  it('highlights the currently playing queue index', () => {
    render(
      <QueuePanel queue={queue} queueIndex={1} onSelect={vi.fn()} onClose={vi.fn()} />,
    )
    expect(screen.getByText('So What').closest('button')).toHaveClass('font-semibold')
  })

  it('calls onSelect with the clicked index', async () => {
    const onSelect = vi.fn()
    render(
      <QueuePanel queue={queue} queueIndex={0} onSelect={onSelect} onClose={vi.fn()} />,
    )
    await userEvent.click(screen.getByText('So What'))
    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <QueuePanel queue={queue} queueIndex={0} onSelect={vi.fn()} onClose={onClose} />,
    )
    await userEvent.click(screen.getByLabelText('Close queue'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
