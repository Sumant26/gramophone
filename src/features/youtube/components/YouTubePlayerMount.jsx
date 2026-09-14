import { useEffect, useRef } from 'react'

/**
 * The visible YouTube <iframe> mount point, styled as a small brass-framed
 * "screen" set into the cabinet next to the turntable. YouTube's terms
 * require the player to stay visibly rendered at a reasonable size — it
 * can't be hidden or shrunk to 0×0 — so this stays in the DOM at a real
 * size at all times rather than only while a YouTube track is active; it
 * just shows a quiet placeholder caption until something is loaded.
 *
 * Mounts the engine exactly once (YT.Player takes ownership of the
 * container on construction, so re-mounting isn't meaningful) via the
 * `onMount(container)` callback — wired to usePlayerStore's
 * `mountYouTubePlayer` action by the caller.
 */
export function YouTubePlayerMount({ onMount, hasYouTubeTrack }) {
  const containerRef = useRef(null)
  const hasMounted = useRef(false)

  useEffect(() => {
    if (hasMounted.current || !containerRef.current) return
    hasMounted.current = true
    onMount(containerRef.current)
  }, [onMount])

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-cozy-brass/40 bg-cozy-vinyl shadow-cozy-inset">
      <div
        className="aspect-video w-full"
        ref={containerRef}
        data-testid="youtube-mount"
      />
      {!hasYouTubeTrack && (
        <p className="px-3 py-1.5 text-center text-[11px] text-cozy-ink-muted">
          YouTube screen — search below to play something
        </p>
      )}
    </div>
  )
}
