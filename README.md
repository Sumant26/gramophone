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

## Tech Stack

- **React 19** + **Vite** (JavaScript, not TypeScript, per project choice)
- **Zustand** for state management
- **Web Audio API** (via a hand-rolled `AudioEngine`) for playback — not the
  bare `<audio>` tag — for precise control over timing, volume, and the
  crackle/visualizer layers
- **Dexie** (IndexedDB) for local persistence
- **jsmediatags** for ID3/Vorbis/MP4 tag parsing
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
3. Push to `main` — the workflow builds and deploys automatically.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development workflow,
commit conventions, and testing expectations.

## License

[MIT](./LICENSE)
