# Game Tracker

A mobile-first progressive web app (PWA) for scoring little league baseball and softball games. Designed to be used on an iPhone during live games with no backend, no login, and no cost to run.

---

## Features

- **Baseball & Softball support** — separate team and opponent profiles per sport
- **Team & roster management** — save rosters with jersey numbers at the start of the season
- **Opponent management** — save recurring opponents with their own rosters and team colors
- **Live game scoring** — runs, outs, ball/strike count, base runners, batting order
- **Ball in Play tracking** — singles, doubles, triples, home runs, fielder's choice, double plays
- **Automatic run limit enforcement** — single or tiered limits (e.g. 3 runs for innings 1–3, 10 runs after)
- **Batting order** — drag-to-set order before the game, auto-advances through the lineup during play
- **Runner tracking** — per-player base status (1st, 2nd, 3rd, Scored, Out) synced with the base diamond
- **Game history** — completed games saved locally with box score and both lineups
- **Undo** — up to 40 steps of undo during a live game
- **Installable PWA** — add to iPhone home screen for a native app feel, works offline

---

## Repository structure

```
games/
├── index.html       # Single-page app — all UI and logic
├── manifest.json    # PWA manifest for home screen install
├── sw.js            # Service worker for offline support
├── icons/
│   ├── icon-192.png # App icon (192×192)
│   └── icon-512.png # App icon (512×512)
└── README.md
```

---

## Deploying to GitHub Pages

1. Create a repository named **`games`** on your GitHub account.

2. Clone the repo and add the project files:
   ```bash
   git clone https://github.com/shelane/games.git
   cd games
   # copy index.html, manifest.json, sw.js, icons/ into this folder
   git add .
   git commit -m "feat: initial release of Game Tracker v1"
   git push origin main
   ```

3. Enable GitHub Pages:
    - Go to your repo on GitHub
    - Navigate to **Settings → Pages**
    - Under **Source**, select **Deploy from a branch**
    - Select branch: `main`, folder: `/ (root)`
    - Click **Save**

4. After a minute or two, your app will be live at:
   ```
   https://shelane.github.io/games/
   ```

> **Note:** GitHub Pages serves from `https://shelane.github.io/games/`. The `manifest.json` and `sw.js` use `/games/` as the scope and start URL to match this path. If you rename your repo, update `start_url`, `scope`, and the `ASSETS` array in `sw.js` accordingly.

---

## Installing on iPhone

1. Open Safari and navigate to your GitHub Pages URL:
   ```
   https://shelane.github.io/games/
   ```

2. Tap the **Share** button (the box with an arrow pointing up) at the bottom of the screen.

3. Scroll down and tap **Add to Home Screen**.

4. Name it **Game Tracker** (or whatever you prefer) and tap **Add**.

The app will appear on your home screen with a standalone icon. It launches without browser chrome (no address bar) and works offline after the first load.

> **iOS note:** Safari is required for PWA installation on iPhone. Chrome and other iOS browsers do not support Add to Home Screen with full PWA capabilities.

---

## Icons

The app requires two icon files in an `icons/` folder:

| File | Size | Usage |
|---|---|---|
| `icons/icon-192.png` | 192×192 px | Android home screen, PWA manifest |
| `icons/icon-512.png` | 512×512 px | Splash screen, high-res displays |

You can generate icons from any image using a free tool like [PWA Builder](https://www.pwabuilder.com/imageGenerator) or [RealFaviconGenerator](https://realfavicongenerator.net). A simple baseball or softball emoji on a colored background works well.

---

## Data storage

All data is stored in the browser's `localStorage` — nothing is sent to a server. Clearing browser data or site data in Safari settings will erase saved teams, opponents, and game history.

| Key | Contents |
|---|---|
| `gt_teams` | Saved team profiles and rosters |
| `gt_opps` | Saved opponent profiles and rosters |
| `gt_games` | Completed game records |
| `gt_game` | Active in-progress game |
| `gt_undo` | Undo history for the active game |

---

## License

MIT — free to use, modify, and distribute.