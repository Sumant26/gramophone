import { useCallback, useRef } from 'react'
import { Icon } from '@/shared/components/Icon'

const MIN_ANGLE = -135
const MAX_ANGLE = 135
const DRAG_SENSITIVITY = 0.005 // volume change per pixel of vertical drag

function valueToAngle(value) {
  return MIN_ANGLE + value * (MAX_ANGLE - MIN_ANGLE)
}

/**
 * A rotary volume knob styled like a brass amplifier dial. Implements the
 * ARIA `slider` pattern by hand (drag-to-adjust with the mouse, arrow keys
 * for keyboard/screen-reader users) since a native <input type="range">
 * can't be rendered as a circular dial.
 */
export function VolumeKnob({ value, onChange, size = 56 }) {
  const draggingRef = useRef(false)
  const lastYRef = useRef(0)

  const clamp = (v) => Math.min(Math.max(v, 0), 1)

  const handlePointerDown = useCallback((event) => {
    draggingRef.current = true
    lastYRef.current = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const handlePointerMove = useCallback(
    (event) => {
      if (!draggingRef.current) return
      const deltaY = lastYRef.current - event.clientY
      lastYRef.current = event.clientY
      onChange(clamp(value + deltaY * DRAG_SENSITIVITY))
    },
    [onChange, value],
  )

  const handlePointerUp = useCallback((event) => {
    draggingRef.current = false
    event.currentTarget.releasePointerCapture(event.pointerId)
  }, [])

  const handleKeyDown = useCallback(
    (event) => {
      const step = event.shiftKey ? 0.1 : 0.05
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
        event.preventDefault()
        onChange(clamp(value + step))
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
        event.preventDefault()
        onChange(clamp(value - step))
      } else if (event.key === 'Home') {
        onChange(0)
      } else if (event.key === 'End') {
        onChange(1)
      }
    },
    [onChange, value],
  )

  return (
    <div className="flex items-center gap-2">
      <Icon name={value === 0 ? 'volumeMute' : 'volume'} size={18} />
      <div
        role="slider"
        tabIndex={0}
        aria-label="Volume"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-valuetext={`${Math.round(value * 100)}%`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="relative cursor-grab touch-none rounded-full border-4 border-cozy-brass bg-gradient-to-br from-cozy-brass-light to-cozy-brass shadow-cozy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cozy-accent active:cursor-grabbing"
        style={{ width: size, height: size }}
        data-testid="volume-knob"
      >
        <div
          className="absolute left-1/2 top-1/2 h-[38%] w-[3px] -translate-x-1/2 -translate-y-full rounded-full bg-cozy-ink"
          style={{
            transformOrigin: 'bottom center',
            transform: `translateX(-50%) rotate(${valueToAngle(value)}deg)`,
          }}
        />
      </div>
    </div>
  )
}
