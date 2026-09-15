import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/shared/components/Icon'

/**
 * MixtapeModal
 *
 * Custom Vinyl Pressing Studio. Allows users to combine favorite tracks
 * (local or YouTube) into a bespoke vinyl LP with custom sleeve title and mood tag.
 */
export function MixtapeModal({ tracks, isOpen, onClose, onCreateMixtape }) {
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [selectedMood, setSelectedMood] = useState('Cozy Cafe')
  const [selectedTrackIds, setSelectedTrackIds] = useState(new Set())

  if (!isOpen) return null

  const moods = [
    { id: 'Cozy Cafe', label: '☕ Cozy Cafe' },
    { id: 'Rainy Days', label: '🌧️ Rainy Days' },
    { id: 'Late Night Focus', label: '🌙 Late Night Focus' },
    { id: 'Sunday Morning', label: '☀️ Sunday Morning' },
    { id: 'Acoustic Warmth', label: '🎸 Acoustic Warmth' },
  ]

  const toggleTrack = (id) => {
    setSelectedTrackIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || selectedTrackIds.size === 0) return
    onCreateMixtape(
      title.trim(),
      artist.trim() || 'Custom Mixtape',
      Array.from(selectedTrackIds),
      selectedMood,
    )
    onClose()
  }

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Custom Vinyl Pressing Studio"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative flex w-full max-w-xl flex-col rounded-3xl border border-cozy-brass/30 bg-cozy-surface p-6 shadow-2xl max-h-[90vh] overflow-hidden"
          style={{
            background:
              'linear-gradient(165deg, var(--color-cozy-surface), var(--color-cozy-wood-dark) 95%)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-cozy-brass/15 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📀</span>
              <div>
                <h2 className="font-serif-display text-lg font-bold text-cozy-brass-light">
                  Press a Custom Vinyl LP
                </h2>
                <p className="text-xs text-cozy-ink-muted">
                  Bundle your favorite tracks into a personalized physical record
                  sleeve.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close mixtape studio"
              className="flex h-8 w-8 items-center justify-center rounded-full text-cozy-ink-muted hover:bg-cozy-brass/10 hover:text-cozy-ink"
            >
              <Icon name="close" size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col flex-1 min-h-0">
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="mixtape-title-input"
                  className="block text-xs font-semibold text-cozy-ink mb-1"
                >
                  Album Sleeve Title
                </label>
                <input
                  id="mixtape-title-input"
                  type="text"
                  required
                  placeholder="e.g., Autumn Rainy Afternoon Vol. 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-cozy-surface-2 px-3 py-2 text-sm text-cozy-ink placeholder:text-cozy-ink-muted/50 border border-cozy-brass/20 focus:border-cozy-brass focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="mixtape-artist-input"
                  className="block text-xs font-semibold text-cozy-ink mb-1"
                >
                  Curator / Artist Name (Optional)
                </label>
                <input
                  id="mixtape-artist-input"
                  type="text"
                  placeholder="e.g., My Vinyl Collection"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full rounded-xl bg-cozy-surface-2 px-3 py-2 text-sm text-cozy-ink placeholder:text-cozy-ink-muted/50 border border-cozy-brass/20 focus:border-cozy-brass focus:outline-none"
                />
              </div>

              {/* Mood divider selection */}
              <div>
                <span className="block text-xs font-semibold text-cozy-ink mb-1">
                  Select Crate Mood Tag
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {moods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMood(m.id)}
                      className={`rounded-full px-3 py-1 text-xs transition-colors ${
                        selectedMood === m.id
                          ? 'bg-cozy-brass font-bold text-cozy-on-accent'
                          : 'bg-cozy-surface-2 text-cozy-ink-muted hover:text-cozy-ink hover:bg-cozy-brass/10'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Track Selector List */}
            <div className="mt-4 flex-1 min-h-0 flex flex-col">
              <span className="block text-xs font-semibold text-cozy-ink mb-1.5">
                Select Tracks for Side A & B ({selectedTrackIds.size} selected)
              </span>
              <div className="flex-1 min-h-[140px] max-h-[220px] overflow-y-auto space-y-1 rounded-2xl bg-cozy-surface-2/60 p-2 border border-cozy-brass/15">
                {tracks.length === 0 ? (
                  <p className="text-center py-6 text-xs text-cozy-ink-muted">
                    No tracks in library yet. Add music or YouTube tracks first!
                  </p>
                ) : (
                  tracks.map((t) => {
                    const isSelected = selectedTrackIds.has(t.id)
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTrack(t.id)}
                        className={`flex w-full items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                          isSelected
                            ? 'bg-cozy-brass/20 text-cozy-accent font-semibold'
                            : 'hover:bg-cozy-brass/10 text-cozy-ink'
                        }`}
                      >
                        <span className="truncate pr-2">{t.title}</span>
                        <span className="shrink-0 font-mono text-[10px] opacity-70">
                          {isSelected ? '✓ Added' : '✚ Add'}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-end gap-3 border-t border-cozy-brass/15 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-cozy-ink-muted hover:text-cozy-ink"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || selectedTrackIds.size === 0}
                className="flex items-center gap-1.5 rounded-full bg-cozy-brass px-5 py-2 text-xs font-bold text-cozy-on-accent shadow-md transition-transform hover:scale-105 disabled:opacity-50"
              >
                <span>📀</span>
                <span>Press Record to Crate</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
