import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { YouTubePlayerMount } from './YouTubePlayerMount'

describe('YouTubePlayerMount', () => {
  it('calls onMount once with the mount container element', () => {
    const onMount = vi.fn()
    render(<YouTubePlayerMount onMount={onMount} />)
    expect(onMount).toHaveBeenCalledTimes(1)
    expect(onMount.mock.calls[0][0]).toBeInstanceOf(HTMLElement)
  })

  it('does not call onMount again on re-render', () => {
    const onMount = vi.fn()
    const { rerender } = render(<YouTubePlayerMount onMount={onMount} />)
    rerender(<YouTubePlayerMount onMount={onMount} />)
    expect(onMount).toHaveBeenCalledTimes(1)
  })

  it('renders with offscreen hidden styling', () => {
    const { container } = render(<YouTubePlayerMount onMount={vi.fn()} />)
    const wrapper = container.firstChild
    expect(wrapper).toHaveAttribute('aria-hidden', 'true')
    expect(wrapper).toHaveClass('opacity-0')
  })
})
