import { create } from 'zustand'
import { searchYouTubeMusic } from './youtubeApi'

const DEBOUNCE_MS = 400

const ERROR_MESSAGES = {
  missing_api_key:
    'YouTube search needs an API key. Add VITE_YOUTUBE_API_KEY to your .env file (see .env.example) and restart the dev server.',
  network_error: "Couldn't reach YouTube — check your connection and try again.",
  quota_or_key_invalid:
    'YouTube rejected the request — the API key may be invalid, restricted, or its daily quota is used up.',
  request_failed: 'YouTube search failed. Please try again in a moment.',
}

/**
 * Search state for the "YouTube" library tab. Kept separate from
 * useLibraryStore since it's a fundamentally different source (remote,
 * streamed, no persisted metadata) rather than another local-file
 * concern.
 */
export const useYouTubeStore = create((set, get) => {
  let debounceTimer = null
  let abortController = null

  return {
    query: '',
    results: [],
    isSearching: false,
    errorMessage: null,

    setQuery(query) {
      set({ query })
      clearTimeout(debounceTimer)
      if (!query.trim()) {
        abortController?.abort()
        set({ results: [], isSearching: false, errorMessage: null })
        return
      }
      debounceTimer = setTimeout(() => get().runSearch(query), DEBOUNCE_MS)
    },

    async runSearch(query) {
      abortController?.abort()
      // Captured locally so we can tell, once the await below settles,
      // whether a newer search has since taken over — relying solely on
      // the fetch throwing AbortError isn't enough, since an in-flight
      // request can still resolve normally after being superseded.
      const thisController = new AbortController()
      abortController = thisController
      set({ isSearching: true, errorMessage: null })

      try {
        const { ok, error, results } = await searchYouTubeMusic(query, {
          signal: thisController.signal,
        })
        if (thisController !== abortController) return // superseded meanwhile
        set({
          results: ok ? results : [],
          errorMessage: ok ? null : (ERROR_MESSAGES[error] ?? 'Something went wrong.'),
          isSearching: false,
        })
      } catch (err) {
        if (err.name === 'AbortError') return // superseded by a newer search
        if (thisController !== abortController) return
        set({ isSearching: false, errorMessage: 'Something went wrong.' })
      }
    },

    reset() {
      clearTimeout(debounceTimer)
      abortController?.abort()
      set({ query: '', results: [], isSearching: false, errorMessage: null })
    },
  }
})
