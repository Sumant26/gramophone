# Architecture

## Folder structure

The codebase is organized **by feature**, not by file type. Each feature
folder owns its state, components, and pure logic; `shared/` holds
genuinely cross-cutting pieces (icons, buttons, generic hooks/utils).

```
src/
├── App.jsx                     # Top-level shell: wires stores to layout
├── main.jsx                    # React entry point
├── index.css                   # Tailwind import + design tokens (theme)
├── db/
│   └── db.js                   # Dexie (IndexedDB) schema/instance
├── features/
│   ├── player/
│   │   ├── audioEngine.js      # Web Audio API wrapper (framework-agnostic)
│   │   ├── usePlayerStore.js   # Zustand store: playback state/actions
│   │   │                       #   (owns AudioEngine + YouTubeEngine, routes
│   │   │                       #   transport actions by track.source)
│   │   ├── visualizerMath.js   # Pure downsampling math for the visualizer
│   │   └── components/         # Turntable, PlayerControls, VolumeKnob, …
│   ├── library/
│   │   ├── metadata.js         # ID3 tag parsing + file-type helpers
│   │   ├── searchTracks.js     # Pure search/filter logic
│   │   ├── useLibraryStore.js  # Zustand store: library state/actions
│   │   └── components/         # TrackList, SearchBar, FolderPicker
│   ├── categories/
│   │   ├── deriveCategories.js # Pure: tracks -> category list + filtering
│   │   └── components/         # CategoryRail
│   ├── queue/
│   │   └── components/         # QueuePanel
│   └── youtube/
│       ├── youtubeEngine.js         # Official IFrame Player API wrapper
│       ├── loadYouTubeIframeApi.js  # Singleton <script> loader for the API
│       ├── youtubeApi.js            # Official Data API v3 search (Music category)
│       ├── useYouTubeStore.js       # Zustand store: search box state (debounced)
│       ├── toQueueTrack.js          # Adapts a search result into the shared track shape
│       └── components/              # YouTubeSearchPanel, YouTubePlayerMount
├── shared/
│   ├── components/              # Button, Icon (generic, no feature logic)
│   ├── hooks/                   # useKeyboardShortcuts
│   └── utils/                   # formatTime
└── test/
    └── setup.js                 # Vitest setup: jest-dom, mock AudioContext, fake-indexeddb
```

## Why the audio engine is isolated

`AudioEngine` (`src/features/player/audioEngine.js`) is the **only** place
in the codebase that touches the Web Audio API (`AudioContext`,
`AnalyserNode`, `GainNode`, `AudioBufferSourceNode`). It has no dependency
on React or Zustand — it's a plain class with `play()`, `pause()`, `stop()`,
`seek()`, `setVolume()`, etc.

This matters for two reasons:

1. **Testability.** jsdom (used by Vitest) has no real Web Audio
   implementation. `src/test/setup.js` installs a minimal mock
   `AudioContext` so `AudioEngine`'s _logic_ (position tracking, play/pause
   state transitions, the crackle-ambience layer, error handling) can be
   unit tested deterministically, without a browser.
2. **Blast radius.** Audio bugs (a race condition in play/pause, a timing
   drift) are contained to one file instead of leaking into component code,
   where they'd be much harder to isolate and test.

`usePlayerStore` (Zustand) owns exactly one `AudioEngine` instance for the
app's lifetime and mirrors its state into store fields that React can
subscribe to. Components never import or touch `AudioEngine` directly —
they call store actions (`togglePlayPause()`, `next()`, `seekTo()`, …).

### Playback timing model

`AudioBufferSourceNode` can only be `start()`ed once — there's no native
"pause." So "pause" is implemented as: remember `AudioContext.currentTime`
minus the track's start time (= elapsed offset), then `stop()` the source.
"Resume" creates a fresh source node and starts it at that remembered
offset. Position (`getCurrentTime()`) is always _derived_ from
`AudioContext.currentTime`, not accumulated via `setInterval`, so it can
never drift from what's actually audible — this is also why the UI polls
position via `requestAnimationFrame` (in `App.jsx`) rather than a timer.

## Two playback engines, one store

`usePlayerStore` owns two engine instances for the app's lifetime:
`AudioEngine` (local files, Web Audio API) and `YouTubeEngine`
(`src/features/youtube/youtubeEngine.js`, wrapping the official YouTube
IFrame Player API). They deliberately expose the same small surface —
`play()`, `pause()`, `stop()`, `seek()`, `getCurrentTime()`, `getDuration()`,
`setVolume()`, `dispose()` — so the store can treat them almost
interchangeably. Every track object carries a `source: 'local' | 'youtube'`
field; the store's internal `activeEngine()` helper picks the right engine
from `currentTrack.source` and every transport action
(`togglePlayPause`/`stop`/`seekTo`/`skipForward`/`skipBackward`/`previous`/
`syncPosition`) is routed through it, so components never need to know
which engine is live.

