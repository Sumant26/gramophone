import { Button } from '@/shared/components/Button'
import { Icon } from '@/shared/components/Icon'
import { formatTime } from '@/shared/utils/formatTime'

/**
 * Transport controls: previous, skip back, play/pause, stop, skip forward,
 * next, plus shuffle/repeat toggles and a scrub bar. Fully prop-driven so
 * it can be unit tested without the store or real audio.
 */
export function PlayerControls({
  isPlaying,
  position,
  duration,
  shuffle,
  repeatMode,
  disabled,
  onTogglePlayPause,
  onStop,
  onNext,
  onPrevious,
  onSkipForward,
  onSkipBackward,
  onSeek,
  onToggleShuffle,
  onCycleRepeat,
}) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-2 flex items-center gap-2 text-xs text-cozy-ink-muted">
        <span data-testid="position">{formatTime(position)}</span>
        <input
          type="range"
          aria-label="Seek"
          min={0}
          max={duration || 0}
          value={Math.min(position, duration || 0)}
          disabled={disabled || !duration}
          onChange={(e) => onSeek?.(Number(e.target.value))}
          className="h-1 flex-1 accent-cozy-accent"
        />
        <span data-testid="duration">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-center gap-1 sm:gap-2">
        <Button
          size="sm"
          active={shuffle}
          aria-label="Shuffle"
          aria-pressed={shuffle}
          onClick={onToggleShuffle}
        >
          <Icon name="shuffle" size={14} className="sm:hidden" />
          <Icon name="shuffle" size={16} className="hidden sm:inline" />
        </Button>

        <Button aria-label="Previous track" disabled={disabled} onClick={onPrevious}>
          <Icon name="previous" />
        </Button>

        <Button
          aria-label="Skip backward 10 seconds"
          disabled={disabled}
          onClick={onSkipBackward}
        >
          <Icon name="skipBackward" />
        </Button>

        <Button
          size="lg"
          variant="primary"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={disabled}
          onClick={onTogglePlayPause}
        >
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            className="sm:hidden"
            filled
          />
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={26}
            className="hidden sm:inline"
            filled
          />
        </Button>

        <Button
          aria-label="Skip forward 10 seconds"
          disabled={disabled}
          onClick={onSkipForward}
        >
          <Icon name="skipForward" />
        </Button>

        <Button aria-label="Next track" disabled={disabled} onClick={onNext}>
          <Icon name="next" />
        </Button>

        <Button aria-label="Stop" disabled={disabled} onClick={onStop}>
          <Icon name="stop" />
        </Button>

        <Button
          size="sm"
          active={repeatMode !== 'off'}
          aria-label={`Repeat: ${repeatMode}`}
          onClick={onCycleRepeat}
        >
          <Icon
            name={repeatMode === 'one' ? 'repeatOne' : 'repeat'}
            size={14}
            className="sm:hidden"
          />
          <Icon
            name={repeatMode === 'one' ? 'repeatOne' : 'repeat'}
            size={16}
            className="hidden sm:inline"
          />
        </Button>
      </div>
    </div>
  )
}
