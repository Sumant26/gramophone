import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { YouTubePlayerMount } from './YouTubePlayerMount'

describe('YouTubePlayerMount', () => {
  it('calls onMount once with the mount container element', () => {
    const onMount = vi.fn()
    render(<YouTubePlayerMount onMount={onMount} hasYouTubeTrack={false} />)
    expect(onMount).toHaveBeenCalledTimes(1)
    expect(onMount.mock.calls[0][0]).toBeInstanceOf(HTMLElement)
  })

  it('does not call onMount again on re-render', () => {
    const onMount = vi.fn()
    const { rerender } = render(
      <YouTubePlayerMount onMount={onMount} hasYouTubeTrack={false} />,
    )
    rerender(<YouTubePlayerMount onMount={onMount} hasYouTubeTrack={true} />)
    expect(onMount).toHaveBeenCalledTimes(1)
  })

  it('shows a placeholder caption when no YouTube track is active', () => {
    render(<YouTubePlayerMount onMount={vi.fn()} hasYouTubeTrack={false} />)
    expect(screen.getByText(/search below to play something/i)).toBeInTheDocument()
  })

  it('hides the placeholder caption once a YouTube track is active', () => {
    render(<YouTubePlayerMount onMount={vi.fn()} hasYouTubeTrack={true} />)
    expect(
      screen.queryByText(/search below to play something/i),
    ).not.toBeInTheDocument()
  })
})
