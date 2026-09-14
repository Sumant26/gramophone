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
│   └── queue/
│       └── components/         # QueuePanel
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

## State management

Two Zustand stores, one per feature that needs shared mutable state:

- **`usePlayerStore`** — queue, current track, play/pause, position/
  duration, volume, shuffle/repeat, sleep timer, crackle toggle. Owns the
  `AudioEngine` instance.
- **`useLibraryStore`** — the track list, scan progress, selected category,
  search query. Persists track metadata to Dexie on every mutation.

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
