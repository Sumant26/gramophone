# Gramophone — Product & Technical Specification

Status: v1.0 (MVP scope)
Owner: Sumant

## 1. Purpose

A local-first, browser-based music player styled as a warm, cozy gramophone.
Users bring their own audio files (no streaming/licensing involved); the app
plays them with a spinning record, a moving tonearm, categorized browsing,
and full transport controls.

## 2. Goals & Non-Goals

**Goals**

- Play the user's own local audio files with a gramophone-styled UI.
- Feel fast (sub-second interactions, no jank) and visually cozy/comforting.
- Persist the user's library (metadata, favorites, play counts) across
  sessions without a backend.
- Be a reference-quality small codebase: tested, linted, CI-gated.

**Non-Goals (out of scope for v1)**

- Streaming from third-party services (Spotify/Apple Music/etc.) — this
  requires licensing agreements and is not attempted here.
- Multi-user accounts, cloud sync, or a backend server.
- Audio editing (trimming, effects beyond the optional crackle overlay).
- Mobile native apps (the web app is responsive down to ~360px width but is
  not a packaged mobile app in v1).

## 3. User Stories

1. As a user, I can select a folder of music from my computer and see it
   appear as a browsable library.
2. As a user, I can click any track and it starts playing immediately, with
   the record visibly spinning and the tonearm dropping onto it.
3. As a user, I can pause, stop, skip forward/back within a track, and go to
   the next/previous track, using on-screen controls or keyboard shortcuts.
4. As a user, I can browse my library by category (genre, favorites,
   recently played) rather than one long flat list.
5. As a user, I can search my library by title, artist, or album.
6. As a user, I can mark tracks as favorites and see them as their own
   category.
7. As a user, I can adjust volume with a knob that feels tactile.
8. As a user, I can enable a subtle vinyl-crackle ambience for nostalgia.
9. As a user, I can set a sleep timer so playback stops automatically.
10. As a user, closing and reopening the app keeps my library, favorites,
    and play counts intact (re-linking files if the browser requires it).

## 4. Functional Requirements

### 4.1 Library ingestion

- **FR-1**: The app MUST support adding music via a folder picker. On
  Chromium-based browsers (File System Access API available), this uses
  `showDirectoryPicker()` and persists the `FileSystemDirectoryHandle`
  permission across sessions where possible. On other browsers, a
  `<input type="file" webkitdirectory>` fallback is used (files are
  available for the current session only).
- **FR-2**: Only supported audio extensions are ingested: `mp3, flac, wav,
ogg, m4a, aac, opus, weba`. Unsupported files are silently skipped.
- **FR-3**: For each file, the app MUST attempt to read ID3/Vorbis/MP4 tags
  (title, artist, album, genre, track number, embedded artwork). Missing or
  unreadable tags MUST fall back to: title = filename (extension stripped),
  artist = "Unknown Artist", album = "Unknown Album", genre =
  "Uncategorized" — ingestion must never fail outright due to bad tags.
- **FR-4**: Track identity is derived from `hash(name, size, lastModified)`
  so re-scanning the same folder updates rather than duplicates entries.
- **FR-5**: Track metadata (not the raw audio) is persisted to IndexedDB so
  the library list survives a reload.

### 4.2 Playback

- **FR-6**: Clicking a track plays it immediately and sets the play queue to
  the currently visible (filtered/searched) track list, starting at the
  clicked track's position.
- **FR-7**: Transport controls: play/pause (toggle), stop (resets position
  to 0), next, previous (restarts current track if >3s in, else goes to the
  prior track — standard player convention), skip forward/back (±10s).
- **FR-8**: Shuffle toggles a randomized play order over the current queue.
  Repeat cycles through off → all → one.
- **FR-9**: Volume is adjustable 0–100% via a rotary knob (mouse drag or
  arrow-key accessible) and via keyboard shortcuts.
- **FR-10**: A sleep timer (15/30/45/60 min or off) pauses playback
  automatically when it elapses.
- **FR-11**: An optional "vinyl crackle" ambience layer (synthesized noise,
  not a licensed sample) can be toggled on/off independent of the track
  audio.

### 4.3 Visuals

