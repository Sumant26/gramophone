const SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search'
/** YouTube's built-in "Music" video category — narrows results away from
 * general YouTube content without needing any unofficial YouTube Music
 * API. It's an approximation (creators self-categorize), not a perfect
 * music-only catalog, but it's meaningfully better than unfiltered search. */
const MUSIC_CATEGORY_ID = '10'

export function getYouTubeApiKey() {
  return import.meta.env.VITE_YOUTUBE_API_KEY ?? ''
}

/**
 * Searches YouTube (scoped to the Music category) via the official Data
 * API v3. Returns a plain array of lightweight result objects — never
 * throws for an empty API key or a 4xx/5xx response; callers get a
 * `{ ok: false, error }` style result instead so the UI can show a
 * friendly message rather than an uncaught rejection.
 */
export async function searchYouTubeMusic(query, { signal } = {}) {
  const apiKey = getYouTubeApiKey()
  if (!apiKey) {
    return {
      ok: false,
      error: 'missing_api_key',
      results: [],
    }
  }

  const trimmed = query.trim()
  if (!trimmed) return { ok: true, error: null, results: [] }

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    videoCategoryId: MUSIC_CATEGORY_ID,
    maxResults: '15',
    q: trimmed,
    key: apiKey,
  })

  let response
  try {
    response = await fetch(`${SEARCH_URL}?${params.toString()}`, { signal })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    return { ok: false, error: 'network_error', results: [] }
  }

  if (!response.ok) {
    return {
      ok: false,
      error: response.status === 403 ? 'quota_or_key_invalid' : 'request_failed',
      results: [],
    }
  }

  const data = await response.json()
  const results = (data.items ?? [])
    .filter((item) => item.id?.videoId)
    .map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl:
        item.snippet.thumbnails?.medium?.url ??
        item.snippet.thumbnails?.default?.url ??
        null,
      publishedAt: item.snippet.publishedAt,
    }))

  return { ok: true, error: null, results }
}
