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

## Daily love notes

The navbar bell opts a browser into three daily push notifications in each
subscriber's local time: a loving morning note near 9:00 AM and an encouraging
afternoon note at a daily-varying time between 3:00 PM and 5:30 PM. A third
text-only playful note arrives at a daily-varying time from 6:00 PM through
11:59 PM. The two original 1,000-message collections are generated in
`src/loveNotes.js`; the OneSignal sender is `scripts/send-love-note.mjs`.

Notifications use a diorama-based icon, a transparent heart badge, and one
**Open NumNum** action. Rich artwork appears occasionally (and on Tinglish
notes) so it stays special. Every rich Chrome notification uses an individual
banner from `assets/stickers/notification/`, never a complete sticker sheet.
The selected sticker ID is included in the message metadata.
Tinglish appears once per week on Sunday, alternating between the morning and
afternoon slot. The other 13 weekly notifications are English.
Safari uses the installed NumNum app icon plus the same concise title, emoji,
message, and click-through URL. Apple does not support web action buttons or
Chrome-style rich notification images, so those enhancements degrade quietly.
Regenerate these assets after changing the diorama with:

```powershell
./scripts/generate-notification-assets.ps1
./scripts/extract-stickers.ps1
```

The sticker extractor creates 79 transparent PNGs for the album, rewards, and
Memory Match, plus 79 porcelain notification cards. Generated files live under
`public/assets/stickers/individual/` and `public/assets/stickers/notification/`.

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
5. Run the **Send daily love notes** workflow manually with dry-run enabled to
   preview its payload. Scheduled runs send to opted-in browsers automatically.

Preview a message locally without contacting OneSignal:

```bash
npm run notifications:dry-run
```

The GitHub schedule runs at 00:00 UTC and queues both messages with OneSignal
for their per-subscriber local delivery times. GitHub may disable scheduled
workflows after long periods of repository inactivity; re-enable the workflow
if that occurs.


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
