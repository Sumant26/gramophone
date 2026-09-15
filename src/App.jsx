import { useEffect, useMemo, useState, useCallback } from 'react'
import clsx from 'clsx'
import { usePlayerStore } from '@/features/player/usePlayerStore'
import { useLibraryStore } from '@/features/library/useLibraryStore'
import { useYouTubeStore } from '@/features/youtube/useYouTubeStore'
import { toQueueTrack } from '@/features/youtube/toQueueTrack'
import {
  deriveCategories,
  filterTracksByCategory,
} from '@/features/categories/deriveCategories'
import { searchTracks } from '@/features/library/searchTracks'
import { useKeyboardShortcuts } from '@/shared/hooks/useKeyboardShortcuts'
import { Icon } from '@/shared/components/Icon'
import { Button } from '@/shared/components/Button'

import { Turntable } from '@/features/player/components/Turntable'
import { PlayerControls } from '@/features/player/components/PlayerControls'
import { VolumeKnob } from '@/features/player/components/VolumeKnob'
import { NowPlaying } from '@/features/player/components/NowPlaying'
import { SleepTimer } from '@/features/player/components/SleepTimer'
import { CategoryRail } from '@/features/categories/components/CategoryRail'
import { TrackList } from '@/features/library/components/TrackList'
import { AlbumCrateView } from '@/features/library/components/AlbumCrateView'
import { SearchBar } from '@/features/library/components/SearchBar'
import { FolderPicker } from '@/features/library/components/FolderPicker'
import { QueuePanel } from '@/features/queue/components/QueuePanel'
import { YouTubeSearchPanel } from '@/features/youtube/components/YouTubeSearchPanel'
import { YouTubePlayerMount } from '@/features/youtube/components/YouTubePlayerMount'

/** The app's mark: a plain drawn ring + center dot (a record label, in miniature) */
function Brandmark() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="var(--color-cozy-brass-light)"
          strokeWidth="1.8"
        />
        <circle cx="12" cy="12" r="3" fill="var(--color-cozy-brass-light)" />
      </svg>
      <h1 className="font-serif-display text-2xl italic text-cozy-brass-light tracking-wide">
        Gramophone
      </h1>
    </div>
  )
}

