import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/shared/components/Icon'
import { formatTime } from '@/shared/utils/formatTime'

/**
 * GatefoldModal
 *
 * An authentic physical 2-panel cardboard gatefold record jacket experience.
 * Displays large album artwork, liner notes, track list, and custom personal notes.
 */
export function GatefoldModal({
  album,
  isOpen,
  onClose,
  onPlayTrack,
  currentTrackId,
  isPlaying,
}) {
  const [personalNote, setPersonalNote] = useState('')

  if (!isOpen || !album) return null

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Gatefold Liner Notes: ${album.title}`}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-2 border-cozy-brass/40 shadow-2xl md:flex-row max-h-[90vh]"
          style={{
            background:
              'linear-gradient(135deg, #2b1d16 0%, #1c110b 50%, #2e1d15 100%)',
            boxShadow:
              '0 25px 60px -15px rgba(0,0,0,0.8), 0 0 35px rgba(212,158,82,0.15)',
          }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gatefold jacket"
            className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-cozy-ink hover:bg-cozy-brass hover:text-cozy-on-accent transition-colors"
          >
            <Icon name="close" size={18} />
          </button>

          {/* Left Panel: Album Art & Spine */}
          <div className="relative flex flex-1 flex-col items-center justify-center p-6 border-b border-cozy-brass/20 md:border-b-0 md:border-r">
            {/* Cardboard wear and texture overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/5 pointer-events-none" />

            {/* Album Cover Art */}
            <div className="relative aspect-square w-full max-w-[280px] rounded-2xl overflow-hidden shadow-2xl border border-cozy-brass/30">
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-cozy-surface-2 p-4 text-center">
                  <Icon name="vinylDrop" size={48} className="text-cozy-brass mb-2" />
                  <span className="font-serif-display text-lg text-cozy-ink">
                    {album.title}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Artist */}
            <div className="mt-4 text-center">
              <h2 className="font-serif-display text-xl font-bold text-cozy-brass-light">
                {album.title}
              </h2>
              <p className="font-serif-display italic text-sm text-cozy-ink-muted">
                {album.artist}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="rounded-full bg-cozy-brass/20 px-2.5 py-0.5 text-xs text-cozy-accent font-semibold">
                  {album.tracks.length} {album.tracks.length === 1 ? 'Track' : 'Tracks'}
                </span>
                <span className="text-xs text-cozy-ink-muted/80">33⅓ RPM Stereo</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Liner Notes & Tracklist */}
          <div className="flex flex-1 flex-col p-6 overflow-y-auto max-h-[80vh] md:max-h-[85vh]">
            <div className="border-b border-cozy-brass/20 pb-2 mb-4">
              <span className="text-[11px] font-mono tracking-widest text-cozy-brass uppercase">
                Official Liner Notes
              </span>
              <h3 className="font-serif-display text-lg text-cozy-ink font-semibold">
                Tracklist & Listening Notes
              </h3>
            </div>

            {/* Tracklist */}
            <div className="space-y-1.5 mb-6">
              {album.tracks.map((item, idx) => {
                const isCurrent = item.track.id === currentTrackId
                return (
                  <button
                    key={item.track.id}
                    type="button"
                    onClick={() => onPlayTrack(item.track, item.originalIndex)}
                    className={`flex w-full items-center justify-between p-2 rounded-xl text-left transition-colors ${
                      isCurrent
                        ? 'bg-cozy-brass/25 text-cozy-accent font-semibold'
                        : 'hover:bg-cozy-brass/10 text-cozy-ink'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-xs opacity-60 w-4 text-right">
                        {idx + 1}.
                      </span>
                      <span className="text-sm truncate">{item.track.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrent && isPlaying && (
                        <span className="text-xs text-cozy-accent animate-pulse">
                          ▶ Playing
                        </span>
                      )}
                      {item.track.durationSeconds && (
                        <span className="font-mono text-xs opacity-60">
                          {formatTime(item.track.durationSeconds)}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Collector's Personal Notes */}
            <div className="mt-auto border-t border-cozy-brass/20 pt-4">
              <label
                htmlFor="liner-notes-input"
                className="block text-xs font-serif-display italic text-cozy-brass-light mb-1"
              >
                Collector&apos;s Vinyl Notes & Memories:
              </label>
              <textarea
                id="liner-notes-input"
                rows={3}
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                placeholder="Write your thoughts or memories about this record..."
                className="w-full rounded-xl bg-cozy-surface-2 p-2.5 text-xs text-cozy-ink placeholder:text-cozy-ink-muted/50 border border-cozy-brass/20 focus:border-cozy-brass focus:outline-none"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
