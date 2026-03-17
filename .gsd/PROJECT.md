# Project: Chess AI

## What This Is

A web-based chess game where you play against Stockfish AI. Clean modern UI, adjustable difficulty, move history, and undo capability. Built from scratch with React/TypeScript.

## Core Value

Playing a complete game of chess against a competent AI opponent with a smooth, no-friction experience.

## Current State

M001 (Core Chess Game) COMPLETE ✅. Full chess experience with Stockfish AI opponent, adjustable difficulty (0-20), move history sidebar, undo capability, and responsive design. All 312 tests pass. Ready for deployment or next milestone.

## Architecture / Key Patterns

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS for clean modern UI
- **Chess Engine:** Stockfish 18 Lite WASM via npm package
- **State Management:** React hooks (useState, useReducer)
- **Move Logic:** chess.js for legal move validation and game state
- **Board:** Custom SVG-based board with click-to-move interaction

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [x] M001: Core Chess Game — Playable chess against Stockfish AI with board, pieces, and basic game features
  - [x] S01: Board UI — 8x8 board with pieces, click-to-move
  - [x] S02: Game Engine — Legal moves, Stockfish AI, game loop
  - [x] S03: Game Features — History, undo, difficulty selector, game-over modal
