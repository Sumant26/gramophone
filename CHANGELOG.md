# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this
project doesn't yet follow strict SemVer releases (pre-1.0, single main
branch), so entries are grouped by date instead of version until the first
tagged release.

## [Unreleased]

### Roadmap / not yet implemented

- Gapless crossfade between queued tracks.
- Loudness normalization (ReplayGain-style) across tracks.
- Drag-to-reorder the queue.
- Multi-select + batch actions in the track list.
- A second, lighter theme as an explicit alternative (not a system dark-
  mode auto-switch — Velvet Nocturne is now a deliberate single identity,
  see `docs/design-tokens.md`).
- Spotify integration, via the Spotify Web Playback SDK (requires every
  listener to have Spotify Premium; like YouTube, gives no raw-audio access,
  so it would share the same visualizer/crackle limitation). Not started.

## 2026-09-14 — Add a YouTube source (official APIs only)

### Added

- A "YouTube" tab next to "My Library": search via the official **YouTube
  Data API v3** (scoped to `videoCategoryId=10`, YouTube's "Music"
  category), playback via the official **YouTube IFrame Player API**,
  styled as a small brass-framed "screen" inset in the cabinet.
- `usePlayerStore` now owns two engines — `AudioEngine` (local files) and
  the new `YouTubeEngine` — and routes every transport action to whichever
  one owns the current track, keyed off a new `source: 'local' | 'youtube'`
  field on track objects. `next`/`previous`/`shuffle`/`repeat` all work
  across a queue of YouTube results the same way they do for local tracks.
- `.env.example` documenting the optional `VITE_YOUTUBE_API_KEY`; the app
  works fully without one, the YouTube tab just explains how to add it.

### Changed

- The turntable and tonearm keep animating during YouTube playback, but the
  frequency visualizer and vinyl-crackle toggle are hidden while a YouTube
  track is active — YouTube's embedded player never exposes raw audio
  samples to the page, so there's nothing for either to attach to.

### Decided against

- An unofficial/reverse-engineered YouTube Music API. It would let the
  YouTube tab feel more like a real music catalog (no "Music"-category
  approximation, and Spotify-Premium-free), but it scrapes a private,
  undocumented interface — it violates YouTube's Terms of Service and can
  break without notice. Only the official Data API v3 and IFrame Player API
  are used here, deliberately, even though that means search results can
  occasionally include non-music content (interviews, live-session
  footage) that a curated catalog wouldn't.

## 2026-09-14 — Velvet Nocturne redesign

### Changed

- Replaced the original light "Amber Parlor" theme with **Velvet
  Nocturne**: deep plum/near-black with warm gold accents, chosen after
  reviewing three look-and-feel directions (Amber Parlor / Velvet Nocturne
  / Sage Cottage). Typography changed to Newsreader (italic display) +
  Public Sans (body), loaded from Google Fonts.
- Reworked the main layout: the turntable moved from a small panel on the
  right to a large wood-toned "cabinet" panel on the left
  (`lg:grid-cols-[480px_1fr]`), with the library on the right. The
  turntable itself grew (no more `max-w-md` cap) and no longer draws its
  own background — it now sits directly on the cabinet's wood gradient,
  reading as a physical object on furniture rather than a floating card.
- Replaced the 🎶 emoji title with a drawn brandmark (a plain ring + dot,
  echoing the record label) for a more considered, less generic feel.
- Added a dedicated `--color-cozy-on-accent` token and a `--color-cozy-
surface-2` token (previously `--color-cozy-surface` was reused for both
  "panel background" and "text on the accent color", which only worked by
  coincidence in the light theme).
- This is now an intentionally single, committed theme — removed the
  `prefers-color-scheme: dark` branch rather than trying to invert the new
  dark palette into a second dark-mode variant.

## 2026-09-14 — Initial build

### Added

- Core playback: play/pause/stop/next/previous/skip ±10s, shuffle, repeat
  (off/all/one), volume, backed by a hand-rolled `AudioEngine` on the Web
  Audio API.
- Gramophone visuals: spinning record synced to playback state, animated
  tonearm (Framer Motion), live frequency visualizer, optional synthesized
  vinyl-crackle ambience.
- Local library: folder import (File System Access API with a
  `<input webkitdirectory>` fallback), ID3/Vorbis/MP4 tag parsing
  (jsmediatags), auto-derived categories (genre, favorites, recently
  played), search, favorites, IndexedDB persistence (Dexie).
- Sleep timer.
- Full keyboard shortcut set.
- Cozy sepia/brass visual theme with light/dark variants.
- Engineering scaffolding: ESLint 9 (flat config) + Prettier, Husky +
  lint-staged + commitlint (Conventional Commits), Vitest + Testing Library
  unit/component tests, Playwright e2e tests, GitHub Actions CI (lint,
  unit tests + coverage, build, e2e, Lighthouse CI, dependency audit) and
  CD to Vercel, Dependabot, issue/PR templates.
- `spec.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `docs/design-tokens.md`.
