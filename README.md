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

## Morning love notes

The hub includes an opt-in for one browser push notification near 9:00 AM in
each subscriber's local time. The 1,000 original messages are generated in
`src/loveNotes.js`; the OneSignal sender is `scripts/send-love-note.mjs`.

1. Create a **Custom Code** Web app in OneSignal. Use the site origin
   `https://unigalactix.github.io` and enable Auto Resubscribe. The SDK uses the
   dedicated worker at `/NumNum/push/onesignal/OneSignalSDKWorker.js` with scope
   `/NumNum/push/onesignal/`; Custom Code does not require dashboard worker-path
   fields.
2. The public OneSignal App ID is already configured in the web SDK and sender.
   In GitHub repository **Settings → Secrets and variables → Actions**, add only
   the `ONESIGNAL_REST_API_KEY` repository secret.
3. For local testing with a different OneSignal app, copy `.env.example` to
   `.env.local` and replace the App ID. Never put the REST API key in a Vite
   environment file.
4. Deploy the site, open it on the recipient's device, and choose **Enable
   notes**. On iPhone, first add the site to the Home Screen and open it there.
5. Run the **Send morning love note** workflow manually with dry-run enabled to
   preview its payload. Scheduled runs send to opted-in browsers automatically.

Preview a message locally without contacting OneSignal:

```bash
npm run notifications:dry-run
```

The GitHub schedule runs at 12:00 UTC and asks OneSignal to deliver at each
subscriber's next local 9:00 AM. GitHub may disable scheduled workflows after
long periods of repository inactivity; re-enable the workflow if that occurs.


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
