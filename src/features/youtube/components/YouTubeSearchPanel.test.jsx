import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { YouTubeSearchPanel } from './YouTubeSearchPanel'

const results = [
  {
    videoId: 'abc123',
    title: 'Kind of Blue (Full Album)',
    channelTitle: 'Miles Davis - Topic',
    thumbnailUrl: 'https://img/medium.jpg',
  },
  {
    videoId: 'def456',
    title: 'So What (Live)',
    channelTitle: 'Miles Davis - Topic',
    thumbnailUrl: null,
  },
]

function baseProps(overrides = {}) {
  return {
    query: '',
    results: [],
    isSearching: false,
    errorMessage: null,
    currentTrackId: null,
    isPlaying: false,
    onQueryChange: vi.fn(),
    onPlayResult: vi.fn(),
    ...overrides,
  }
}

describe('YouTubeSearchPanel', () => {
  it('shows a hint when the query is empty', () => {
    render(<YouTubeSearchPanel {...baseProps()} />)
    expect(screen.getByText(/Search YouTube/)).toBeInTheDocument()
  })

  it('calls onQueryChange as the user types', async () => {
    const onQueryChange = vi.fn()
    render(<YouTubeSearchPanel {...baseProps({ onQueryChange })} />)
    await userEvent.type(screen.getByLabelText('Search YouTube'), 'lofi')
    expect(onQueryChange).toHaveBeenCalled()
  })

  it('shows a searching indicator while a search is in flight', () => {
    render(<YouTubeSearchPanel {...baseProps({ query: 'jazz', isSearching: true })} />)
    expect(screen.getByText('Searching…')).toBeInTheDocument()
  })

  it('shows a no-results message for a query with zero matches', () => {
    render(<YouTubeSearchPanel {...baseProps({ query: 'zzz', results: [] })} />)
    expect(screen.getByText(/No results for/)).toBeInTheDocument()
  })

  it('surfaces an error message instead of the results list', () => {
    render(
      <YouTubeSearchPanel
        {...baseProps({
          query: 'jazz',
          errorMessage: 'YouTube search needs an API key.',
        })}
      />,
    )
    expect(screen.getByRole('alert')).toHaveTextContent(/API key/)
  })

  it('renders every result with title and channel', () => {
    render(<YouTubeSearchPanel {...baseProps({ query: 'miles', results })} />)
    expect(screen.getByText('Kind of Blue (Full Album)')).toBeInTheDocument()
    expect(screen.getAllByText('Miles Davis - Topic')).toHaveLength(2)
  })

  it('calls onPlayResult with the result and its index when clicked', async () => {
    const onPlayResult = vi.fn()
    render(
      <YouTubeSearchPanel {...baseProps({ query: 'miles', results, onPlayResult })} />,
    )
    await userEvent.click(screen.getByText('So What (Live)'))
    expect(onPlayResult).toHaveBeenCalledWith(results[1], 1)
  })

  it('highlights the currently playing result', () => {
    render(
      <YouTubeSearchPanel
        {...baseProps({
          query: 'miles',
          results,
          currentTrackId: 'youtube:abc123',
          isPlaying: true,
        })}
      />,
    )
    expect(screen.getByText('Kind of Blue (Full Album)')).toHaveClass(
      'text-cozy-accent',
    )
  })
})
