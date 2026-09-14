import { useEffect, useRef } from 'react'

/**
 * The off-screen YouTube <iframe> mount point.
 * Keeps the player in the DOM so audio playback, events, and transport controls
 * work seamlessly without displaying the video frame over the turntable cabinet.
 *
 * Mounts the engine exactly once via the `onMount(container)` callback.
 */
export function YouTubePlayerMount({ onMount }) {
  const containerRef = useRef(null)
  const hasMounted = useRef(false)

  useEffect(() => {
    if (hasMounted.current || !containerRef.current) return
    hasMounted.current = true
    onMount(containerRef.current)
  }, [onMount])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed -left-[9999px] top-0 h-1 w-1 overflow-hidden opacity-0"
    >
      <div ref={containerRef} data-testid="youtube-mount" />
    </div>
  )
}
