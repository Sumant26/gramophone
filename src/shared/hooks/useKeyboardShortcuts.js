import { useEffect } from 'react'

/**
 * Global transport keyboard shortcuts. Ignored while the user is typing
 * into an input/textarea/contenteditable so shortcuts don't fight with
 * the search box.
 *
 * Space        play / pause
 * Right / Left seek forward / backward
 * Shift+Right  next track
 * Shift+Left   previous track
 * Up / Down    volume up / down
 * S            stop
 */
export function useKeyboardShortcuts(handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    function isTypingTarget(target) {
      const tag = target?.tagName?.toLowerCase()
      return tag === 'input' || tag === 'textarea' || target?.isContentEditable
    }

    function onKeyDown(event) {
      if (isTypingTarget(event.target)) return

      switch (event.key) {
        case ' ':
          event.preventDefault()
          handlers.onTogglePlayPause?.()
          break
        case 'ArrowRight':
          event.preventDefault()
          if (event.shiftKey) handlers.onNext?.()
          else handlers.onSkipForward?.()
          break
        case 'ArrowLeft':
          event.preventDefault()
          if (event.shiftKey) handlers.onPrevious?.()
          else handlers.onSkipBackward?.()
          break
        case 'ArrowUp':
          event.preventDefault()
          handlers.onVolumeUp?.()
          break
        case 'ArrowDown':
          event.preventDefault()
          handlers.onVolumeDown?.()
          break
        case 's':
        case 'S':
          handlers.onStop?.()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlers, enabled])
}
