import clsx from 'clsx'

/**
 * VacuumTube
 *
 * An authentic vintage vacuum tube audio amplifier graphic.
 * Glows with warm amber-orange filaments when tube warmth is active.
 */
export function VacuumTube({
  isActive = false,
  isPlaying = false,
  onToggle,
  size = 'md',
}) {
  const isGlowing = isActive && isPlaying

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Toggle vintage vacuum tube warmth (currently ${isActive ? 'enabled' : 'disabled'})`}
      aria-pressed={isActive}
      title="Vintage Tube Warmth (Click to toggle)"
      className={clsx(
        'group relative flex flex-col items-center justify-end transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cozy-brass',
        size === 'sm' ? 'h-16 w-8' : 'h-20 w-10',
      )}
    >
      {/* Glass Bulb Dome */}
      <div
        className={clsx(
          'relative flex w-full flex-col items-center justify-end rounded-t-full border border-white/20 px-1 pt-1.5 transition-all duration-500',
          isActive
            ? 'bg-gradient-to-b from-amber-500/15 via-orange-950/40 to-amber-900/60 shadow-[0_0_15px_rgba(255,140,30,0.3)]'
            : 'bg-gradient-to-b from-white/10 via-zinc-900/40 to-zinc-900/70 opacity-60',
          size === 'sm' ? 'h-12' : 'h-15',
        )}
      >
        {/* Glass reflection highlight */}
        <div className="absolute left-1 top-2 h-6 w-1 rounded-full bg-white/30 blur-[0.5px]" />

        {/* Internal Anode Plate Grid */}
        <div className="relative mb-1 flex h-7 w-5 flex-col items-center justify-center rounded border border-zinc-700/80 bg-zinc-900/90 shadow-inner">
          {/* Filament Wire (Glowing orange coils) */}
          <div
            className={clsx(
              'h-3 w-1.5 rounded-full transition-all duration-300',
              isActive
                ? isGlowing
                  ? 'bg-amber-300 shadow-[0_0_10px_#ff9933] animate-tube-glow'
                  : 'bg-orange-500 shadow-[0_0_6px_#ff6600]'
                : 'bg-zinc-600',
            )}
          />
          {/* Micro Grid Lines */}
          <div className="mt-0.5 flex gap-0.5">
            <span className="h-1.5 w-0.5 bg-zinc-600" />
            <span className="h-1.5 w-0.5 bg-zinc-600" />
            <span className="h-1.5 w-0.5 bg-zinc-600" />
          </div>
        </div>
      </div>

      {/* Brass Tube Base Socket */}
      <div
        className={clsx(
          'w-full rounded-b border-t border-black/40 shadow-md transition-colors',
          size === 'sm' ? 'h-3' : 'h-4',
          isActive ? 'bg-gradient-to-b from-cozy-brass to-amber-800' : 'bg-zinc-800',
        )}
      >
        <div className="mx-auto mt-0.5 h-0.5 w-4 bg-black/40 rounded-full" />
      </div>

      {/* Status indicator label underneath */}
      <span
        className={clsx(
          'mt-1 text-[9px] font-mono uppercase tracking-wider transition-colors',
          isActive ? 'text-cozy-brass font-bold' : 'text-cozy-ink-muted/50',
        )}
      >
        {isActive ? 'Tube On' : 'Tube Off'}
      </span>
    </button>
  )
}
