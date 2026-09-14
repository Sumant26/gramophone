# Design Tokens — "Velvet Nocturne" Theme

Defined in `src/index.css` under the `@theme` block (Tailwind v4 CSS-first
config). This doc explains the _intent_ behind the palette so it stays
consistent as new components are added — don't hardcode hex values in
components; use the token names below.

> **History**: the app originally shipped with a lighter "Amber Parlor"
> daytime palette. After reviewing three directions (Amber Parlor / Velvet
> Nocturne / Sage Cottage — see the design mockups), Velvet Nocturne was
> chosen as the app's committed identity. The token _names_ stayed the
> same (`--color-cozy-*`) so components didn't need touching — only the
> values changed. This is a deliberate single theme (see "Why single-theme"
> below), not a dark-mode variant of a light default.

## Palette rationale

Deep plum and near-black with warm gold — a late-night listening room
rather than a sunlit parlor. The mood is deliberately more dramatic/moody
than a generic "cozy" default: the record itself, the wood cabinet, and the
background all sit in a narrow dark range, so the warm gold brass and the
orange-red accent are what carry light and draw the eye — mainly to the
turntable and the currently-playing track.

| Token                       | Value     | Role                                                                                                                                                                                                                                                                                             |
| --------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--color-cozy-bg`           | `#211320` | Page background — deep aubergine/plum                                                                                                                                                                                                                                                            |
| `--color-cozy-surface`      | `#2b1a29` | Cards/panels (track list, queue panel)                                                                                                                                                                                                                                                           |
| `--color-cozy-surface-2`    | `#34202f` | Smaller controls (search, chips, buttons) — one step lighter than `surface` for layered depth                                                                                                                                                                                                    |
| `--color-cozy-wood`         | `#3c2320` | Cabinet gradient (light end) — the panel the turntable sits on                                                                                                                                                                                                                                   |
| `--color-cozy-wood-dark`    | `#190f10` | Cabinet gradient (dark end)                                                                                                                                                                                                                                                                      |
| `--color-cozy-brass`        | `#c99a52` | Borders, tonearm, knob body, visualizer bars                                                                                                                                                                                                                                                     |
| `--color-cozy-brass-light`  | `#e9c684` | Brandmark, tonearm highlight, record label ring                                                                                                                                                                                                                                                  |
| `--color-cozy-ink`          | `#f1e2ea` | Primary text (light, since the ground is dark)                                                                                                                                                                                                                                                   |
| `--color-cozy-ink-muted`    | `#b199ac` | Secondary/meta text                                                                                                                                                                                                                                                                              |
| `--color-cozy-accent`       | `#d9663f` | Primary button, active/selected state, play button                                                                                                                                                                                                                                               |
| `--color-cozy-on-accent`    | `#241014` | Text/icon color _on top of_ `--color-cozy-accent` — the accent is a bright warm orange, so dark text reads better there than light ink does. Distinct from `--color-cozy-surface`, even though in the old light theme they happened to be similar values — don't reuse `surface` for this again. |
| `--color-cozy-vinyl`        | `#120a11` | The record itself                                                                                                                                                                                                                                                                                |
| `--color-cozy-vinyl-groove` | `#1f1520` | Platter beneath the record                                                                                                                                                                                                                                                                       |

## Why single-theme (no light/dark toggle)

The original theme supported both a light default and a `prefers-color-
scheme: dark` override. Velvet Nocturne is dark by design — it's a chosen
_mood_, not a light theme's dark counterpart — so `src/index.css` no longer
branches on `prefers-color-scheme`. If a future request asks for a genuine
light alternative (a second identity, not "make dark mode"), reintroduce
the media-query pattern rather than trying to invert these tokens.

## Typography

- **Display** (`--font-serif-display`, [Newsreader](https://fonts.google.com/specimen/Newsreader),
  used italic): the app title, "Now Playing" title, category/section
  headers. Newsreader's italic has a literary, late-night-reading-room
  quality that fits the "nocturne" mood better than an upright serif would.
- **Body** (`--font-sans-body`, [Public Sans](https://fonts.google.com/specimen/Public+Sans)):
  everything else — clean and highly legible against the dark ground,
  without competing with the display face.
- Both are loaded from Google Fonts in `index.html` (`<link
rel="preconnect">` + stylesheet), not self-hosted — acceptable here since
  this is a deployed web app, not a sandboxed artifact.

## Motion

- The record's spin (`animate-spin-record`, `src/index.css`) is a plain CSS
  `@keyframes` rotation — cheap, GPU-accelerated, and doesn't need to pause/
  resume precisely in sync with audio (only start/stop matters visually).
  It's disabled under `prefers-reduced-motion: reduce`.
- The tonearm's play/pause pivot uses Framer Motion's spring physics
  (`type: 'spring', stiffness: 80, damping: 14` in `Turntable.jsx`) rather
  than a linear tween, so it has a little physical "weight" to it when it
  drops onto or lifts off the record.

## Layout note: the "cabinet"

`Turntable.jsx` intentionally has **no background of its own** — it's
designed to sit directly on the wood-gradient "cabinet" panel that hosts it
(`<aside>` in `App.jsx`, styled with `--color-cozy-wood` →
`--color-cozy-wood-dark`). This is what makes the turntable read as a
physical object resting on furniture rather than a graphic floating in a
card. The cabinet is pinned to the left on wide screens (`lg:grid-cols-
[480px_1fr]`) and stacks above the library on narrow screens.

## Adding a new color

1. Decide which _role_ it fills (background, border, text, accent) — reuse
   an existing token if one already fills that role.
2. Keep it within the plum/near-black + warm gold/orange family unless a
   new deliberate direction is being built (see the three-direction mockup
   for reference). Reserve `--color-cozy-accent` for emphasis, not general
   decoration.
3. If it needs a dedicated "on-accent" or "on-brass" text color the way
   `--color-cozy-on-accent` exists for the accent, add it explicitly rather
   than reaching for `--color-cozy-surface` or `--color-cozy-ink` and hoping
   the contrast works out.
