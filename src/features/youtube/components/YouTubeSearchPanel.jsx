import { useState } from 'react'
import clsx from 'clsx'
import { Icon } from '@/shared/components/Icon'

/**
 * The "YouTube" library tab: a search box over official YouTube Data API
 * v3 results and a results list styled to match TrackList.
 * When a song is selected and played, the large search results list collapses
 * so it doesn't obstruct the turntable and player interface.
 */
export function YouTubeSearchPanel({
  query,
  results,
  isSearching,
  errorMessage,
  currentTrackId,
  isPlaying,
  onQueryChange,
  onPlayResult,
}) {
  const [isResultsHidden, setIsResultsHidden] = useState(false)

  const handleSelectResult = (result, index) => {
    setIsResultsHidden(true)
    onPlayResult(result, index)
  }

  // Find currently active playing YouTube result if available
  const activeResult = results.find((r) => `youtube:${r.videoId}` === currentTrackId)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-full border border-cozy-brass/40 bg-cozy-surface-2 px-3 py-1.5 shadow-sm">
        <Icon name="search" size={16} />
        <input
          type="search"
          aria-label="Search YouTube"
          placeholder="Search YouTube for songs, albums, live sessions…"
          value={query}
          onChange={(e) => {
            setIsResultsHidden(false)
            onQueryChange(e.target.value)
          }}
          className="w-full bg-transparent text-sm text-cozy-ink placeholder:text-cozy-ink-muted focus:outline-none"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setIsResultsHidden(false)
              onQueryChange('')
            }}
            className="rounded-full p-0.5 text-cozy-ink-muted hover:text-cozy-ink"
          >
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      {errorMessage && (
        <p role="alert" className="text-sm text-cozy-accent">
          {errorMessage}
        </p>
      )}

      {!errorMessage && isSearching && (
        <p className="text-sm text-cozy-ink-muted">Searching…</p>
      )}

      {!errorMessage && !isSearching && query.trim() && results.length === 0 && (
        <p className="text-sm text-cozy-ink-muted">No results for “{query}”.</p>
      )}

      {!errorMessage && !query.trim() && (
        <p className="text-sm text-cozy-ink-muted">
          Search YouTube&rsquo;s Music category and play a result on the turntable.
        </p>
      )}

      {/* When a track was selected, show a cozy playback card instead of blocking the screen */}
      {isResultsHidden && results.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-cozy-brass/30 bg-cozy-surface-2/70 p-4 text-center">
          <div className="flex items-center gap-3 text-left w-full">
            {activeResult?.thumbnailUrl ? (
              <img
                src={activeResult.thumbnailUrl}
                alt=""
                className="h-12 w-12 rounded-lg object-cover shadow border border-cozy-brass/30"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cozy-surface text-cozy-brass">
                <Icon name="broadcast" size={20} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-cozy-accent">
                <Icon name="volume" size={12} />
                Now Streaming from YouTube
              </span>
              <p className="truncate text-sm font-medium text-cozy-ink">
                {activeResult ? activeResult.title : 'Playing selected song'}
              </p>
              {activeResult?.channelTitle && (
                <p className="truncate text-xs text-cozy-ink-muted">
                  {activeResult.channelTitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex w-full items-center justify-between border-t border-cozy-brass/15 pt-3">
            <span className="text-xs text-cozy-ink-muted">
              {results.length} results available
            </span>
            <button
              type="button"
              onClick={() => setIsResultsHidden(false)}
              className="flex items-center gap-1 text-xs font-semibold text-cozy-brass hover:text-cozy-brass-light transition-colors"
            >
              Show Search Results ({results.length})
            </button>
          </div>
        </div>
      )}

      {/* Search results list */}
      {!isResultsHidden && results.length > 0 && (
        <ul className="divide-y divide-cozy-brass/15" aria-label="YouTube results">
          {results.map((result, index) => {
            const trackId = `youtube:${result.videoId}`
            const isCurrent = trackId === currentTrackId
            return (
              <li key={result.videoId}>
                <button
                  type="button"
                  onClick={() => handleSelectResult(result, index)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-cozy-brass/10',
                    isCurrent && 'bg-cozy-brass/15',
                  )}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-cozy-surface-2">
                    {result.thumbnailUrl ? (
                      <img
                        src={result.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Icon name="broadcast" size={16} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={clsx(
                        'block truncate text-sm',
                        isCurrent ? 'font-semibold text-cozy-accent' : 'text-cozy-ink',
                      )}
                    >
                      {result.title}
                    </span>
                    <span className="block truncate text-xs text-cozy-ink-muted">
                      {result.channelTitle}
                    </span>
                  </span>
                  {isCurrent && isPlaying && <Icon name="volume" size={14} />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
