/**
 * Adapts a lightweight YouTube search result (from `searchYouTubeMusic`)
 * into the same track-object shape the local library already produces
 * (id/title/artist/album/pictureUrl/durationSeconds/isFavorite), plus a
 * `source: 'youtube'` tag and `videoId` field the player uses to load it
 * through YouTubeEngine instead of AudioEngine. This is the only place
 * that needs to know both shapes — usePlayerStore's queue/playAtIndex,
 * NowPlaying, TrackList-adjacent UI, etc. all just read the common fields
 * and branch on `source` where the two genuinely differ.
 */
export function toQueueTrack(result) {
  return {
    id: `youtube:${result.videoId}`,
    source: 'youtube',
    videoId: result.videoId,
    title: result.title,
    artist: result.channelTitle,
    album: 'YouTube',
    pictureUrl: result.thumbnailUrl,
    durationSeconds: null,
    isFavorite: false,
  }
}