- **FR-12**: The record graphic spins continuously while `isPlaying` is
  true and stops (holds position) when paused/stopped.
- **FR-13**: The tonearm animates to a "playing" angle (resting on the
  record) when playing and lifts to a "rest" angle when paused/stopped.
- **FR-14**: Album artwork (from tags, if present) displays at the record's
  center label; a themed fallback displays otherwise.
- **FR-15**: A frequency visualizer reflects the currently playing audio in
  real time (via `AnalyserNode`), rendered as bars beneath/around the
  turntable.

### 4.4 Library browsing

- **FR-16**: Categories are auto-derived from the library: "All Songs",
  "Favorites", "Recently Played" (smart categories) plus one category per
  distinct genre tag present in the library (including "Uncategorized" for
  tracks without a genre).
- **FR-17**: Selecting a category filters the visible track list; search
  further filters within the selected category (title/artist/album,
  case-insensitive substring match).
- **FR-18**: Each track row shows a favorite toggle; toggling persists to
  IndexedDB immediately.

### 4.5 Keyboard shortcuts

| Key       | Action            |
| --------- | ----------------- |
| Space     | Play / pause      |
| →         | Skip forward 10s  |
| ←         | Skip backward 10s |
| Shift + → | Next track        |
| Shift + ← | Previous track    |
| ↑ / ↓     | Volume up / down  |
| S         | Stop              |

Shortcuts are suppressed while focus is in a text input/textarea/
contenteditable element.

## 5. Non-Functional Requirements

- **NFR-1 (Performance)**: First meaningful paint should be fast on a
  typical broadband connection; the production bundle is code-split
  (vendor/motion/tag-parsing chunks) to keep the initial JS payload small.
  Lighthouse performance score target: ≥ 85 (CI-enforced as a warning, not
  a hard gate, to avoid environment-dependent flakiness).
- **NFR-2 (Accessibility)**: Interactive elements have accessible names
  (`aria-label`/`aria-pressed`/`role="slider"` etc. as appropriate).
  Lighthouse accessibility score target: ≥ 90 (CI-enforced).
- **NFR-3 (Responsiveness)**: The layout must work down to ~360px viewport
  width without horizontal scrolling (verified in e2e tests).
- **NFR-4 (Resilience)**: A single unparseable/corrupt audio file must not
  crash the app or block the rest of the queue — errors surface in store
  state (`error`) rather than throwing uncaught.
- **NFR-5 (Privacy)**: No audio file or its metadata leaves the browser.
  There is no backend in v1; IndexedDB is local to the browser profile.
- **NFR-6 (Testability)**: Playback logic (AudioEngine) is isolated from
  React so it can be unit tested against a mocked `AudioContext` without a
  real audio backend.

## 6. Architecture Overview

Feature-based structure (`src/features/{player,library,categories,queue}`),
each owning its state (Zustand store), components, and pure logic modules.
See `ARCHITECTURE.md` for the full breakdown and the audio-engine design in
detail.

## 7. Data Model (IndexedDB, via Dexie)

```
tracks: {
  id: string              // hash(name, size, lastModified)
  title: string
  artist: string
  album: string
  genre: string
  trackNumber: number | null
  pictureUrl: string | null   // object URL to embedded artwork, if any
  addedAt: number              // epoch ms
  playCount: number
  lastPlayedAt: number | null  // epoch ms
  isFavorite: boolean
  hasHandle: boolean            // true if backed by a FileSystemFileHandle
}
```

## 8. Browser Support

- **Primary target**: Latest Chrome/Edge/Brave (File System Access API,
  full persistence of folder access across sessions).
- **Secondary target**: Firefox/Safari — full playback and library features
  work via the `<input webkitdirectory>` fallback, but re-adding the folder
  is required each session since file handles can't be persisted.

## 9. Known Limitations (v1)

- Non-Chromium browsers cannot persist file access across reloads (browser
  platform limitation, not a bug) — the user re-selects their folder.
- No gapless crossfade between tracks yet (see CHANGELOG "Unreleased" for
  roadmap items).
- Loudness normalization (ReplayGain-style) across tracks is not yet
  implemented.
