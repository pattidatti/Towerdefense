# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server
npm run build     # TypeScript compile + Vite production build
npm run preview   # Preview built output locally
npm run deploy    # Build + deploy to GitHub Pages (gh-pages)
```

No test runner is configured.

## Design

The original design document is at `docs/Design`. A review of the implementation against this design is in `DESIGN_REVIEW.md`.

**Notable deviations from design:** The design specifies Phaser 3 and Tailwind CSS, but the project uses a custom canvas engine and plain CSS instead. The design also specifies 4 tower types, 4 enemy types, a mana system, tower upgrades, and star ratings — these are not yet implemented. See `DESIGN_REVIEW.md` for the full list.

## Architecture

Browser-based tower defense game (React 19 + Vite 6 + TypeScript). UI is built in React; gameplay runs on a plain HTML5 Canvas with a custom game engine — no Phaser or other game framework.

**Navigation (HashRouter):** `/ → /levels → /game/:levelId`

The app is deployed to GitHub Pages at `/Towerdefense/` (configured in `vite.config.ts` base path).

### Layer Separation

- **`src/components/`** — React UI only. `GameView.tsx` owns the canvas element and bridges React ↔ engine.
- **`src/engine/`** — Pure game logic, no React. Runs the game loop via `requestAnimationFrame`.
- **`src/data/`** — Static definitions for towers, enemies, and levels (acts as game config).
- **`public/Assets/`** — Sprites, tilesets (PNG). **`public/Maps/`** — Tiled `.tmx` map files.

### Game Loop

`Game.ts` is the central class. Each tick:
1. `Wave.ts` spawns enemies from the queue
2. `Enemy.ts` moves along pre-computed path waypoints
3. `Tower.ts` targets the furthest-progressed enemy in range and fires
4. `Projectile.ts` moves toward its target and deals damage on arrival
5. `Game.ts` checks win/loss conditions and calls `setGameState()` to push state back to React

`GameView.tsx` passes a `setGameState` callback into `Game` so the HUD can re-render without the engine knowing about React.

### Map System

Maps are created in Tiled and saved as `.tmx` XML files in `public/Maps/`. `MapLoader.ts` parses them at runtime, extracts tile layers and tilesets, and converts GIDs to pixel source rectangles. `Renderer.ts` uses these to draw the tilemap on the canvas. The path through the map is defined as a sequence of tile coordinates in `src/data/levels.ts`.

### Canvas Scaling

`GameView.tsx` uses a `ResizeObserver` to fit the canvas to its container (container height minus 88px for the HUD). Image smoothing is disabled for pixel-perfect rendering.

### Sprite Animation

`SpriteSheet.ts` handles frame-based animation (idle/run). Enemy sprites use 192×192 frames. Sprites and buildings are loaded once at game start via `Sprites.ts`.

### Level Progression

Level unlock state is stored in `localStorage` (key: `unlockedLevels`). When a player wins a level, the next level is unlocked automatically (`GameView.tsx`). The helper functions `getUnlockedLevels()` and `unlockLevel()` live in `LevelSelect.tsx`.

## Key Game Constants

- Starting lives: 20, starting gold: 150
- Towers defined in `src/data/towers.ts`: Arrow (50g, 120px range, 15 dmg), Magic (80g, 90px range, 35 dmg)
- Enemies defined in `src/data/enemies.ts`: Goblin (60 HP, 80 px/s), Orc (180 HP, 48 px/s)
- Gold rewards: 10g per Goblin, 25g per Orc
- Tower targeting strategy: furthest-progressed enemy within range
- Only one tower per tile; path tiles block placement

## Gameplay Features

- Manual wave start via "Send wave" button in HUD
- Speed toggle (1x / 2x) — wave notification uses raw time, game logic uses scaled time
- Tower range circle preview on hover
- Green/red placement validity indicator
- ESC to cancel tower selection
- Death particle effects
- Health bar color coding (green > 50%, yellow > 25%, red)
- End screen with retry and back-to-levels options

## UI Language

The UI text is in Norwegian (e.g., "Start Spill", "Velg Brett"). Keep new UI strings in Norwegian.
