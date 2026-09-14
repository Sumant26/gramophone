import { motion } from 'framer-motion'

/**
 * The visual centerpiece: a spinning record with album art at its center
 * and a tonearm that pivots onto the record when playing and lifts off
 * when paused/stopped. Purely presentational — driven by props, not by
 * store access, so it stays easy to test and reuse.
 *
 * Deliberately has no background/furniture of its own — it's meant to sit
 * directly on the wood-toned "cabinet" panel that hosts it (see App.jsx),
 * like a real turntable resting on a console rather than floating in a
 * card.
 */
export function Turntable({ isPlaying, albumArtUrl, title, artist }) {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-lg select-none"
      data-testid="turntable"
    >
      {/* Platter shadow */}
      <div className="absolute inset-[6%] translate-y-[3%] rounded-full bg-black/40 blur-xl" />

      {/* Platter */}
      <div className="absolute inset-[8%] rounded-full bg-cozy-vinyl-groove shadow-[var(--shadow-cozy-inset)]" />

      {/* Record */}
      <div
        className={`absolute inset-[10%] rounded-full bg-cozy-vinyl shadow-xl ${
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

      {/* Tonearm */}
      <motion.div
        className="absolute right-[4%] top-[6%] h-[44%] w-[6%] origin-top"
        animate={{ rotate: isPlaying ? 24 : -18 }}
        transition={{ type: 'spring', stiffness: 80, damping: 14 }}
        data-testid="tonearm"
        aria-hidden="true"
      >
        <div className="mx-auto h-3 w-3 rounded-full bg-cozy-brass shadow" />
        <div className="mx-auto h-full w-[3px] rounded-full bg-gradient-to-b from-cozy-brass to-cozy-brass-light" />
        <div className="mx-auto -mt-1 h-2 w-4 rounded-sm bg-cozy-vinyl shadow" />
      </motion.div>
    </div>
  )
}
