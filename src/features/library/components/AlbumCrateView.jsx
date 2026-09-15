import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { Icon } from '@/shared/components/Icon'
import { formatTime } from '@/shared/utils/formatTime'

/**
 * Groups tracks into albums and presents them as physical vinyl record jackets
 * with artwork covers, peeking vinyl discs, and track selectors.
 */
export function AlbumCrateView({
  tracks,
  currentTrackId,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
}) {
  const [expandedAlbumKey, setExpandedAlbumKey] = useState(null)

  // Group tracks by album + artist
  const albums = useMemo(() => {
    const map = new Map()

    tracks.forEach((track, index) => {
      const albumTitle = track.album || 'Single & Untitled Records'
      const artistName = track.artist || 'Various Artists'
      const key = `${albumTitle}:::${artistName}`

      if (!map.has(key)) {
        map.set(key, {
          key,
          title: albumTitle,
          artist: artistName,
          coverUrl: track.pictureUrl || null,
          tracks: [],
        })
      }
      map.get(key).tracks.push({ track, originalIndex: index })
    })

    return Array.from(map.values())
  }, [tracks])

  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-cozy-ink-muted">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full border border-cozy-brass/30 bg-cozy-surface-2 text-cozy-brass">
          <Icon name="vinylDrop" size={28} />
        </div>
        <p className="font-serif-display text-base text-cozy-ink">No songs here yet</p>
        <p className="mt-1 max-w-sm text-xs text-cozy-ink-muted">
          Add some music or open a folder to stock your vinyl record crate.
        </p>
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
      data-testid="album-crate-grid"
    >
      {albums.map((album) => {
        const isExpanded = expandedAlbumKey === album.key
        const hasCurrentPlayingTrack = album.tracks.some(
          (item) => item.track.id === currentTrackId,
        )
        const totalDuration = album.tracks.reduce(
          (acc, item) => acc + (item.track.durationSeconds || 0),
          0,
        )

        return (
          <div
            key={album.key}
            className={clsx(
              'group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300',
              hasCurrentPlayingTrack
                ? 'border-cozy-brass/60 bg-gradient-to-b from-cozy-surface-2 to-cozy-surface shadow-cozy ring-1 ring-cozy-brass/30'
                : 'border-cozy-brass/20 bg-cozy-surface hover:border-cozy-brass/40 hover:bg-cozy-surface-2/80 shadow-md',
            )}
          >
            {/* Record Jacket / Sleeve with Peeking Vinyl */}
            <div className="relative aspect-square w-full overflow-hidden bg-cozy-wood-dark/80 p-4">
              {/* Vinyl Disc sliding out on hover/active */}
              <div
                className={clsx(
                  'absolute right-2 top-4 bottom-4 aspect-square rounded-full bg-cozy-vinyl shadow-2xl transition-transform duration-500',
                  hasCurrentPlayingTrack && isPlaying
                    ? 'translate-x-3 rotate-12 animate-spin-record'
                    : 'group-hover:translate-x-4',
                )}
                style={{
                  backgroundImage:
                    'repeating-radial-gradient(circle at center, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 2px, transparent 4px)',
                }}
              >
                {/* Vinyl Center Label */}
                <div className="absolute inset-[32%] flex items-center justify-center overflow-hidden rounded-full border-2 border-cozy-brass-light bg-cozy-wood text-center">
                  {album.coverUrl ? (
                    <img
                      src={album.coverUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="p-1 text-[8px] font-serif-display italic text-cozy-brass-light truncate">
                      {album.artist}
                    </span>
                  )}
                  <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-cozy-wood-dark" />
                </div>
              </div>

              {/* Cardboard Album Cover Jacket */}
              <div
                onClick={() =>
                  onPlayTrack(album.tracks[0].track, album.tracks[0].originalIndex)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onPlayTrack(album.tracks[0].track, album.tracks[0].originalIndex)
                  }
                }}
                className="relative z-10 flex h-full w-[88%] cursor-pointer flex-col justify-end overflow-hidden rounded-lg border border-cozy-brass/30 bg-cozy-surface-2 shadow-[var(--shadow-record-sleeve)] transition-transform duration-300 group-hover:scale-[1.01]"
                title={`Play record: ${album.title}`}
              >
                {album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cozy-wood via-cozy-surface-2 to-cozy-wood-dark p-4 text-center">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-cozy-brass/40 bg-cozy-brass/10 text-cozy-brass-light">
                      <Icon name="vinylDrop" size={24} />
                    </div>
                    <span className="line-clamp-2 font-serif-display text-sm font-semibold italic text-cozy-brass-light">
                      {album.title}
                    </span>
                  </div>
                )}

                {/* Sleeve vintage cardboard spine & gradient highlight */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-black/60 via-white/5 to-transparent border-r border-white/5" />

                {/* Quick Play Overlay Icon */}
                <div className="relative z-10 flex items-center justify-between p-3">
                  <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-cozy-brass-light backdrop-blur-sm">
                    {album.tracks.length}{' '}
                    {album.tracks.length === 1 ? 'Track' : 'Tracks'}
                  </span>
                  <div
                    className={clsx(
                      'flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-transform',
                      hasCurrentPlayingTrack && isPlaying
                        ? 'bg-cozy-accent text-cozy-on-accent scale-105'
                        : 'bg-cozy-brass text-cozy-wood-dark group-hover:scale-110',
                    )}
                  >
                    <Icon
                      name={hasCurrentPlayingTrack && isPlaying ? 'pause' : 'play'}
                      size={18}
                      filled
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Album Information & Tracklist Toggle */}
            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3
                      className="truncate font-serif-display text-base font-medium text-cozy-ink"
                      title={album.title}
                    >
                      {album.title}
                    </h3>
                    <p
                      className="truncate text-xs text-cozy-ink-muted"
                      title={album.artist}
                    >
                      {album.artist}
                    </p>
                  </div>
                  {totalDuration > 0 && (
                    <span className="shrink-0 text-[11px] text-cozy-ink-muted">
                      {formatTime(totalDuration)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center justify-between border-t border-cozy-brass/15 pt-3">
                <button
                  type="button"
                  onClick={() =>
                    onPlayTrack(album.tracks[0].track, album.tracks[0].originalIndex)
                  }
                  className="flex items-center gap-1.5 text-xs font-semibold text-cozy-accent hover:text-cozy-brass-light transition-colors"
                >
                  <Icon name="play" size={12} filled />
                  Play Record
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedAlbumKey(isExpanded ? null : album.key)}
                  className="flex items-center gap-1 text-xs text-cozy-ink-muted hover:text-cozy-ink transition-colors"
                  aria-expanded={isExpanded}
                >
                  <span>{isExpanded ? 'Hide Songs' : 'View Songs'}</span>
                  <span
                    className={clsx(
                      'transition-transform duration-200 inline-block text-[10px]',
                      isExpanded ? 'rotate-180' : '',
                    )}
                  >
                    ▼
                  </span>
                </button>
              </div>

              {/* Expandable Songs Drawer */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <ul className="mt-3 divide-y divide-cozy-brass/10 border-t border-cozy-brass/10 pt-2">
                      {album.tracks.map((item, trackIdx) => {
                        const track = item.track
                        const isCurrent = track.id === currentTrackId
                        return (
                          <li key={track.id}>
                            <button
                              type="button"
                              onClick={() => onPlayTrack(track, item.originalIndex)}
                              className={clsx(
                                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-cozy-brass/10',
                                isCurrent &&
                                  'bg-cozy-brass/15 font-semibold text-cozy-accent',
                              )}
                            >
                              <span className="w-4 shrink-0 text-center text-[10px] text-cozy-ink-muted">
                                {isCurrent && isPlaying ? (
                                  <Icon name="volume" size={12} />
                                ) : (
                                  trackIdx + 1
                                )}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-cozy-ink">
                                {track.title}
                              </span>
                              {track.durationSeconds ? (
                                <span className="shrink-0 text-[10px] text-cozy-ink-muted">
                                  {formatTime(track.durationSeconds)}
                                </span>
                              ) : null}
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label={
                                  track.isFavorite
                                    ? 'Remove from favorites'
                                    : 'Add to favorites'
                                }
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleFavorite(track.id)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    onToggleFavorite(track.id)
                                  }
                                }}
                                className="shrink-0 p-0.5 text-cozy-ink-muted hover:text-cozy-accent"
                              >
                                <Icon
                                  name="heart"
                                  size={12}
                                  filled={track.isFavorite}
                                />
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )
      })}
    </div>
  )
}
