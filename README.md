# For My Num Num 💗

A little interactive love-letter website — a riddle gate, five mini-games, and a
grand finale letter — built with **Vite + React + Tailwind** and hosted on
**GitHub Pages**.

## Run it locally

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173/NumNum/).

## Where to edit your content

Everything personal lives in **`src/content.js`** — her name, the riddle answer,
quiz questions, the reasons list, and the final letter. Just edit the text.

Photos: drop image files into **`public/assets/`** and list them in the `photos`
array in `src/content.js` (see `public/assets/README.txt`).

## The flow

1. **Riddle gate** — she answers "our first meal" (Din Tai Fung) to enter.
2. **Hub** — five mini-games: Memory Match, Quiz, Scratch Card, Jigsaw Puzzle,
   Love Meter. Each reveals a sweet note.
3. **Finale** — completing all five unlocks the heartfelt letter with confetti.

Progress is saved in the browser (localStorage), and there's a mute toggle and a
"start over" button.

## Deploy to GitHub Pages

1. Create a GitHub repo named **`NumNum`** (the name must match `base` in
   `vite.config.js` — currently `/NumNum/`). If you use a different repo name,
   update `base` to `/<your-repo-name>/`.
2. Push this project to the repo's `main` branch.
3. Deploy the built site to the `gh-pages` branch:

   ```bash
   npm run deploy
   ```

4. In the repo: **Settings → Pages → Source → Deploy from a branch →
   `gh-pages` / root**.
5. Your site goes live at `https://<your-username>.github.io/NumNum/`.

> Tip: for a root site at `https://<username>.github.io/`, name the repo
> `<username>.github.io` and set `base: '/'` in `vite.config.js`.

## Tech

- Vite + React 18
- Tailwind CSS (soft pastel theme)
- framer-motion (animations)
- zustand (progress state, persisted)
- Web Audio API sound effects (no audio files needed)
