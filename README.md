# 🎶 Gramophone

A cozy, vinyl-inspired music player for your own local music library — built
as a web app. Pick a folder of songs, and the record spins, the tonearm
drops, and you browse your library by genre, favorites, or search, all
wrapped in a moody "Velvet Nocturne" theme — deep plum and near-black with
warm gold accents, like a late-night listening room.

![tech](https://img.shields.io/badge/stack-React%20%2B%20Vite-informational)
![tests](https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-brightgreen)

## Features

- 🎧 Plays your own local audio files (mp3, flac, wav, ogg, m4a, aac, opus) —
  nothing is uploaded anywhere; everything stays in your browser.
- 💿 A spinning record + animated tonearm that reacts to play/pause state.
- 📚 Auto-categorized library (by genre, favorites, recently played) with
  search.
- ⏯️ Full transport controls: play/pause, stop, next/previous, skip ±10s,
  shuffle, repeat (off/all/one).
- 🔊 A tactile rotary volume knob (mouse-drag or keyboard operable).
- 📈 A live frequency visualizer synced to what's actually playing.
- 🕯️ Optional vinyl-crackle ambience for a nostalgic touch.
- 😴 Sleep timer.
- ⌨️ Full keyboard shortcuts (see below).
- 💾 Your library, favorites, and play counts persist across reloads via
  IndexedDB — no backend, no account.
- 📺 Optional **YouTube** tab: search YouTube (via the official Data API v3,
  scoped to its Music category) and play results through the official
  IFrame Player API. The turntable keeps spinning and the tonearm keeps
  tracking, but the visualizer and crackle ambience are hidden for these
  tracks — YouTube's audio never reaches our Web Audio graph, by design (see
  [Music Sources](#music-sources) below). Requires a free API key; the app
  works fully without one, just without this tab.

## Tech Stack

- **React 19** + **Vite** (JavaScript, not TypeScript, per project choice)
- **Zustand** for state management
- **Web Audio API** (via a hand-rolled `AudioEngine`) for playback — not the
  bare `<audio>` tag — for precise control over timing, volume, and the
  crackle/visualizer layers
- **Dexie** (IndexedDB) for local persistence
- **jsmediatags** for ID3/Vorbis/MP4 tag parsing
- **YouTube Data API v3** + the official **YouTube IFrame Player API** for
  the optional YouTube tab (no unofficial/scraping APIs — see
  [Music Sources](#music-sources))
- **Tailwind CSS v4** for styling, **Framer Motion** for the tonearm
  animation
- **Vitest** + **React Testing Library** for unit/component tests,
  **Playwright** for e2e tests
- **ESLint 9** (flat config) + **Prettier**, **Husky** + **lint-staged** +
  **commitlint** (Conventional Commits) for local quality gates
- **GitHub Actions** for CI (lint, test, build, e2e, Lighthouse, security
  audit) and CD (Vercel)

See [`spec.md`](./spec.md) for the full functional/technical specification
and [`ARCHITECTURE.md`](./ARCHITECTURE.md) for how the codebase is
organized.

## Getting Started

```bash
npm install
npm run dev
```

Open the printed local URL, then click the folder icon in the header to add
music. In Chrome/Edge/Brave you'll get a native folder picker and the app
remembers folder access across sessions; in other browsers, a file picker is
used instead (re-add the folder each session).

### Enabling the YouTube tab (optional)

```bash
cp .env.example .env
# then edit .env and set VITE_YOUTUBE_API_KEY, then restart `npm run dev`
```

Get a free key at [console.cloud.google.com](https://console.cloud.google.com):
new project → enable "YouTube Data API v3" → Credentials → Create API key.
For a public deployment, restrict the key to your site's domain (HTTP
referrer restriction) and set `VITE_YOUTUBE_API_KEY` as an environment
variable in your hosting provider (e.g. Vercel project settings). Without a
key configured, the rest of the app works normally — the YouTube tab just
shows a message explaining how to add one.

### Available scripts

| Script                            | What it does                                   |
| --------------------------------- | ---------------------------------------------- |
| `npm run dev`                     | Start the Vite dev server                      |
| `npm run build`                   | Production build to `dist/`                    |
| `npm run preview`                 | Serve the production build locally             |
| `npm run lint` / `lint:fix`       | ESLint check / autofix                         |
| `npm run format` / `format:check` | Prettier write / check                         |
| `npm test`                        | Run unit tests once (Vitest)                   |
| `npm run test:watch`              | Run unit tests in watch mode                   |
| `npm run test:coverage`           | Unit tests with coverage report                |
| `npm run test:e2e`                | Run Playwright e2e tests (builds+serves first) |

## Keyboard Shortcuts

| Key         | Action            |
| ----------- | ----------------- |
| `Space`     | Play / pause      |
| `→`         | Skip forward 10s  |
| `←`         | Skip backward 10s |
| `Shift + →` | Next track        |
| `Shift + ←` | Previous track    |
| `↑` / `↓`   | Volume up / down  |
| `S`         | Stop              |

Shortcuts are automatically disabled while typing in the search box.

## Music Sources

This app plays music from two kinds of sources, and they have real,
non-negotiable technical differences worth knowing about:

- **Your local files** play through the Web Audio API, so the app has raw
  access to the audio samples — that's what powers the live visualizer and
  the synthesized vinyl-crackle ambience.
- **YouTube** tracks play through YouTube's own official embedded player.
  YouTube never exposes raw audio to embedding pages (by policy), so the
  visualizer and crackle toggle are unavailable for these tracks — the
  turntable and tonearm still animate, but there's nothing to visualize or
  layer crackle onto. The player itself must also stay visibly on-screen per
  YouTube's terms, which is why it shows up as a small "screen" in the
  cabinet rather than being fully hidden.
- Only the **official** YouTube Data API v3 (for search) and IFrame Player
  API (for playback) are used — deliberately, not an unofficial YouTube
  Music API. Unofficial APIs scrape a private, undocumented interface that
  can (and does) break without notice and violates YouTube's Terms of
  Service, so this app doesn't use one. The trade-off: search is scoped to
  YouTube's general "Music" video category rather than a curated
  music-only catalog, so results can occasionally include things like
  interviews or live-session footage alongside actual tracks.
- **Spotify** isn't integrated yet. The only legitimate path (the Spotify
  Web Playback SDK) requires a Spotify Premium account for every listener
  and, like YouTube, gives no access to raw audio — so it would have the
  same visualizer/crackle limitation. Open an issue or a PR if you'd like to
  add it.

## Browser Support

Best experience in **Chrome, Edge, or Brave** (uses the File System Access
API to remember your music folder across visits). Firefox and Safari work
too, but you'll need to re-select your folder each session since those
browsers can't persist folder access permissions the same way.

## Privacy

Your music files, their metadata, and everything about your library stay in
your browser (IndexedDB). Nothing is uploaded to any server — there is no
backend in this app.

## Deployment

This repo deploys to **Vercel** via `.github/workflows/deploy.yml` on every
push to `main` (and posts preview URLs on PRs). To wire it up:

1. Create a project on [vercel.com](https://vercel.com) linked to this repo
   (or run `vercel link` locally once to generate `.vercel/project.json`).
2. Add these repository secrets (Settings → Secrets and variables →
   Actions): `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
3. To enable the YouTube tab on the deployed site, add `VITE_YOUTUBE_API_KEY`
   as an environment variable in the Vercel project settings (not a GitHub
   secret — it's read at build time by Vite). Optional; the rest of the app
   works without it.
4. Push to `main` — the workflow builds and deploys automatically.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow,
commit conventions, and testing expectations.

## License

[MIT](./LICENSE)
