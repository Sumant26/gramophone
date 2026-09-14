import clsx from 'clsx'
import { Icon } from '@/shared/components/Icon'

/**
 * The "YouTube" library tab: a search box over official YouTube Data API
 * v3 results (scoped to the Music category — see youtubeApi.js) and a
 * results list styled to match TrackList. Playing a result routes through
 * the same `onPlayResult(result, index)` → usePlayerStore.playQueue flow
 * as local tracks; the only difference lives in how the track objects are
 * shaped (see toQueueTrack.js) and which engine ends up playing them.
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
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-full border border-cozy-brass/40 bg-cozy-surface-2 px-3 py-1.5">
        <Icon name="search" size={16} />
        <input
          type="search"
          aria-label="Search YouTube"
          placeholder="Search YouTube for songs, albums, live sessions…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="w-full bg-transparent text-sm text-cozy-ink placeholder:text-cozy-ink-muted focus:outline-none"
        />
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
          Search YouTube&rsquo;s Music category and play a result on the little screen
          in the cabinet — the turntable keeps spinning right along with it.
        </p>
      )}

      {results.length > 0 && (
        <ul className="divide-y divide-cozy-brass/15" aria-label="YouTube results">
          {results.map((result, index) => {
            const trackId = `youtube:${result.videoId}`
            const isCurrent = trackId === currentTrackId
            return (
              <li key={result.videoId}>
                <button
                  type="button"
                  onClick={() => onPlayResult(result, index)}
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
