import { Icon } from '@/shared/components/Icon'
import { Button } from '@/shared/components/Button'

export function NowPlaying({ track, onToggleFavorite }) {
  if (!track) {
    return (
      <div className="text-center text-cozy-ink-muted">
        <p className="font-serif-display text-lg">Nothing spinning yet</p>
        <p className="text-sm">Pick a song from your library to get started.</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 text-center">
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-serif-display text-xl text-cozy-ink">
          {track.title}
        </h2>
        <p className="truncate text-sm text-cozy-ink-muted">
          {track.artist} — {track.album}
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
