# AGENTS.md — NumNum

A small, personal "little world of love" web app (a gift). Treat all copy with care and keep the tone soft, playful, and romantic.

## Stack
- Vite + React 18 + Zustand + Tailwind CSS + Framer Motion.
- Emoji are rendered site-wide as **Twemoji** images (loaded in `index.html`, parsed in `App.jsx`) so they look identical on every device.
- Headings use the **Dancing Script** font (`font-script`); body uses **Quicksand** (`font-sans`).

## Commands
- Dev server: `npm run dev` (served under base path `/NumNum/`, e.g. http://localhost:5173/NumNum/).
- Build: `npm run build` — always run this to verify changes compile before finishing.
- Deploy (ONLY when explicitly asked): `npm run deploy` (vite build + gh-pages to the `gh-pages` branch).

## Git / deployment rules
- ONLY commit, push, or deploy when the user explicitly asks.
- Commit AND push as **Unigalactix**:
  `git -c user.name="Unigalactix" -c user.email="Unigalactix@users.noreply.github.com" commit ...`
- Repo: `Unigalactix/NumNum`. Source work happens on `VERSION-2`; `main` is the mainline. Pages serves from `gh-pages`.
- To verify work, build/run locally — do NOT push or deploy just to verify.

## Content lives in `src/content.js`
All personal copy is edited here. Key sections:

### Entry gate (`gate`)
- `question`, `answers` (array — any match unlocks, case/space/punctuation-insensitive), `answer` (display string for the reveal), `almost` (soft nudge for a partial guess), `hint`, `success`.

### Love letters
- **Previous Letters** (`previousLetters`): an array of past letters. Each object is:
  ```js
  { date: 'August 7, 2026 · 10:30 AM', title: 'My Love,', body: `...`, signoff: '...' }
  ```
  - `date` is a free-form string shown as the timestamp. **Always add a date + time when a letter is created.**
  - Add a new letter at the **top** of the list so the newest shows first.
  - Each letter opens with an envelope + typewriter animation (shared `components/TypedLetter.jsx`).

- **The Love Letter / finale** (`finale`): the featured letter.
  - `awaiting: true` means there is **no new letter** — in this state the finale **opens freely** (no need to finish the games) and shows an "Awaiting a new letter…" message.
  - When a real new letter is written, set `awaiting: false` (or remove it) and fill in `title`/`body`/`signoff` (and optional `date`). The finale then locks again behind completing all 5 core games.

## Key behaviors to preserve
- Finale gating logic lives in `components/Hub.jsx` as `finaleReady = allDone || !!content.finale.awaiting`.
- Reduced-motion users get instant text (no typewriter) — keep `useReducedMotion` support in letter components.
- Modals close on Escape and trap focus (`components/Modal.jsx`).
- Keep the glassmorphism look, pastel gradient background, and `:focus-visible` rings intact.

## Do / Don't
- Do keep copy lowercase-casual where it already is; match existing voice.
- Do run `npm run build` after edits.
- Don't add analytics, tracking, or external calls beyond the existing Twemoji/font CDNs.
- Don't create markdown docs for changes unless asked.
