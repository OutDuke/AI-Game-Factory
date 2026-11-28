# Neon Dodge

A standalone browser arcade game built with Phaser 4, TypeScript, and Vite.

## Run locally

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

## Controls

| Input | Action |
|---|---|
| A / D or Arrow Keys | Move |
| Mouse / Touch | Move |
| P / Escape | Pause / Resume |
| V | Toggle sound |
| R | Restart after Game Over |
| M | Return to difficulty selection |

## Features

- Easy and Hard difficulty modes
- Three lives
- Score and persistent high score
- Local Top 10 leaderboard with initials
- Pause and resume
- Mouse, touch, and keyboard movement
- Neon player trail and engine glow
- Collision particles and screen shake
- Progressive obstacle speed
- Sound effects and mute toggle
- Offline support through a service worker

## Project structure

```text
src/
  main.ts
  style.css
  engine/
    config/
      ConfigValidator.ts
    entities/
      Obstacle.ts
    systems/
      CollisionSystem.ts
      GameState.ts
      GameStateManager.ts
  game/
    GameConfig.ts
    ScoreEntry.ts
    game-config.json
    entities/
      Player.ts
    profiles/
      neon-dodge-easy.json
      neon-dodge-hard.json
    scenes/
      BootScene.ts
      GameScene.ts
    systems/
      ConfigLoader.ts
```

This repository contains only Neon Dodge. The AI Game Factory backend, Ollama integration, game-plan generator, and generic template system have been removed.
