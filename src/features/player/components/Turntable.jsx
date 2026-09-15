import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { VacuumTube } from './VacuumTube'

/**
 * The visual centerpiece: a spinning record with album art at its center,
 * interactive vinyl grooves that allow clicking to drop the needle at any track point,
 * an authentic vintage tonearm with an angled pin handle (finger-lift),
 * tactile RPM speed selector (33 ⅓, 45, 78), custom vinyl finish shaders,
 * and a mounted glowing vacuum tube amp.
 */
export function Turntable({
  isPlaying,
  albumArtUrl,
  title,
  artist,
  rpmSpeed = 33,
  vinylStyle = 'black',
  tubeWarmthEnabled = false,
  onTogglePlayPause,
  onNeedleSeek,
  onSetRpmSpeed,
  onSetVinylStyle,
  onToggleTubeWarmth,
}) {
  const platterRef = useRef(null)

  const handleRecordClick = useCallback(
    (e) => {
      if (!platterRef.current) return
      const rect = platterRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const clickX = e.clientX
      const clickY = e.clientY

      const distance = Math.hypot(clickX - centerX, clickY - centerY)
      const maxRadius = rect.width / 2
      const centerLabelRadius = maxRadius * 0.33

      // If clicked in center label, toggle play/pause
      if (distance <= centerLabelRadius) {
        onTogglePlayPause?.()
        return
      }

      // If clicked on vinyl grooves (between inner label and outer edge)
      if (onNeedleSeek) {
        // Outer edge = start of track (0.0), inner groove = end of track (1.0)
        const grooveWidth = maxRadius * 0.9 - centerLabelRadius
        const groovePos = maxRadius * 0.9 - distance
        const fraction = Math.max(0, Math.min(1, 1 - groovePos / grooveWidth))
        onNeedleSeek(fraction)
      } else {
        onTogglePlayPause?.()
      }
    },
    [onNeedleSeek, onTogglePlayPause],
  )

  const spinAnimationClass =
    rpmSpeed === 45
      ? 'animate-spin-45'
      : rpmSpeed === 78
        ? 'animate-spin-78'
        : 'animate-spin-33 animate-spin-record'

  const vinylFinishClass =
    vinylStyle === 'amber'
      ? 'vinyl-finish-amber'
      : vinylStyle === 'marble'
        ? 'vinyl-finish-marble'
        : vinylStyle === 'picture'
          ? 'vinyl-finish-picture'
          : 'vinyl-finish-black'

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col items-center select-none">
      {/* Main Turntable Deck */}
      <div
        ref={platterRef}
        className="group relative aspect-square w-full cursor-pointer"
        data-testid="turntable"
        onClick={handleRecordClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            onTogglePlayPause?.()
          }
        }}
        aria-label={
          title
            ? `${isPlaying ? 'Pause' : 'Play'} record: ${title}. Click grooves to drop needle.`
            : 'Turntable'
        }
        title={
          isPlaying
            ? 'Click center to pause, or click grooves to needle-drop'
            : 'Click to start playback'
        }
      >
        {/* Platter ambient warm glow & shadow */}
        <div className="absolute inset-[5%] translate-y-[2%] rounded-full bg-black/60 blur-xl" />
        <div
          className={clsx(
            'absolute inset-[6%] rounded-full blur-2xl transition-opacity duration-700',
            tubeWarmthEnabled
              ? 'bg-amber-500/25 opacity-100'
              : 'bg-cozy-brass/10 opacity-70',
          )}
        />

        {/* Turntable Platter Outer Ring */}
        <div className="absolute inset-[7%] rounded-full border-2 border-cozy-brass/30 bg-cozy-wood-dark shadow-[var(--shadow-cozy-inset)] transition-transform duration-300 group-hover:scale-[1.008]">
          {/* Platter Strobe Dots / Beveled Rim */}
          <div className="absolute inset-1 rounded-full border border-cozy-brass/20 bg-cozy-vinyl-groove" />
        </div>

        {/* Vinyl Record */}
        <div
          className={clsx(
            'absolute inset-[9%] rounded-full shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]',
            vinylFinishClass,
            isPlaying && spinAnimationClass,
          )}
          style={{
            backgroundImage:
              vinylStyle === 'picture' && albumArtUrl
                ? `url(${albumArtUrl})`
                : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          data-testid="record"
          role="img"
          aria-label={
            title ? `Now playing record: ${title}` : 'Record, no track loaded'
          }
        >
          {/* Concentric Groove Texture */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-60"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, transparent 28%, rgba(255, 255, 255, 0.04) 29%, transparent 30%), repeating-radial-gradient(circle at center, rgba(255, 255, 255, 0.045) 0px, rgba(255, 255, 255, 0.045) 1px, transparent 2px, transparent 5px)',
            }}
          />

          {/* Subtle Vinyl Sheen Highlights */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none opacity-40"
            style={{
              background:
                'conic-gradient(from 45deg at 50% 50%, rgba(255,255,255,0.1) 0deg, transparent 60deg, rgba(255,255,255,0.07) 180deg, transparent 240deg, rgba(255,255,255,0.1) 360deg)',
            }}
          />

          {/* Center Label / Album Art */}
          <div className="absolute inset-[33%] overflow-hidden rounded-full border-[5px] border-cozy-brass-light shadow-lg">
            {albumArtUrl && vinylStyle !== 'picture' ? (
              <img src={albumArtUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-cozy-wood to-cozy-wood-dark p-2 text-center text-[10px] font-serif-display italic text-cozy-brass-light">
                <span className="font-semibold text-cozy-ink truncate max-w-full">
                  {artist ?? 'No record selected'}
                </span>
                <span className="text-[9px] text-cozy-brass/80">
                  {rpmSpeed === 45
                    ? '45 RPM'
                    : rpmSpeed === 78
                      ? '78 RPM Lo-Fi'
                      : '33⅓ RPM'}
                </span>
              </div>
            )}
            {/* Spindle hole */}
            <div className="absolute inset-0 m-auto h-3 w-3 rounded-full border border-cozy-brass-light bg-cozy-wood-dark shadow-inner" />
          </div>
        </div>

        {/* Tonearm Resting Cradle (Pin Rest) */}
        <div
          className="absolute right-[5.5%] top-[48%] z-10 flex h-6 w-5 flex-col items-center justify-center rounded-sm border border-cozy-brass/40 bg-gradient-to-b from-cozy-wood to-cozy-wood-dark shadow-md"
          title="Tonearm resting cradle"
          aria-hidden="true"
        >
          <div className="h-2 w-3 rounded-t border-t border-cozy-brass-light bg-cozy-brass/30" />
          <div className="h-1.5 w-1 rounded-full bg-cozy-brass-light" />
        </div>

        {/* Tonearm Assembly with Pivot Base & Angled Pin Handle */}
        <motion.div
          className="pointer-events-none absolute right-[6.5%] top-[8%] z-20 h-[48%] w-[18%] origin-[30%_12%]"
          animate={{ rotate: isPlaying ? 28 : 2 }}
          transition={{ type: 'spring', stiffness: 65, damping: 14 }}
          data-testid="tonearm"
          aria-hidden="true"
        >
          {/* Gimbal / Pivot Base & Counterweight */}
          <div className="relative mb-[-4px] flex flex-col items-center">
            {/* Counterweight rear cylinder */}
            <div className="h-4 w-6 rounded-t border border-cozy-brass/60 bg-gradient-to-r from-cozy-wood-dark via-cozy-brass to-cozy-wood-dark shadow" />
            {/* Pivot Ring / Gimbal Housing */}
            <div className="h-6 w-6 rounded-full border-2 border-cozy-brass-light bg-gradient-to-br from-cozy-brass via-cozy-wood to-cozy-wood-dark shadow-md ring-2 ring-cozy-wood-dark/80">
              <div className="m-auto mt-1.5 h-2 w-2 rounded-full bg-cozy-brass-light shadow-inner" />
            </div>
          </div>

          {/* Tonearm Shaft (Polished Metallic Rod) */}
          <div className="relative mx-auto flex h-[72%] w-[4.5px] flex-col items-center">
            <div className="h-full w-full rounded-full bg-gradient-to-r from-cozy-brass-light via-white/80 to-cozy-brass shadow-md" />
          </div>

          {/* Cartridge Headshell & Angled Pin Handle (Stylus Cue Lever) */}
          <div className="relative -mt-1 ml-[12px] flex items-start">
            {/* Main Headshell Body (Angled inward) */}
            <div className="relative h-6 w-3.5 origin-top -rotate-[12deg] rounded-sm border border-cozy-brass-light/70 bg-gradient-to-b from-cozy-vinyl-groove to-black shadow-lg">
              {/* Headshell logo badge */}
              <div className="mx-auto mt-0.5 h-1 w-2 rounded-full bg-cozy-brass-light" />
              {/* Cartridge needle tip */}
              <div className="absolute -bottom-1 left-1/2 h-1.5 w-1 -translate-x-1/2 rounded-full bg-cozy-brass shadow" />
            </div>

            {/* Ergonomic Angled Pin Handle / Finger Lift */}
            <div
              className="ml-0.5 mt-1 flex origin-left rotate-[-28deg] items-center"
              title="Pin handle / finger lift"
            >
              {/* Angled Pin Lever */}
              <div className="h-[2.5px] w-4 rounded-full bg-gradient-to-r from-cozy-brass via-cozy-brass-light to-white shadow" />
              {/* Tactile Grip Tip at angle */}
              <div className="h-2 w-1.5 -rotate-12 rounded-full border border-cozy-brass-light/60 bg-cozy-brass shadow" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Deck Lower Controls: RPM Selector, Vinyl Finish Selector, and Vacuum Tube */}
      <div className="mt-3 flex w-full items-center justify-between gap-2 px-2">
        {/* RPM Speed Selector */}
        <div
          role="radiogroup"
          aria-label="Platter RPM speed"
          className="flex items-center gap-1 rounded-full border border-cozy-brass/25 bg-cozy-surface-2/80 p-1 shadow-inner"
        >
          {[33, 45, 78].map((speed) => (
            <button
              key={speed}
              type="button"
              role="radio"
              aria-checked={rpmSpeed === speed}
              onClick={() => onSetRpmSpeed?.(speed)}
              className={clsx(
                'rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all',
                rpmSpeed === speed
                  ? 'bg-cozy-brass text-cozy-on-accent shadow-sm'
                  : 'text-cozy-ink-muted hover:text-cozy-ink hover:bg-cozy-brass/10',
              )}
            >
              {speed === 33 ? '33⅓' : speed === 78 ? '78 Lo-Fi' : '45'}
            </button>
          ))}
        </div>

        {/* Vinyl Finish Picker */}
        {onSetVinylStyle && (
          <div
            role="radiogroup"
            aria-label="Vinyl record style"
            className="flex items-center gap-1.5 rounded-full border border-cozy-brass/25 bg-cozy-surface-2/80 px-2 py-1 shadow-inner"
          >
            {[
              {
                id: 'black',
                title: 'Classic Black',
                bg: 'bg-zinc-900 border-zinc-700',
              },
              {
                id: 'amber',
                title: 'Translucent Amber',
                bg: 'bg-amber-600 border-amber-400',
              },
              {
                id: 'marble',
                title: 'Smoky Marble',
                bg: 'bg-stone-500 border-stone-300',
              },
              {
                id: 'picture',
                title: 'Picture Disc',
                bg: 'bg-orange-400 border-yellow-200',
              },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={vinylStyle === v.id}
                onClick={() => onSetVinylStyle(v.id)}
                title={v.title}
                aria-label={v.title}
                className={clsx(
                  'h-3.5 w-3.5 rounded-full border transition-all',
                  v.bg,
                  vinylStyle === v.id
                    ? 'ring-2 ring-cozy-brass scale-110'
                    : 'opacity-70 hover:opacity-100',
                )}
              />
            ))}
          </div>
        )}

        {/* Vacuum Tube Amp Warmth */}
        <div className="flex items-center pl-1">
          <VacuumTube
            size="sm"
            isActive={tubeWarmthEnabled}
            isPlaying={isPlaying}
            onToggle={onToggleTubeWarmth}
          />
        </div>
      </div>
    </div>
  )
}
