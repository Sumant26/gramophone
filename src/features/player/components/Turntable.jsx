import { motion } from 'framer-motion'

/**
 * The visual centerpiece: a spinning record with album art at its center
 * and an authentic vintage tonearm with an angled pin handle (finger-lift)
 * that pivots onto the record when playing and rests neatly on its cradle
 * when paused/stopped.
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
      {/* Platter ambient warm glow & shadow */}
      <div className="absolute inset-[5%] translate-y-[2%] rounded-full bg-black/60 blur-xl" />
      <div className="absolute inset-[6%] rounded-full bg-cozy-brass/10 blur-2xl" />

      {/* Turntable Platter Outer Ring */}
      <div className="absolute inset-[7%] rounded-full border-2 border-cozy-brass/30 bg-cozy-wood-dark shadow-[var(--shadow-cozy-inset)] transition-transform duration-300 group-hover:scale-[1.008]">
        {/* Platter Strobe Dots / Beveled Rim */}
        <div className="absolute inset-1 rounded-full border border-cozy-brass/20 bg-cozy-vinyl-groove" />
      </div>

      {/* Vinyl Record */}
      <div
        className={`absolute inset-[9%] rounded-full bg-cozy-vinyl shadow-2xl transition-transform duration-300 group-hover:scale-[1.01] ${
          isPlaying ? 'animate-spin-record' : ''
        }`}
        style={{
          backgroundImage:
            'radial-gradient(circle at center, transparent 28%, rgba(255, 255, 255, 0.04) 29%, transparent 30%), repeating-radial-gradient(circle at center, rgba(255, 255, 255, 0.045) 0px, rgba(255, 255, 255, 0.045) 1px, transparent 2px, transparent 5px)',
        }}
        data-testid="record"
        role="img"
        aria-label={title ? `Now playing record: ${title}` : 'Record, no track loaded'}
      >
        {/* Subtle Vinyl Sheen Highlights */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none opacity-40"
          style={{
            background:
              'conic-gradient(from 45deg at 50% 50%, rgba(255,255,255,0.08) 0deg, transparent 60deg, rgba(255,255,255,0.06) 180deg, transparent 240deg, rgba(255,255,255,0.08) 360deg)',
          }}
        />

        {/* Center Label / Album Art */}
        <div className="absolute inset-[33%] overflow-hidden rounded-full border-[5px] border-cozy-brass-light shadow-lg">
          {albumArtUrl ? (
            <img src={albumArtUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-cozy-wood to-cozy-wood-dark p-2 text-center text-[10px] font-serif-display italic text-cozy-brass-light">
              <span className="font-semibold text-cozy-ink">
                {artist ?? 'No record selected'}
              </span>
              <span className="text-[9px] text-cozy-brass/80">33⅓ RPM</span>
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
  )
}
