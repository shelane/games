# Game Tracker — Functional Specification

Version 1.0

---

## Overview

Game Tracker is a single-page web application for scoring little league baseball and softball games in real time. It runs entirely in the browser with no server dependency. All state is persisted to `localStorage`.

---

## Data model

### Team
```
{
  id: string,
  name: string,
  sport: 'baseball' | 'softball',
  color: number,          // index into COLORS palette (0–11)
  roster: Player[]
}
```

### Player (roster entry)
```
{
  id: string,
  num: string,            // jersey number
  name: string
}
```

### Opponent
```
{
  id: string,
  name: string,
  sport: 'baseball' | 'softball',
  color: number,
  roster: Player[]
}
```

### Game (active and archived)
```
{
  id: string,
  away: string,           // team name
  home: string,
  cA: number,             // away color index
  cH: number,             // home color index
  type: 'baseball' | 'softball',
  ls: 'tiered' | 'single' | 'none',   // run limit style
  rl: number,             // single limit value
  el: number,             // tiered early limit
  ll: number,             // tiered late limit (999 = unlimited)
  sw: number,             // tiered switch-after inning index (0-based)
  aR: number[],           // away runs per inning
  hR: number[],           // home runs per inning
  outs: number,           // 0–2 (3 triggers half-inning advance)
  inning: number,         // 0-based current inning index
  half: 'away' | 'home',
  gameOver: boolean,
  bases: [boolean, boolean, boolean],   // 1st, 2nd, 3rd
  balls: number,          // 0–3
  strikes: number,        // 0–2
  luA: string[],          // away lineup (display strings)
  luH: string[],          // home lineup (display strings)
  bA: number,             // away current batter index
  bH: number,             // home current batter index
  pSt: { [key: string]: PlayerStatus },  // e.g. "away-2": "1st"
  date: string
}
```

### PlayerStatus
One of: `'none' | '1st' | '2nd' | '3rd' | 'scored' | 'out'`

---

## Run limit logic

Run limits cap how many runs a team can score in a single half inning.

### Limit styles
- **None** — no limit enforced
- **Single** — same limit applies to every inning
- **Tiered** — two limits with a switch point:
    - Innings 1 through `sw` use the early limit (`el`)
    - Innings `sw+1` onwards use the late limit (`ll`)
    - `ll = 999` means unlimited in late innings

### Enforcement
When a run is added (via any method) and the inning run total reaches the limit:
- The run is counted
- A toast notification appears: "Run limit reached — advancing to [next half]"
- After 800ms the half inning automatically advances

### Limit display
The "Runs Left" counter in the status strip shows:
- `—` when there is no limit
- The remaining runs allowed in the current half inning
- Turns amber at 1 run left, red at 0

---

## Inning management

- Innings are 0-indexed internally; displayed as 1-indexed
- The inning breakdown table grows dynamically — a new column is added each inning
- The inning indicator shows `▲ N` (top/away batting) or `▼ N` (bottom/home batting)
- There is no fixed inning limit — the game runs until "End Game" is tapped
- Advancing the half inning:
    - Clears outs to 0
    - Clears the base diamond
    - Clears the ball/strike count
    - Clears all player statuses (`pSt = {}`)
    - Does NOT change the batting order index — the next batter up is preserved

---

## Batting order

- Batting order is set via drag-to-reorder before the game starts
- Players can be moved to the bench (excluded from lineup) before the game
- During the game, the order cycles continuously
- **▶ Up** — current batter
- **On deck** — next batter (index + 1, wraps around)
- **Set up** badge — tap to manually set any player as current batter; their status is cleared if previously terminal

### Automatic batter advancement
The current batter index advances automatically when:
- The batter records an **out** (OUT button, 3 strikes)
- The batter reaches **base** (In Play → 1B/2B/3B/HR, FC, walk, →1st badge)
- The batter **scores** (no runners on base and +1 run is tapped)

### Bat-around
When the batting order cycles back to a player who was previously `scored` or `out` in the same inning, their status is automatically cleared to `none` so they can bat again.

---

## Ball / Strike count

- Balls: 0–4. At 4 balls, a walk is issued automatically.
- Strikes: 0–3. At 3 strikes, a strikeout is recorded automatically.
- The count resets on every batter advance.
- Count tracking is optional — outs and base advancement work independently of the count.

### Walk (4 balls)
1. Force-advances runners in sequence:
    - Runner on 3rd → Scored (run counted)
    - Runner on 2nd → 3rd
    - Runner on 1st → 2nd
