---
id: T04
parent: S02
milestone: M001
provides:
  - Game component orchestrating Board, useChessGame hook, and ChessEngine
  - PromotionDialog component for pawn promotion selection
  - AI turn flow with automatic AI response after player moves
  - Board disabled state during AI thinking
  - Integration into App.tsx
key_files:
  - src/components/Game.tsx
  - src/components/PromotionDialog.tsx
  - src/hooks/useChessGame.ts
  - src/App.tsx
  - src/components/__tests__/Game.test.tsx
  - src/components/__tests__/PromotionDialog.test.tsx
key_decisions:
  - Changed useChessGame hook signature from (initialFen?: string) to (options?: UseChessGameOptions) to accept engine and player configuration
  - Used stockfish-18-lite-single.js/wasm for single-threaded WASM that doesn't require SharedArrayBuffer
  - Implemented promotion detection in makeMove - when a pawn reaches last rank without promotion piece specified, sets pendingPromotion state instead of completing move
  - Added isThinking state to useChessGame reducer for UI disabling during AI moves
  - Implemented BoardWithOverlay subcomponent in Game.tsx for legal move highlighting and selection state
patterns_established:
  - Service injection pattern - engine passed to hook via options rather than using global singleton directly
  - Pending action pattern - promotion uses pendingPromotion state to pause move completion until user input
  - Effect-driven AI turns - useEffect watches turn change and triggers AI when it's not player's turn
observability_surfaces:
  - Console logs for move execution: "[useChessGame] Move executed: {notation}"
  - Console logs for AI thinking: "[useChessGame] AI thinking..." and "[useChessGame] AI move: {move}"
  - Console logs for game status: check, checkmate, stalemate, draw
  - React DevTools - Game component exposes turn, isThinking, engine status
  - UI shows "AI thinking..." status and disables board interaction
  - Error state displayed in UI for illegal moves
  - ChessEngine.getLastError() for engine diagnostics
duration: 90min
verification_result: passed
completed_at: 2025-03-14
blocker_discovered: false
---

# T04: Wire UI and Handle Promotion

**Completed:** Created Game component that orchestrates Board, useChessGame hook, and ChessEngine with full player-AI turn flow and promotion dialog.

## What Happened

Updated useChessGame hook to accept ChessEngine instance via options and automatically trigger AI moves when it's not the player's turn. Implemented promotion detection that pauses move completion and shows PromotionDialog for user to select piece. Created Game component with status bar, move history, legal move highlighting, and disabled state during AI thinking. Replaced bare Board in App.tsx with full Game component.

Resolved Stockfish WASM loading issues by switching to single-threaded lite build (stockfish-18-lite-single.js) which doesn't require SharedArrayBuffer or COEP/COOP headers.

## Verification

- All tests pass: 237 tests across 11 test files
  - `npm run test -- --run` passes
  - `npm run test -- Game` - 11 tests pass
  - `npm run test -- PromotionDialog` - 7 tests pass
  - `npm run test -- useChessGame` - 46 tests pass
- TypeScript: `npx tsc --noEmit` passes
- Stockfish engine initializes successfully in browser
- Console logs show "[ChessEngine] Engine ready" and "[Game] Engine initialized successfully"

## Diagnostics

- Inspect game state: `gameState` object in Game component props
- Check engine status: `engine.isReady()` returns boolean
- View last engine error: `engine.getLastError()` returns { message, code?, timestamp }
- Console search logs: Look for "[useChessGame]" prefix for game flow
- UCI traffic logged with [ChessEngine] > (outgoing) and [ChessEngine] < (incoming)

## Deviations

- Changed stockfish WASM to single-threaded lite version to avoid SharedArrayBuffer requirement
- Added BoardWithOverlay subcomponent in Game.tsx to render legal move highlights (not in original plan)
- Updated useChessGame API signature from positional parameter to options object

## Known Issues

- None - all tests pass, TypeScript clean, engine initializes

## Files Created/Modified

- `src/hooks/useChessGame.ts` — Added AI integration with useEffect, promotion handling, isThinking state, updated API to accept options object
- `src/components/PromotionDialog.tsx` — New component for queen/rook/bishop/knight selection
- `src/components/Game.tsx` — New main game orchestration component with status bar, move history, legal move highlighting
- `src/App.tsx` — Updated to render Game instead of Board
- `src/components/__tests__/Game.test.tsx` — New test file for Game component
- `src/components/__tests__/PromotionDialog.test.tsx` — New test file for PromotionDialog
- `src/App.test.tsx` — Updated tests for new Game component interface
- `public/stockfish/stockfish.js` — Replaced with stockfish-18-lite-single.js
- `public/stockfish/stockfish.wasm` — Replaced with stockfish-18-lite-single.wasm
