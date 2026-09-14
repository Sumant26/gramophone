/**
 * Loads the official YouTube IFrame Player API script exactly once and
 * resolves when `window.YT` is ready to construct players. Module-level
 * singleton promise so repeated calls (e.g. re-mounting the player
 * component) don't inject the script twice or double-register the global
 * `onYouTubeIframeAPIReady` callback.
 */
let apiPromise = null

export function loadYouTubeIframeApi() {
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('loadYouTubeIframeApi() can only run in a browser'))
      return
    }

    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }

    const previousCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.()
      resolve(window.YT)
    }

    const existing = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]',
    )
    if (existing) return

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.onerror = () =>
      reject(new Error('Failed to load the YouTube IFrame API script'))
    document.head.appendChild(script)
  })

  return apiPromise
}

/** Test-only: resets the module singleton so each test starts clean. */
export function __resetYouTubeIframeApiLoaderForTests() {
  apiPromise = null
}
