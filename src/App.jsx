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
import { AmbienceMixer } from '@/features/player/components/AmbienceMixer'
import { ZenTurntableModal } from '@/features/player/components/ZenTurntableModal'
import { CategoryRail } from '@/features/categories/components/CategoryRail'
import { TrackList } from '@/features/library/components/TrackList'
import { AlbumCrateView } from '@/features/library/components/AlbumCrateView'
import { GatefoldModal } from '@/features/library/components/GatefoldModal'
import { MixtapeModal } from '@/features/library/components/MixtapeModal'
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
  const [isAmbienceOpen, setIsAmbienceOpen] = useState(false)
  const [gatefoldAlbum, setGatefoldAlbum] = useState(null)
  const [isMixtapeOpen, setIsMixtapeOpen] = useState(false)
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
    rpmSpeed,
    vinylStyle,
    tubeWarmthEnabled,
    ambienceVolumes,
    theme,
    isZenModeOpen,
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
    setRpmSpeed,
    setVinylStyle,
    setTubeWarmth,
    setAmbienceVolume,
    setTheme,
    setIsZenModeOpen,
    needleSeek,
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
    createMixtapeAlbum,
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
      // Auto-switch to My Records so user immediately sees their record spinning on the gramophone
      setLibraryTab('local')
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
    <div className="mx-auto flex h-screen max-h-screen w-full max-w-[1700px] flex-col overflow-hidden px-4 py-3 sm:px-6">
      {/* Pinned Top Bar */}
      <header className="flex flex-none items-center justify-between gap-4 border-b border-cozy-brass/15 pb-3">
        {/* Left: Brandmark & Theme Selector */}
        <div className="flex items-center gap-3">
          <Brandmark />

          <div
            role="radiogroup"
            aria-label="Color theme"
            className="hidden sm:flex items-center gap-1 rounded-full border border-cozy-brass/25 bg-cozy-surface p-0.5 shadow-sm"
          >
            {[
              { id: 'walnut', label: '🌰 Walnut' },
              { id: 'maple', label: '🍯 Maple' },
              { id: 'midnight', label: '🕯️ Midnight' },
            ].map((th) => (
              <button
                key={th.id}
                type="button"
                role="radio"
                aria-checked={theme === th.id}
                onClick={() => setTheme(th.id)}
                className={clsx(
                  'rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors',
                  theme === th.id
                    ? 'bg-cozy-brass text-cozy-on-accent font-bold shadow-sm'
                    : 'text-cozy-ink-muted hover:text-cozy-ink',
                )}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-2">
          <div className="block md:hidden">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Soundscapes Ambience Button */}
          <button
            type="button"
            aria-pressed={isAmbienceOpen}
            aria-label="Toggle Soundscape Ambience Mixer"
            onClick={() => setIsAmbienceOpen((v) => !v)}
            title="Cozy Ambience Mixer (Rain, Fire, Cafe)"
            className={clsx(
              'flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-sm transition-all active:scale-95',
              isAmbienceOpen
                ? 'border-cozy-brass bg-cozy-brass text-cozy-on-accent'
                : 'border-cozy-brass/30 bg-cozy-surface-2 text-cozy-ink hover:bg-cozy-brass/10',
            )}
          >
            <span>🌧️</span>
            <span className="hidden sm:inline">Ambience</span>
          </button>

          {/* Zen Lounge Fullscreen Mode */}
          <button
            type="button"
            aria-label="Open Zen Fullscreen Lounge"
            onClick={() => setIsZenModeOpen(true)}
            title="Fullscreen Zen Listening Lounge"
            className="flex h-9 items-center gap-1.5 rounded-full border border-cozy-brass/30 bg-cozy-surface-2 px-3 text-xs font-semibold text-cozy-ink shadow-sm transition-all hover:bg-cozy-brass/10 active:scale-95"
          >
            <span>🕯️</span>
            <span className="hidden sm:inline">Zen Mode</span>
          </button>

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

      {/* Screen-Fit Main Split: Gramophone Console takes prominent stage */}
      <main className="grid flex-1 min-h-0 grid-cols-1 gap-6 pt-3 lg:grid-cols-[480px_1fr] xl:grid-cols-[540px_1fr] 2xl:grid-cols-[600px_1fr] overflow-hidden">
        {/* Left: The Gramophone Cabinet (Large, prominent, cohesive spacing) */}
        <aside
          className="flex flex-col items-center justify-center gap-4 rounded-3xl p-6 shadow-cozy border border-cozy-brass/25 h-full max-h-full overflow-y-auto"
          style={{
            background:
              'linear-gradient(165deg, var(--color-cozy-wood), var(--color-cozy-wood-dark) 85%)',
          }}
        >
          {/* Turntable Platter (Prominent, interactive, RPM + styles + tube) */}
          <div className="w-full max-w-[360px] sm:max-w-[400px] xl:max-w-[440px] 2xl:max-w-[480px] mx-auto shrink-0">
            <Turntable
              isPlaying={isPlaying}
              albumArtUrl={currentTrack?.pictureUrl}
              title={currentTrack?.title}
              artist={currentTrack?.artist}
              rpmSpeed={rpmSpeed}
              vinylStyle={vinylStyle}
              tubeWarmthEnabled={tubeWarmthEnabled}
              onTogglePlayPause={togglePlayPause}
              onNeedleSeek={needleSeek}
              onSetRpmSpeed={setRpmSpeed}
              onSetVinylStyle={setVinylStyle}
              onToggleTubeWarmth={() => setTubeWarmth(!tubeWarmthEnabled)}
            />
          </div>

          <YouTubePlayerMount onMount={mountYouTubePlayer} />

          {/* Controls & Now Playing: tightly clustered under turntable */}
          <div className="w-full max-w-[400px] xl:max-w-[440px] flex flex-col items-center gap-2.5 shrink-0">
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
                      onOpenGatefold={(album) => setGatefoldAlbum(album)}
                      onOpenMixtape={() => setIsMixtapeOpen(true)}
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

      {/* Ambience Mixer Drawer */}
      <AmbienceMixer
        isOpen={isAmbienceOpen}
        onClose={() => setIsAmbienceOpen(false)}
        ambienceVolumes={ambienceVolumes}
        onSetVolume={setAmbienceVolume}
        crackleEnabled={crackleEnabled}
        onToggleCrackle={toggleCrackle}
      />

      {/* Gatefold Record Jacket Liner Notes Modal */}
      <GatefoldModal
        album={gatefoldAlbum}
        isOpen={Boolean(gatefoldAlbum)}
        onClose={() => setGatefoldAlbum(null)}
        onPlayTrack={handlePlayTrack}
        currentTrackId={currentTrack?.id}
        isPlaying={isPlaying}
      />

      {/* Custom Vinyl Pressing / Mixtape Studio */}
      <MixtapeModal
        tracks={tracks}
        isOpen={isMixtapeOpen}
        onClose={() => setIsMixtapeOpen(false)}
        onCreateMixtape={createMixtapeAlbum}
      />

      {/* Fullscreen Zen Listening Lounge */}
      <ZenTurntableModal
        isOpen={isZenModeOpen}
        onClose={() => setIsZenModeOpen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isLoading={isLoading}
        position={position}
        duration={duration}
        volume={volume}
        shuffle={shuffle}
        repeatMode={repeatMode}
        rpmSpeed={rpmSpeed}
        vinylStyle={vinylStyle}
        tubeWarmthEnabled={tubeWarmthEnabled}
        onTogglePlayPause={togglePlayPause}
        onStop={stop}
        onNext={next}
        onPrevious={previous}
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
        onSeek={seekTo}
        onToggleShuffle={toggleShuffle}
        onCycleRepeat={cycleRepeatMode}
        onSetVolume={setVolume}
        onSetRpmSpeed={setRpmSpeed}
        onSetVinylStyle={setVinylStyle}
        onToggleTubeWarmth={() => setTubeWarmth(!tubeWarmthEnabled)}
        onNeedleSeek={needleSeek}
      />
    </div>
  )
}

export default App