function App() {
  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const [libraryTab, setLibraryTab] = useState('local') // 'local' | 'youtube'
  const [libraryViewMode, setLibraryViewMode] = useState('crates') // 'crates' | 'list'

  const {
    queue,
    queueIndex,
    currentTrack,
    isPlaying,
    isLoading,
    position,
    duration,
    volume,
    repeatMode,
    shuffle,
    crackleEnabled,
    sleepTimerMinutes,
    playQueue,
    playAtIndex,
    togglePlayPause,
    stop,
    next,
    previous,
    skipForward,
    skipBackward,
    seekTo,
    setVolume,
    toggleShuffle,
    cycleRepeatMode,
    toggleCrackle,
    setSleepTimer,
    syncPosition,
    mountYouTubePlayer,
  } = usePlayerStore()

  const {
    tracks,
    isScanning,
    selectedCategoryId,
    searchQuery,
    loadFromDb,
    addFiles,
    addFromDirectory,
    addYouTubeTrack,
    addYouTubeAlbum,
    removeTrack,
    toggleFavorite,
    setSelectedCategory,
    setSearchQuery,
  } = useLibraryStore()

  const {
    query: youtubeQuery,
    results: youtubeResults,
    isSearching: isSearchingYouTube,
    errorMessage: youtubeErrorMessage,
    setQuery: setYouTubeQuery,
  } = useYouTubeStore()

  useEffect(() => {
    loadFromDb()
  }, [loadFromDb])

  // Keep `position` (and the sleep timer) in sync with the real audio clock
  useEffect(() => {
    let frame
    const tick = () => {
      syncPosition()
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [syncPosition])

  const categories = useMemo(() => deriveCategories(tracks), [tracks])
  const visibleTracks = useMemo(() => {
    const byCategory = filterTracksByCategory(tracks, selectedCategoryId)
    return searchTracks(byCategory, searchQuery)
  }, [tracks, selectedCategoryId, searchQuery])

  const savedTrackIds = useMemo(() => new Set(tracks.map((t) => t.id)), [tracks])

  const handlePlayTrack = useCallback(
    (_track, indexInVisibleList) => {
      setIsQueueOpen(false)
      playQueue(visibleTracks, indexInVisibleList)
    },
    [playQueue, visibleTracks],
  )

  const handlePlayYouTubeResult = useCallback(
    (_result, indexInResults) => {
      setIsQueueOpen(false)
      playQueue(youtubeResults.map(toQueueTrack), indexInResults)
    },
    [playQueue, youtubeResults],
  )

  const handleAddYouTubeTrackToLibrary = useCallback(
    (result) => {
      const queueTrack = toQueueTrack(result)
      addYouTubeTrack(queueTrack)
    },
    [addYouTubeTrack],
  )

  const isYouTubeTrack = currentTrack?.source === 'youtube'

  useKeyboardShortcuts({
    onTogglePlayPause: togglePlayPause,
    onStop: stop,
    onNext: next,
    onPrevious: previous,
    onSkipForward: skipForward,
    onSkipBackward: skipBackward,
    onVolumeUp: () => setVolume(Math.min(volume + 0.05, 1)),
    onVolumeDown: () => setVolume(Math.max(volume - 0.05, 0)),
  })

  return (
    <div className="mx-auto flex h-screen max-h-screen w-full max-w-[1500px] flex-col overflow-hidden px-4 py-3 sm:px-6">
      {/* Pinned Top Bar */}
      <header className="flex flex-none flex-wrap items-center justify-between gap-3 border-b border-cozy-brass/15 pb-3">
        <Brandmark />
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <FolderPicker
            isScanning={isScanning}
            onFilesSelected={addFiles}
            onDirectorySelected={addFromDirectory}
          />
          <SleepTimer
            sleepTimerMinutes={sleepTimerMinutes}
            onSetSleepTimer={setSleepTimer}
          />
          {!isYouTubeTrack && (
            <Button
              size="sm"
              active={crackleEnabled}
              aria-pressed={crackleEnabled}
              aria-label="Toggle vinyl crackle ambience"
              onClick={toggleCrackle}
              title="Vinyl crackle ambience"
            >
              <Icon name="vinylDrop" size={16} />
            </Button>
          )}
          <Button
            size="sm"
            active={isQueueOpen}
            aria-pressed={isQueueOpen}
            aria-label="Toggle queue panel"
            onClick={() => setIsQueueOpen((v) => !v)}
          >
            <Icon name="queue" size={16} />
          </Button>
        </div>
      </header>

      {/* Screen-Fit Main Split (Zero full-page scroll) */}
      <main className="grid flex-1 min-h-0 grid-cols-1 gap-5 pt-3 lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] overflow-hidden">
        {/* Left: The Gramophone Cabinet (Comfortably fitted) */}
        <aside
          className="flex flex-col items-center justify-between gap-3 rounded-3xl p-5 shadow-cozy border border-cozy-brass/25 h-full max-h-full overflow-y-auto"
          style={{
            background:
              'linear-gradient(165deg, var(--color-cozy-wood), var(--color-cozy-wood-dark) 85%)',
          }}
        >
          <div className="w-full max-w-[280px] sm:max-w-[300px] xl:max-w-[330px] mx-auto shrink-0">
            <Turntable
              isPlaying={isPlaying}
              albumArtUrl={currentTrack?.pictureUrl}
              title={currentTrack?.title}
              artist={currentTrack?.artist}
              onTogglePlayPause={togglePlayPause}
            />
          </div>

          <YouTubePlayerMount onMount={mountYouTubePlayer} />

          <div className="w-full flex flex-col gap-3 shrink-0">
            <NowPlaying track={currentTrack} onToggleFavorite={toggleFavorite} />
            <PlayerControls
              isPlaying={isPlaying}
              position={position}
              duration={duration}
              shuffle={shuffle}
              repeatMode={repeatMode}
              disabled={!currentTrack || isLoading}
              onTogglePlayPause={togglePlayPause}
              onStop={stop}
              onNext={next}
              onPrevious={previous}
              onSkipForward={skipForward}
              onSkipBackward={skipBackward}
              onSeek={seekTo}
              onToggleShuffle={toggleShuffle}
              onCycleRepeat={cycleRepeatMode}
            />
            <VolumeKnob value={volume} onChange={setVolume} />
          </div>

          {isQueueOpen && (
            <div className="w-full rounded-2xl bg-cozy-surface p-3 shadow-md border border-cozy-brass/20 shrink-0">
              <QueuePanel
                queue={queue}
                queueIndex={queueIndex}
                onSelect={playAtIndex}
                onClose={() => setIsQueueOpen(false)}
              />
            </div>
          )}
        </aside>

        {/* Right: The Music Collection & Search (Scrolls cleanly internally) */}
        <section
          aria-label="Your library"
          className="flex flex-col h-full min-h-0 overflow-hidden"
        >
          {/* Header Controls */}
          <div className="mb-3 flex flex-none flex-wrap items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Music source"
              className="flex w-fit gap-1 rounded-full bg-cozy-surface p-1 shadow-sm border border-cozy-brass/20"
            >
              <button
                type="button"
                role="tab"
                aria-selected={libraryTab === 'local'}
                onClick={() => setLibraryTab('local')}
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors',
                  libraryTab === 'local'
                    ? 'bg-cozy-brass/20 font-semibold text-cozy-accent'
                    : 'text-cozy-ink-muted hover:text-cozy-ink',
                )}
              >
                <Icon name="folder" size={14} />
                My Records ({tracks.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={libraryTab === 'youtube'}
                onClick={() => setLibraryTab('youtube')}
                className={clsx(
                  'flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors',
                  libraryTab === 'youtube'
                    ? 'bg-cozy-brass/20 font-semibold text-cozy-accent'
                    : 'text-cozy-ink-muted hover:text-cozy-ink',
                )}
              >
                <Icon name="broadcast" size={14} />
                YouTube Search
              </button>
            </div>

            {/* View Mode Toggle for Local Records */}
            {libraryTab === 'local' && (
              <div className="flex items-center gap-1 rounded-full bg-cozy-surface p-1 border border-cozy-brass/20 shadow-sm">
                <button
                  type="button"
                  title="Vinyl Records View"
                  aria-label="Vinyl records view"
                  aria-pressed={libraryViewMode === 'crates'}
                  onClick={() => setLibraryViewMode('crates')}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors',
                    libraryViewMode === 'crates'
                      ? 'bg-cozy-brass/20 font-semibold text-cozy-accent'
                      : 'text-cozy-ink-muted hover:text-cozy-ink',
                  )}
                >
                  <Icon name="vinylDrop" size={13} />
                  <span>Albums</span>
                </button>
                <button
                  type="button"
                  title="Song List View"
                  aria-label="Song list view"
                  aria-pressed={libraryViewMode === 'list'}
                  onClick={() => setLibraryViewMode('list')}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors',
                    libraryViewMode === 'list'
                      ? 'bg-cozy-brass/20 font-semibold text-cozy-accent'
                      : 'text-cozy-ink-muted hover:text-cozy-ink',
                  )}
                >
                  <Icon name="queue" size={13} />
                  <span>Songs</span>
                </button>
              </div>
            )}
          </div>

          {/* Internally Scrollable Records / YouTube Panel */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {libraryTab === 'local' ? (
              <div className="flex flex-col gap-3">
                <CategoryRail
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={setSelectedCategory}
                />
                <div>
                  {libraryViewMode === 'crates' ? (
                    <AlbumCrateView
                      tracks={visibleTracks}
                      currentTrackId={currentTrack?.id}
                      isPlaying={isPlaying}
                      onPlayTrack={handlePlayTrack}
                      onToggleFavorite={toggleFavorite}
                      onRemoveTrack={removeTrack}
                    />
                  ) : (
                    <div className="rounded-2xl bg-cozy-surface p-3 shadow-md border border-cozy-brass/20">
                      <TrackList
                        tracks={visibleTracks}
                        currentTrackId={currentTrack?.id}
                        isPlaying={isPlaying}
                        onPlayTrack={handlePlayTrack}
                        onToggleFavorite={toggleFavorite}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-cozy-surface p-4 shadow-md border border-cozy-brass/20">
                <YouTubeSearchPanel
                  query={youtubeQuery}
                  results={youtubeResults}
                  isSearching={isSearchingYouTube}
                  errorMessage={youtubeErrorMessage}
                  currentTrackId={currentTrack?.id}
                  isPlaying={isPlaying}
                  onQueryChange={setYouTubeQuery}
                  onPlayResult={handlePlayYouTubeResult}
                  onAddTrack={handleAddYouTubeTrackToLibrary}
                  onAddAlbum={addYouTubeAlbum}
                  savedTrackIds={savedTrackIds}
                />
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
