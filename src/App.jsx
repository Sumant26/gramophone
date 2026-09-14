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
import { Visualizer } from '@/features/player/components/Visualizer'
import { SleepTimer } from '@/features/player/components/SleepTimer'
import { CategoryRail } from '@/features/categories/components/CategoryRail'
import { TrackList } from '@/features/library/components/TrackList'
import { SearchBar } from '@/features/library/components/SearchBar'
import { FolderPicker } from '@/features/library/components/FolderPicker'
import { QueuePanel } from '@/features/queue/components/QueuePanel'
import { YouTubeSearchPanel } from '@/features/youtube/components/YouTubeSearchPanel'
import { YouTubePlayerMount } from '@/features/youtube/components/YouTubePlayerMount'

/** The app's mark: a plain drawn ring + center dot (a record label, in miniature) rather than an emoji, to match the Velvet Nocturne identity's more considered feel. */
function Brandmark() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="var(--color-cozy-brass-light)"
          strokeWidth="1.6"
        />
        <circle cx="12" cy="12" r="3" fill="var(--color-cozy-brass-light)" />
      </svg>
      <h1 className="font-serif-display text-2xl italic text-cozy-brass-light">
        Gramophone
      </h1>
    </div>
  )
}

function App() {
  const [isQueueOpen, setIsQueueOpen] = useState(false)
  const [libraryTab, setLibraryTab] = useState('local') // 'local' | 'youtube'

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
    getAnalyser,
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

  // Keep `position` (and the sleep timer) in sync with the real audio
  // clock via rAF rather than setInterval, so it never drifts.
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

  const handlePlayTrack = useCallback(
    (_track, indexInVisibleList) => {
      playQueue(visibleTracks, indexInVisibleList)
    },
    [playQueue, visibleTracks],
  )

  // The whole current results page becomes the queue, so next/previous
  // step through it just like a local playlist — only the track shape
  // (and which engine plays it) differs, via toQueueTrack's `source` tag.
  const handlePlayYouTubeResult = useCallback(
    (_result, indexInResults) => {
      playQueue(youtubeResults.map(toQueueTrack), indexInResults)
    },
    [playQueue, youtubeResults],
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
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
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

      <main className="grid flex-1 grid-cols-1 gap-8 lg:grid-cols-[480px_1fr]">
        {/* The "cabinet": a large wood-toned console holding the turntable
            and transport, on the left per the Velvet Nocturne direction. */}
        <aside
          className="flex flex-col items-center gap-5 rounded-3xl p-6 shadow-cozy sm:p-8 lg:sticky lg:top-6 lg:self-start"
          style={{
            background:
              'linear-gradient(165deg, var(--color-cozy-wood), var(--color-cozy-wood-dark) 82%)',
          }}
        >
          <Turntable
            isPlaying={isPlaying}
            albumArtUrl={currentTrack?.pictureUrl}
            title={currentTrack?.title}
            artist={currentTrack?.artist}
          />
          <Visualizer
            analyser={getAnalyser()}
            isPlaying={isPlaying}
            className="w-full max-w-md"
          />
          <YouTubePlayerMount onMount={mountYouTubePlayer} />
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

          {isQueueOpen && (
            <div className="w-full rounded-2xl bg-cozy-surface p-3 shadow-sm">
              <QueuePanel
                queue={queue}
                queueIndex={queueIndex}
                onSelect={playAtIndex}
                onClose={() => setIsQueueOpen(false)}
              />
            </div>
          )}
        </aside>

        <section aria-label="Your library" className="min-w-0">
          <div
            role="tablist"
            aria-label="Music source"
            className="mb-3 flex w-fit gap-1 rounded-full bg-cozy-surface p-1 shadow-sm"
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
              My Library
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
              YouTube
            </button>
          </div>

          {libraryTab === 'local' ? (
            <>
              <CategoryRail
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelect={setSelectedCategory}
              />
              <div className="mt-3 rounded-2xl bg-cozy-surface p-3 shadow-sm">
                <TrackList
                  tracks={visibleTracks}
                  currentTrackId={currentTrack?.id}
                  isPlaying={isPlaying}
                  onPlayTrack={handlePlayTrack}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            </>
          ) : (
            <div className="rounded-2xl bg-cozy-surface p-3 shadow-sm">
              <YouTubeSearchPanel
                query={youtubeQuery}
                results={youtubeResults}
                isSearching={isSearchingYouTube}
                errorMessage={youtubeErrorMessage}
                currentTrackId={currentTrack?.id}
                isPlaying={isPlaying}
                onQueryChange={setYouTubeQuery}
                onPlayResult={handlePlayYouTubeResult}
              />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
