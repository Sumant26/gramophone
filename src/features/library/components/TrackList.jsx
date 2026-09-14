import clsx from 'clsx'
import { Icon } from '@/shared/components/Icon'
import { formatTime } from '@/shared/utils/formatTime'

export function TrackList({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
}) {
  if (tracks.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-cozy-ink-muted">
        No songs here yet. Add some music to get started.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-cozy-brass/15" aria-label="Track list">
      {tracks.map((track, index) => {
        const isCurrent = track.id === currentTrackId
        return (
          <li key={track.id}>
            <button
              type="button"
              onClick={() => onPlayTrack(track, index)}
              className={clsx(
                'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-cozy-brass/10',
                isCurrent && 'bg-cozy-brass/15',
              )}
            >
              <span className="w-5 shrink-0 text-center text-xs text-cozy-ink-muted">
                {isCurrent && isPlaying ? <Icon name="volume" size={14} /> : index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={clsx(
                    'block truncate text-sm',
                    isCurrent ? 'font-semibold text-cozy-accent' : 'text-cozy-ink',
                  )}
                >
                  {track.title}
                </span>
                <span className="block truncate text-xs text-cozy-ink-muted">
                  {track.artist} — {track.album}
                </span>
              </span>
              {track.durationSeconds ? (
                <span className="shrink-0 text-xs text-cozy-ink-muted">
                  {formatTime(track.durationSeconds)}
                </span>
              ) : null}
              <span
                role="button"
                tabIndex={0}
                aria-label={
                  track.isFavorite ? 'Remove from favorites' : 'Add to favorites'
                }
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(track.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    e.stopPropagation()
                    onToggleFavorite(track.id)
                  }
                }}
                className="shrink-0 rounded-full p-1 text-cozy-ink-muted hover:text-cozy-accent"
              >
                <Icon name="heart" size={14} filled={track.isFavorite} />
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
