/**
 * Adapts a lightweight YouTube search result (from `searchYouTubeMusic`)
 * into the same track-object shape the local library already produces
 * (id/title/artist/album/pictureUrl/durationSeconds/isFavorite), plus a
 * `source: 'youtube'` tag and `videoId` field the player uses to load it
 * through YouTubeEngine instead of AudioEngine.
 */

function cleanTitle(rawTitle) {
  if (!rawTitle) return ''
  return rawTitle
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(
      /\((?:Official|Lyrical|Full|Audio|Video|HD|4K|8K|Music Video)[^)]*\)/gi,
      '',
    )
    .replace(
      /\[(?:Official|Lyrical|Full|Audio|Video|HD|4K|8K|Music Video)[^\]]*\]/gi,
      '',
    )
    .replace(/\s+/g, ' ')
    .trim()
}

export function toQueueTrack(result) {
  const cleanedTitle = cleanTitle(result.title)
  return {
    id: `youtube:${result.videoId}`,
    source: 'youtube',
    videoId: result.videoId,
    title: cleanedTitle || result.title,
    artist: result.channelTitle,
    album: 'YouTube',
    pictureUrl: result.thumbnailUrl,
    durationSeconds: null,
    isFavorite: false,
  }
}
