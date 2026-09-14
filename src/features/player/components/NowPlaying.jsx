import { Icon } from '@/shared/components/Icon'
import { Button } from '@/shared/components/Button'

export function NowPlaying({ track, onToggleFavorite }) {
  if (!track) {
    return (
      <div className="w-full text-center text-cozy-ink-muted">
        <p className="font-serif-display text-lg">Nothing spinning yet</p>
        <p className="text-sm">Pick a song from your library to get started.</p>
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-full min-w-0 items-center justify-between gap-3 px-1 text-left">
      <div className="min-w-0 flex-1 overflow-hidden">
        <h2
          className="truncate font-serif-display text-lg sm:text-xl text-cozy-ink"
          title={track.title}
        >
          {track.title}
        </h2>
        <p
          className="truncate text-xs sm:text-sm text-cozy-ink-muted"
          title={`${track.artist}${track.album ? ` — ${track.album}` : ''}`}
        >
          {track.artist}
          {track.album ? ` — ${track.album}` : ''}
        </p>
      </div>
      <Button
        size="sm"
        active={track.isFavorite}
        aria-label={track.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={track.isFavorite}
        onClick={() => onToggleFavorite?.(track.id)}
      >
        <Icon name="heart" size={16} filled={track.isFavorite} />
      </Button>
    </div>
  )
}
