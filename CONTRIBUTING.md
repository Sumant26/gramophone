# Contributing

## Setup

```bash
npm install
npm run dev
```

Husky hooks are installed automatically via the `prepare` script.

## Workflow

1. Branch off `main`: `git checkout -b feat/short-description`.
2. Make your change. Keep it scoped — smaller PRs review faster.
3. Add or update tests for any behavior change (see "Testing expectations"
   below).
4. Run the full local check before pushing:
   ```bash
   npm run lint && npm run format:check && npm test && npm run build
   ```
5. Commit using [Conventional Commits](#commit-messages) — this is enforced
   by commitlint on every commit.
6. Open a PR against `main` using the PR template. CI must pass before
   merge.

## Commit messages

This repo uses [Conventional Commits](https://www.conventionalcommits.org/),
enforced by commitlint (`.husky/commit-msg`). Format:

```
<type>(<optional scope>): <short summary>

<optional longer body>
```

Common types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`,
`perf`, `ci`. Examples:

```
feat(player): add gapless playback between queued tracks
fix(volume-knob): clamp drag delta so it can't exceed 0-1
docs: expand README with deployment steps
```

## Testing expectations

- **New logic** (a store action, a pure utility, a hook) needs a unit test
  covering its main behavior and at least one edge case.
- **New components** need a test asserting on user-visible behavior
  (what renders, what a click/keypress does) — not implementation details
  like internal state shape.
- **New user-facing flows** (a new screen, a new primary interaction)
  should get a Playwright e2e smoke test in `e2e/`.
- Don't add tests that assert on CSS class names or DOM structure for their
  own sake — prefer accessible queries (`getByRole`, `getByLabelText`) so
  tests double as an accessibility check.

Run `npm run test:coverage` locally if you want to see what's covered;
coverage isn't a hard gate but big untested additions should raise a flag
in review.

## Code style

- ESLint + Prettier are the source of truth — don't hand-format against
  them. `npm run lint:fix` and `npm run format` fix most things
  automatically, and both run on staged files via lint-staged before every
  commit.
- Prefer plain, prop-driven components over ones that reach into global
  state directly — makes them reusable and easy to test (see
  `ARCHITECTURE.md`).
- Keep `AudioEngine` (`src/features/player/audioEngine.js`) as the _only_
  place that touches the Web Audio API. If you need new audio behavior, add
  it there and expose a method, rather than reaching into `AudioContext`
  from a component or the store.

## Design changes

If you're changing colors/spacing/type, update the tokens in
`src/index.css` (`@theme` block) rather than hardcoding values in
components, and see `docs/design-tokens.md` for the palette's intent.

## Reporting bugs / requesting features

Use the issue templates — they ask for the details that make triage fast.