2. Batter placed on 1st
3. Base diamond synced from player statuses
4. Batter advances to next in order
5. Run limit checked

### Strikeout (3 strikes)
1. Out recorded
2. Batter advances to next in order
3. If 3 outs, half inning advances

---

## Ball in Play (BIP) picker

Tapping **In Play** opens a picker with six options:

### 1B / 2B / 3B
All existing baserunners advance by the same number of bases as the hit:
- A runner who would advance past 3rd is marked `scored` and a run is counted
- Batter is placed at the corresponding base
- Base diamond is synced from player statuses
- Batter advances to next in order

### HR (Home Run)
- All existing runners score (runs counted per runner)
- Batter marked `scored`, run counted
- Batter advances to next in order

### FC (Fielder's Choice)
1. Batter placed on 1st
2. Batter advances to next in order
3. A secondary picker appears listing all current baserunners
4. Tapping a runner marks them `out` and records an out
5. "Skip" dismisses without recording an out

### DP (Double Play)
1. Batter marked `out`
2. The lead runner (furthest base: 3rd → 2nd → 1st) marked `out`
3. Two outs recorded simultaneously
4. Batter advances to next in order
5. If 3+ outs, half inning advances

---

## Runner status

Each lineup player has a status tracked in `pSt` keyed as `"[side]-[index]"`.

### Status progression
Tap the status badge to step forward:
`none → 1st → 2nd → 3rd → scored → out`

Tap `⋯` to open the full picker and jump directly to any state.

### Terminal states
`scored` and `out` are terminal — tapping the badge does nothing further. The picker shows only "Clear (—)" for terminal states.

### Current batter special behavior
When the **current batter's** badge or picker is used to put them on base:
- The full `recordHit(n)` logic runs instead of a simple status set
- This ensures existing runners are force-advanced correctly

### Manual runner advancement scoring
When an existing baserunner is manually moved to `scored` via badge or picker:
- `scoreRun()` is called — the run is counted and the run limit is checked
- The batter index does not advance (the batter is still up)

### Manual out (caught stealing)
When an existing baserunner is manually set to `out`:
- `g.outs` is incremented
- If outs reach 3, the half inning advances

---

## Base diamond

The base diamond (1st, 2nd, 3rd indicators in the status strip) is always derived from player statuses via `syncDiamond()`. It is never set independently during BIP plays — it is always rebuilt from `pSt` after every status change. Tapping a base directly toggles it independently (for quick correction).

---

## +1 Run button

Increments the current team's inning run total, then:
1. Marks the **furthest runner** on base as `scored` and clears that base:
    - Priority: 3rd → 2nd → 1st
2. If **no runners are on base**, marks the current batter as `scored` and advances to the next batter
3. If runners are on base, the **batter index does not advance** (batter is still up — the run came from a baserunner, e.g. wild pitch)
4. Run limit is checked after scoring

---

## Game end

Tapping **End Game** (with confirmation):
- Sets `gameOver = true`
- Saves the completed game to `gt_games` history
- Hides all game controls (batting toggles, action buttons, End Game button)
- Displays the final score banner
- The game screen remains visible showing the final state

From the Home screen, "Resume Game" only appears for games where `gameOver = false`.

---

## Game history

Completed games are stored in `gt_games` as an array, newest first. Each record contains the full game state at the time `endGame()` was called, including:
- Final inning-by-inning run totals
- Both lineups with end-of-game player statuses
- Team names, colors, sport type, and date

History is viewable from the **Past Games** screen. Individual games can be permanently deleted with a confirmation prompt.

---

## Undo

- Up to 40 undo steps are stored in `gt_undo` (separate from game state to prevent exponential growth)
- A snapshot is taken before every mutating action
- Undo restores the previous snapshot and re-renders
- Selecting a batter (`setBatter`) does not push an undo snapshot — it is considered a navigation action

---

## Color palette

12 preset colors indexed 0–11:
`Red, Blue, Green, Orange, Purple, Black, Maroon, Navy, Teal, Gold, Gray, Pink`

Each color has a `bg` (primary) and `lt` (light tint) variant used for backgrounds, borders, score displays, and active state highlights.

---

## PWA / Offline

- `manifest.json` defines the app for home screen installation
- `sw.js` implements a cache-first strategy for all app assets
- On first load, all assets are cached
- Subsequent loads serve from cache, with network fallback
- All game data is in `localStorage` — fully available offline