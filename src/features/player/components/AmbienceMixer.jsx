import clsx from 'clsx'
import { Icon } from '@/shared/components/Icon'

/**
 * AmbienceMixer
 *
 * Tactile soundscape mixing panel. Allows users to layer soothing procedural
 * background audio (Rain, Fireplace, Coffee Shop, Vinyl Crackle) over their music.
 */
export function AmbienceMixer({
  isOpen,
  onClose,
  ambienceVolumes,
  onSetVolume,
  crackleEnabled,
  onToggleCrackle,
}) {
  if (!isOpen) return null

  const soundscapes = [
    {
      id: 'rain',
      name: 'Gentle Rain',
      emoji: '🌧️',
      desc: 'Soft raindrops against the window',
      volume: ambienceVolumes.rain || 0,
    },
    {
      id: 'fire',
      name: 'Fireplace',
      emoji: '🔥',
      desc: 'Warm crackling hearth embers',
      volume: ambienceVolumes.fire || 0,
    },
    {
      id: 'cafe',
      name: 'Coffee Shop',
      emoji: '☕',
      desc: 'Muffled chatter & cozy cafe hum',
      volume: ambienceVolumes.cafe || 0,
    },
  ]

  const handlePreset = (preset) => {
    if (preset === 'rainy') {
      onSetVolume('rain', 0.6)
      onSetVolume('fire', 0.2)
      onSetVolume('cafe', 0)
    } else if (preset === 'night') {
      onSetVolume('rain', 0)
      onSetVolume('fire', 0.7)
      onSetVolume('cafe', 0)
    } else if (preset === 'cafe') {
      onSetVolume('rain', 0.2)
      onSetVolume('fire', 0)
      onSetVolume('cafe', 0.5)
    } else if (preset === 'clear') {
      onSetVolume('rain', 0)
      onSetVolume('fire', 0)
      onSetVolume('cafe', 0)
    }
  }

  return (
    <>
      {/* Backdrop overlay to dismiss when clicking outside */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Soundscape Ambience Mixer"
        className="fixed right-4 top-16 z-50 w-full max-w-sm rounded-3xl border border-cozy-brass/30 bg-cozy-surface p-5 shadow-2xl sm:right-8"
        style={{
          background:
            'linear-gradient(165deg, var(--color-cozy-surface), var(--color-cozy-wood-dark) 90%)',
          boxShadow:
            '0 20px 50px -10px rgba(0,0,0,0.8), 0 0 25px rgba(212,158,82,0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cozy-brass/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📻</span>
            <h2 className="font-serif-display text-lg font-medium text-cozy-brass-light">
              Cozy Ambience Mixer
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close ambience mixer"
            className="flex h-7 w-7 items-center justify-center rounded-full text-cozy-ink-muted hover:bg-cozy-brass/10 hover:text-cozy-ink"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {/* Ambience Layer Sliders */}
        <div className="mt-4 space-y-4">
          {soundscapes.map((layer) => (
            <div key={layer.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-cozy-ink">
                  <span>{layer.emoji}</span>
                  <span>{layer.name}</span>
                </span>
                <span className="font-mono text-cozy-ink-muted">
                  {Math.round(layer.volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={layer.volume}
                onChange={(e) => onSetVolume(layer.id, parseFloat(e.target.value))}
                aria-label={`${layer.name} volume`}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-cozy-surface-2 accent-cozy-brass"
              />
              <span className="text-[10px] text-cozy-ink-muted/70">{layer.desc}</span>
            </div>
          ))}

          {/* Vinyl crackle toggle */}
          {onToggleCrackle && (
            <div className="flex items-center justify-between border-t border-cozy-brass/15 pt-3">
              <div className="flex items-center gap-2">
                <Icon name="vinylDrop" size={16} className="text-cozy-brass" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-cozy-ink">
                    Vinyl Surface Crackle
                  </span>
                  <span className="text-[10px] text-cozy-ink-muted">
                    Analog groove dust & needle floor
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggleCrackle}
                aria-pressed={crackleEnabled}
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                  crackleEnabled
                    ? 'bg-cozy-brass text-cozy-on-accent'
                    : 'bg-cozy-surface-2 text-cozy-ink-muted hover:bg-cozy-brass/20',
                )}
              >
                {crackleEnabled ? 'Active' : 'Muted'}
              </button>
            </div>
          )}
        </div>

        {/* Cozy Soundscape Presets */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-cozy-brass/15 pt-3">
          <span className="text-[11px] font-semibold text-cozy-ink-muted uppercase tracking-wider">
            Presets
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handlePreset('rainy')}
              className="rounded-full bg-cozy-surface-2 px-2.5 py-1 text-xs text-cozy-ink hover:bg-cozy-brass/20"
            >
              🌧️ Rainy Lounge
            </button>
            <button
              type="button"
              onClick={() => handlePreset('night')}
              className="rounded-full bg-cozy-surface-2 px-2.5 py-1 text-xs text-cozy-ink hover:bg-cozy-brass/20"
            >
              🔥 Hearth
            </button>
            <button
              type="button"
              onClick={() => handlePreset('cafe')}
              className="rounded-full bg-cozy-surface-2 px-2.5 py-1 text-xs text-cozy-ink hover:bg-cozy-brass/20"
            >
              ☕ Cafe Study
            </button>
            <button
              type="button"
              onClick={() => handlePreset('clear')}
              className="rounded-full bg-cozy-surface-2 px-2.5 py-1 text-xs text-cozy-ink-muted hover:text-cozy-ink hover:bg-cozy-brass/20"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