They aren't fully interchangeable, though, and the differences are load-
bearing, not accidental:

- **No raw audio access for YouTube.** `AudioEngine` decodes into an
  `AudioBuffer` and exposes an `AnalyserNode` (`getAnalyser()`) for the
  visualizer, plus a synthesized crackle layer mixed into its own audio
  graph. YouTube's embedded player never exposes samples to the page (by
  policy, tied to DRM/licensing) — there is nothing to analyse or mix with.
  `usePlayerStore.getAnalyser()` returns `null` for a YouTube track, and the
  UI hides the visualizer and crackle toggle rather than showing a dead
  control.
- **The player must stay visibly mounted.** YouTube's Terms of Service
  require the IFrame player to remain on-screen at a reasonable size while
  in use — it can't be hidden or shrunk to 0×0. `YouTubePlayerMount`
  therefore renders unconditionally in the cabinet (never conditionally
  mounted/unmounted on whether a YouTube track is active), so the live
  `YT.Player` is never orphaned by its container disappearing; it just shows
  a quiet placeholder caption when idle.
- **YouTube can be driven from outside the app.** The embedded player has
  its own on-screen controls. `YouTubeEngine` reports state changes back via
  `handlers.onPlayingChange(boolean)` (in addition to `onEnded`/`onError`),
  and `usePlayerStore` mirrors that into `isPlaying` — but only while a
  YouTube track is actually current, so a stale event from a previous video
  can't clobber local playback state.
- **Search, not a catalog.** `youtubeApi.js` calls the official Data API v3
  `search.list` scoped to `videoCategoryId=10` (YouTube's "Music" category)
  — a compliant approximation, not a curated music-only catalog. This is a
  conscious trade against building on an unofficial YouTube Music API, which
  would violate YouTube's Terms of Service and can break without notice.

## State management

Three Zustand stores, one per feature that needs shared mutable state:

- **`usePlayerStore`** — queue, current track, play/pause, position/
  duration, volume, shuffle/repeat, sleep timer, crackle toggle. Owns the
  `AudioEngine` and `YouTubeEngine` instances (see above).
- **`useLibraryStore`** — the track list, scan progress, selected category,
  search query. Persists track metadata to Dexie on every mutation.
- **`useYouTubeStore`** — the YouTube tab's search box: query, results,
  loading/error state. Debounces (400ms) and aborts superseded searches via
  `AbortController` so a fast typist's earlier request can't resolve after
  and overwrite a newer one. Deliberately separate from `useLibraryStore` —
  it's a different kind of data entirely (remote, transient, no persisted
  metadata) rather than another local-library concern.

Derived data (categories, filtered/searched track lists) is **not** stored
in either store — it's computed with plain functions
(`deriveCategories`, `filterTracksByCategory`, `searchTracks`) and memoized
in `App.jsx` with `useMemo`. This keeps the stores as the single source of
truth and avoids a whole class of "derived state got out of sync" bugs.

## Persistence model

- **Metadata** (title/artist/album/genre/favorite/play-count/etc.) is
  written to IndexedDB (via Dexie) on every mutation, so the library list
  survives a reload.
- **Audio file access** is _not_ always persistable — it depends on the
  browser:
  - Chromium browsers: folders are added via `showDirectoryPicker()`, which
    returns `FileSystemFileHandle`s. These can be structured-cloned into
    IndexedDB and (with the user's re-granted permission) reopened in a
    future session without re-selecting the folder.
  - Other browsers: files come from a plain `<input webkitdirectory>`,
    whose `File` objects cannot be persisted across a reload — the user
    re-adds the folder each session. This is a browser platform
    limitation, documented in `spec.md` §9.

## Testing strategy

- **Unit tests** (Vitest + Testing Library) sit next to the code they test
  (`Foo.js` + `Foo.test.js`). Pure logic (search, category derivation, time
  formatting, the visualizer's downsampling math) is tested directly with
  no mocking needed. Store/engine tests mock their external dependency (the
  mock `AudioContext`, a mocked `db` module) so they're fast and
  deterministic.
- **Component tests** render with Testing Library and assert on behavior
  (what the user can see/click/type), not implementation details.
- **E2E tests** (Playwright, `e2e/`) run against a production build and
  verify the whole shell renders, transport controls reflect state
  correctly, and the layout doesn't break at phone width. They intentionally
  don't attempt to automate the native folder-picker dialog (not reliably
  scriptable); library-loading logic is covered at the unit level instead
  (`useLibraryStore.test.js`).

## Adding a new feature

1. Create `src/features/<name>/` with its own store (if it needs shared
   state), pure logic modules, and a `components/` subfolder.
2. Keep components prop-driven where practical — easier to test, easier to
   reuse.
3. Add unit tests alongside new logic; add/extend e2e coverage only for
   new user-visible flows through the shell.
4. Wire it into `App.jsx` last, once the feature's pieces work in
   isolation.
