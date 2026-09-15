import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Turntable } from './Turntable'
import { PlayerControls } from './PlayerControls'
import { VolumeKnob } from './VolumeKnob'
import { Icon } from '@/shared/components/Icon'

/**
 * ZenTurntableModal
 *
 * Distraction-free fullscreen listening lounge mode.
 * Showcases the grand spinning turntable platter, ambient tube warmth lighting,
 * subtle floating now-playing typography, and minimal transport controls.
 */
export function ZenTurntableModal({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  isLoading = false,
  position = 0,
  duration = 0,
  volume = 0.8,
  shuffle = false,
  repeatMode = 'off',
  rpmSpeed = 33,
  vinylStyle = 'black',
  tubeWarmthEnabled = false,
  onTogglePlayPause,
  onStop,
  onNext,
  onPrevious,
  onSkipForward,
  onSkipBackward,
  onSeek,
  onToggleShuffle,
  onCycleRepeat,
  onSetVolume,
  onSetRpmSpeed,
  onSetVinylStyle,
  onToggleTubeWarmth,
  onNeedleSeek,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 40%, #2f1d16 0%, #170d09 60%, #0c0705 100%)',
        }}
      >
        {/* Top Floating Bar */}
        <header className="flex w-full max-w-5xl items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕯️</span>
            <span className="font-serif-display text-lg italic text-cozy-brass-light tracking-wider">
              Gramophone Listening Lounge
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Exit Zen Fullscreen Mode"
            className="flex items-center gap-1.5 rounded-full border border-cozy-brass/30 bg-black/40 px-4 py-1.5 text-xs font-semibold text-cozy-ink hover:bg-cozy-brass hover:text-cozy-on-accent transition-colors"
          >
            <span>Exit Zen Mode (Esc)</span>
            <Icon name="close" size={14} />
          </button>
        </header>

        {/* Centerpiece: Hero Grand Turntable */}
        <main className="flex flex-col items-center justify-center my-auto w-full max-w-md xl:max-w-lg">
          <Turntable
            isPlaying={isPlaying}
            albumArtUrl={currentTrack?.pictureUrl}
            title={currentTrack?.title}
            artist={currentTrack?.artist}
            rpmSpeed={rpmSpeed}
            vinylStyle={vinylStyle}
            tubeWarmthEnabled={tubeWarmthEnabled}
            onTogglePlayPause={onTogglePlayPause}
            onNeedleSeek={onNeedleSeek}
            onSetRpmSpeed={onSetRpmSpeed}
            onSetVinylStyle={onSetVinylStyle}
            onToggleTubeWarmth={onToggleTubeWarmth}
          />

          {/* Floating Track Info */}
          <div className="mt-6 text-center">
            <h2 className="font-serif-display text-2xl font-bold text-cozy-ink drop-shadow">
              {currentTrack?.title || 'Nothing spinning yet'}
            </h2>
            <p className="font-serif-display italic text-base text-cozy-brass-light mt-0.5 opacity-90">
              {currentTrack?.artist || 'Select a record to start'}
            </p>
          </div>
        </main>

        {/* Bottom Floating Console Controls */}
        <footer className="w-full max-w-xl flex flex-col items-center gap-3 z-10">
          <PlayerControls
            isPlaying={isPlaying}
            position={position}
            duration={duration}
            shuffle={shuffle}
            repeatMode={repeatMode}
            disabled={!currentTrack || isLoading}
            onTogglePlayPause={onTogglePlayPause}
            onStop={onStop}
            onNext={onNext}
            onPrevious={onPrevious}
            onSkipForward={onSkipForward}
            onSkipBackward={onSkipBackward}
            onSeek={onSeek}
            onToggleShuffle={onToggleShuffle}
            onCycleRepeat={onCycleRepeat}
          />
          <VolumeKnob value={volume} onChange={onSetVolume} />
        </footer>
      </motion.div>
    </AnimatePresence>
  )
}
