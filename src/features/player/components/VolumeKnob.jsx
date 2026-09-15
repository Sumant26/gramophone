import { useCallback, useRef, useState } from 'react'
import { Icon } from '@/shared/components/Icon'

const MIN_ANGLE = -135
const MAX_ANGLE = 135

function valueToAngle(value) {
  return MIN_ANGLE + value * (MAX_ANGLE - MIN_ANGLE)
}

function calculateValueFromPointer(event, element) {
  const rect = element.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2
  const dx = event.clientX - centerX
  const dy = event.clientY - centerY

  // atan2: 0 is at 3 o'clock, 90 is at 6 o'clock, -90 at 12 o'clock, 180 at 9 o'clock
  // We want 12 o'clock = 0 deg, 3 o'clock = 90 deg, 9 o'clock = -90 deg
  let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90
  if (deg > 180) deg -= 360

  // Dead zone is bottom (-135 to -180 and 135 to 180)
  if (deg < -135 && deg >= -180) {
    deg = -135
  } else if (deg > 135) {
    deg = 135
  }

  const normalized = (deg - MIN_ANGLE) / (MAX_ANGLE - MIN_ANGLE)
  return Math.min(Math.max(normalized, 0), 1)
}

/**
 * A rotary volume knob styled like a brass amplifier dial.
 * Supports direct clicking anywhere on the dial, continuous circular dragging,
 * clicking the speaker icon to mute/unmute, and standard keyboard navigation.
 */
export function VolumeKnob({ value, onChange, size = 48 }) {
  const knobRef = useRef(null)
  const draggingRef = useRef(false)
  const prevVolumeRef = useRef(value || 0.8)
  const [isHovered, setIsHovered] = useState(false)

  const clamp = (v) => Math.min(Math.max(v, 0), 1)

  const updateFromPointer = useCallback(
    (event) => {
      if (!knobRef.current) return
      const newValue = calculateValueFromPointer(event, knobRef.current)
      onChange?.(Math.round(newValue * 100) / 100)
    },
    [onChange],
  )

  const handlePointerDown = useCallback(
    (event) => {
      draggingRef.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      updateFromPointer(event)
    },
    [updateFromPointer],
  )

  const handlePointerMove = useCallback(
    (event) => {
      if (!draggingRef.current) return
      updateFromPointer(event)
    },
    [updateFromPointer],
  )

  const handlePointerUp = useCallback((event) => {
    draggingRef.current = false
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // Ignored if pointer wasn't captured
    }
  }, [])

  const handleToggleMute = useCallback(() => {
    if (value > 0) {
      prevVolumeRef.current = value
      onChange?.(0)
    } else {
      onChange?.(prevVolumeRef.current || 0.8)
    }
  }, [onChange, value])

  const handleKeyDown = useCallback(
    (event) => {
      const step = event.shiftKey ? 0.1 : 0.05
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
        event.preventDefault()
        onChange(clamp(Number((value + step).toFixed(2))))
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
        event.preventDefault()
        onChange(clamp(Number((value - step).toFixed(2))))
      } else if (event.key === 'Home') {
        onChange(0)
      } else if (event.key === 'End') {
        onChange(1)
      }
    },
    [onChange, value],
  )

  const percentage = Math.round(value * 100)

  return (
    <div
      className="group relative flex items-center gap-2 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Clickable Mute/Unmute Speaker Icon */}
      <button
        type="button"
        onClick={handleToggleMute}
        aria-label={value === 0 ? 'Unmute volume' : 'Mute volume'}
        title={value === 0 ? 'Unmute volume' : 'Mute volume'}
        className="rounded-full p-1 text-cozy-brass hover:text-cozy-brass-light hover:bg-cozy-brass/10 transition-colors"
      >
        <Icon name={value === 0 ? 'volumeMute' : 'volume'} size={18} />
      </button>

      {/* Rotary Brass Knob */}
      <div
        ref={knobRef}
        role="slider"
        tabIndex={0}
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={`${percentage}%`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="relative cursor-pointer touch-none rounded-full border-2 border-cozy-brass/60 bg-gradient-to-br from-cozy-brass via-cozy-wood to-cozy-wood-dark shadow-cozy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cozy-accent active:scale-95 transition-transform"
        style={{ width: size, height: size }}
        data-testid="volume-knob"
        title={`Volume: ${percentage}% (Click or drag dial)`}
      >
        {/* Outer Brass Bezel Ring */}
        <div className="absolute inset-1 rounded-full border border-cozy-brass-light/40 bg-gradient-to-br from-cozy-brass to-cozy-wood-dark shadow-inner" />

        {/* Dial Pointer Needle */}
        <div
          className="absolute left-1/2 top-1/2 h-[40%] w-[3.5px] -translate-x-1/2 -translate-y-full rounded-full bg-cozy-brass-light shadow-sm"
          style={{
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${valueToAngle(value)}deg)`,
          }}
        />

        {/* Center Brass Cap */}
        <div className="absolute inset-[30%] rounded-full border border-cozy-brass-light/60 bg-gradient-to-br from-cozy-brass-light to-cozy-wood shadow" />
      </div>

      {/* Percentage Indicator Badge */}
      <span
        className={`text-[11px] font-mono font-medium transition-opacity ${
          isHovered || value === 0
            ? 'text-cozy-brass-light opacity-100'
            : 'text-cozy-ink-muted/70 opacity-80'
        }`}
      >
        {percentage}%
      </span>
    </div>
  )
}
