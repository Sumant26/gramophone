import { motion } from 'framer-motion'

/**
 * The visual centerpiece: a spinning record with album art at its center
 * and a tonearm that pivots onto the record when playing and rests on the side
 * cradle when paused/stopped.
 * Clicking the turntable toggles play/pause.
 */
export function Turntable({
  isPlaying,
  albumArtUrl,
  title,
  artist,
  onTogglePlayPause,
}) {
  return (
    <div
      className="group relative mx-auto aspect-square w-full max-w-lg cursor-pointer select-none"
      data-testid="turntable"
      onClick={onTogglePlayPause}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onTogglePlayPause?.()
        }
      }}
      aria-label={
        title ? `${isPlaying ? 'Pause' : 'Play'} record: ${title}` : 'Turntable'
      }
      title={isPlaying ? 'Click to pause record' : 'Click to play record'}
    >
      {/* Platter shadow */}
      <div className="absolute inset-[6%] translate-y-[3%] rounded-full bg-black/40 blur-xl" />

      {/* Platter */}
      <div className="absolute inset-[8%] rounded-full bg-cozy-vinyl-groove shadow-[var(--shadow-cozy-inset)] transition-transform duration-300 group-hover:scale-[1.01]" />

      {/* Record */}
      <div
        className={`absolute inset-[10%] rounded-full bg-cozy-vinyl shadow-xl transition-transform duration-300 group-hover:scale-[1.01] ${
          isPlaying ? 'animate-spin-record' : ''
        }`}
        style={{
          backgroundImage:
            'repeating-radial-gradient(circle at center, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 2px, transparent 5px)',
        }}
        data-testid="record"
        role="img"
        aria-label={title ? `Now playing record: ${title}` : 'Record, no track loaded'}
      >
        {/* Label / album art at center */}
        <div className="absolute inset-[34%] overflow-hidden rounded-full border-4 border-cozy-brass-light shadow-md">
          {albumArtUrl ? (
            <img src={albumArtUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-cozy-accent text-center text-[10px] font-serif-display italic text-cozy-on-accent">
              {artist ?? 'No record selected'}
            </div>
          )}
          <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-cozy-wood-dark" />
        </div>
      </div>

      {/* Tonearm Resting Cradle (Pin Rest on the side) */}
      <div
        className="absolute right-[1%] top-[38%] h-4 w-4 rounded-full border border-cozy-brass/40 bg-cozy-wood-dark shadow-inner"
        title="Tonearm rest"
        aria-hidden="true"
      >
        <div className="m-auto mt-1 h-1.5 w-1.5 rounded-full bg-cozy-brass/70" />
      </div>

      {/* Tonearm / Needle Pin */}
      <motion.div
        className="pointer-events-none absolute right-[4%] top-[6%] h-[44%] w-[6%] origin-top"
        animate={{ rotate: isPlaying ? 24 : -40 }}
        transition={{ type: 'spring', stiffness: 70, damping: 13 }}
        data-testid="tonearm"
        aria-hidden="true"
      >
        <div className="mx-auto h-3.5 w-3.5 rounded-full bg-cozy-brass shadow" />
        <div className="mx-auto h-full w-[3.5px] rounded-full bg-gradient-to-b from-cozy-brass to-cozy-brass-light" />
        <div className="mx-auto -mt-1 h-2.5 w-4 rounded-sm border border-cozy-brass-light/40 bg-cozy-vinyl shadow" />
      </motion.div>
    </div>
  )
}
