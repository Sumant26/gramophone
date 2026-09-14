import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useKeyboardShortcuts } from './useKeyboardShortcuts'

function TestHarness({ handlers, enabled }) {
  useKeyboardShortcuts(handlers, enabled)
  return <input aria-label="search" />
}

describe('useKeyboardShortcuts', () => {
  it('calls onTogglePlayPause on space', async () => {
    const onTogglePlayPause = vi.fn()
    render(<TestHarness handlers={{ onTogglePlayPause }} enabled />)
    await userEvent.click(document.body)
    await userEvent.keyboard(' ')
    expect(onTogglePlayPause).toHaveBeenCalledTimes(1)
  })

  it('calls onSkipForward/onSkipBackward on arrow keys without shift', async () => {
    const onSkipForward = vi.fn()
    const onSkipBackward = vi.fn()
    render(<TestHarness handlers={{ onSkipForward, onSkipBackward }} enabled />)
    await userEvent.click(document.body)
    await userEvent.keyboard('{ArrowRight}{ArrowLeft}')
    expect(onSkipForward).toHaveBeenCalledTimes(1)
    expect(onSkipBackward).toHaveBeenCalledTimes(1)
  })

  it('calls onNext/onPrevious on shift+arrow keys', async () => {
    const onNext = vi.fn()
    const onPrevious = vi.fn()
    render(<TestHarness handlers={{ onNext, onPrevious }} enabled />)
    await userEvent.click(document.body)
    await userEvent.keyboard('{Shift>}{ArrowRight}{ArrowLeft}{/Shift}')
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onPrevious).toHaveBeenCalledTimes(1)
  })

  it('does not fire shortcuts while typing in an input', async () => {
    const onTogglePlayPause = vi.fn()
    render(<TestHarness handlers={{ onTogglePlayPause }} enabled />)
    const input = screen.getByLabelText('search')
    await userEvent.click(input)
    await userEvent.keyboard(' ')
    expect(onTogglePlayPause).not.toHaveBeenCalled()
  })

  it('does nothing when disabled', async () => {
    const onTogglePlayPause = vi.fn()
    render(<TestHarness handlers={{ onTogglePlayPause }} enabled={false} />)
    await userEvent.click(document.body)
    await userEvent.keyboard(' ')
    expect(onTogglePlayPause).not.toHaveBeenCalled()
  })
})
