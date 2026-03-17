---
id: S02
parent: M001
milestone: M001
provides:
  - Complete legal chess game engine with Stockfish AI opponent
  - chess.js wrapper (ChessService) with TypeScript types
  - useChessGame hook with reducer-based state management
  - ChessEngine class wrapping Stockfish 18 WASM via UCI protocol
  - Game component orchestrating Board, game logic, and AI turns
  - PromotionDialog for pawn promotion piece selection
  - UCI notation utilities for engine communication
requires:
  - slice: S01
    provides: Board component with onSquareClick callback, Square/Piece components, visual board rendering
affects:
  - S03
key_files:
  - src/services/ChessService.ts
  - src/hooks/useChessGame.ts
  - src/engine/ChessEngine.ts
  - src/components/Game.tsx
  - src/components/PromotionDialog.tsx
  - src/types/game.ts
  - src/types/engine.ts
  - src/utils/uci.ts
key_decisions:
  - Used stockfish-18-lite-single.js/wasm to avoid SharedArrayBuffer requirement (single-threaded build)
  - ChessService returns null for illegal moves instead of throwing exceptions (non-crashing pattern)
  - useChessGame uses useReducer with external ChessService instance via ref for state persistence across renders
  - Promotion detection pauses move completion via pendingPromotion state until user selects piece
  - Engine skill level 0-20 maps directly to Stockfish's Skill Level UCI option
  - AI turn triggered via useEffect watching gameState.turn change
patterns_established:
  - Service wrapper pattern around external libraries (ChessService, ChessEngine)
  - Reducer pattern for complex game state with external service integration
  - Pending action pattern for promotion requiring user input
  - Effect-driven AI turn management
  - Console logging prefix pattern ([ChessEngine], [useChessGame], [Game]) for observability
observability_surfaces:
  - Console logs with prefixes [ChessEngine], [useChessGame], [Game]
  - engine.isReady() returns boolean status
  - engine.getStatus() returns EngineStatus enum
  - engine.getLastError() returns EngineError | null with message, code, timestamp
  - UCI traffic logged with [ChessEngine] > (outgoing) and [ChessEngine] < (incoming)
  - React DevTools inspection of useChessGame hook exposing full gameState
  - gameState.status shows 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'
drill_down_paths:
  - .gsd/milestones/M001/slices/S02/tasks/T01-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T02-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T03-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T04-SUMMARY.md
  - .gsd/milestones/M001/slices/S02/tasks/T05-SUMMARY.md
duration: 3h 45m
verification_result: passed
completed_at: 2026-03-14
---

# S02: Game Engine

**Complete legal chess game against Stockfish AI — move validation, AI opponent, and full game loop.**

## What Happened

Built the complete game engine that transforms the visual board from S01 into a playable chess game. Five tasks established the foundation: ChessService wraps chess.js for move validation and game state; useChessGame hook manages the game lifecycle with reducer pattern; ChessEngine integrates Stockfish 18 WASM via UCI protocol; Game component wires everything together with promotion handling; comprehensive integration tests prove the full player-vs-AI flow.

Key implementation: The engine uses a single-threaded Stockfish 18 Lite build that doesn't require SharedArrayBuffer or special HTTP headers, avoiding deployment complexity. The UCI protocol wrapper provides Promise-based async API with configurable skill levels (0-20) and timeout-enforced search. Move validation uses chess.js with null-return pattern for illegal moves — no exceptions, clean state management.

The game loop: player clicks square → selection state → clicks destination → move validation → if legal, execute → trigger AI → AI searches → AI moves → repeat. Special moves (castling, en passant, promotion) all work. Promotion pauses the game for piece selection via modal dialog.

## Verification

- **All tests pass**: 277 tests across 13 test files
  - ChessService: 41 tests (initialization, legal moves, special moves, game states)
  - useChessGame: 46 tests (state management, moves, game over detection)
  - UCI utilities: 41 tests (notation conversion, parsing)
  - ChessEngine: 34 tests (initialization, UCI protocol, getBestMove)
  - Game component: 11 tests
  - PromotionDialog: 7 tests
  - chess-integration: 25 tests (full game flow, special moves, AI timing)
  - Game E2E: 15 tests (UI interactions, game lifecycle)

- **TypeScript**: `npx tsc --noEmit` — zero errors

- **Manual verification**: Dev server runs, Stockfish initializes (see console "Engine ready"), game renders with board, status indicators, and move history

- **AI timing**: Integration tests verify AI responds within 2000ms at skill level 10

## Requirements Advanced

- R001 (Interactive Chess Board) — S01 provided foundation, S02 integrates with game logic
- R002 (Legal Move Validation) — ChessService validates all moves via chess.js, special moves work
- R003 (AI Opponent) — Stockfish 18 WASM integrated, responds to player moves with legal moves

## Requirements Validated

- R002 — Validated by 41 ChessService tests plus 25 integration tests proving illegal moves rejected, legal moves accepted
- R003 — Validated by ChessEngine tests and integration tests proving AI responds with valid moves within timeout

## New Requirements Surfaced

None

## Requirements Invalidated or Re-scoped

None

## Deviations

- Changed from stockfish-16 multi-threaded to stockfish-18-lite-single to avoid SharedArrayBuffer requirement
- useChessGame hook signature changed from positional `initialFen` parameter to `options` object accepting `{ initialFen?, engine?, playerColor? }`
- Added BoardWithOverlay subcomponent inside Game.tsx for legal move highlighting (not in original plan)

## Known Limitations

- No drag-and-drop (S01 click-to-move pattern retained)
- No difficulty selector UI (requires S03)
- No undo button (requires S03)
- Move history displayed but not scrollable with move numbers (requires S03 polish)

## Follow-ups

- S03 will add difficulty selector, undo button, polished move history, and game-over modal
- Consider adding engine pondering option for stronger play
- Consider adding move sound effects

## Files Created/Modified

- `package.json` — added chess.js@1.0.0 dependency
- `src/types/game.ts` — GameState, GameStatus, Move, MoveHistory, Player interfaces
- `src/types/engine.ts` — EngineStatus, EngineOptions, EngineError, BestMoveResult types
- `src/services/ChessService.ts` — chess.js wrapper with move validation and game state
- `src/services/__tests__/ChessService.test.ts` — 41 unit tests
- `src/hooks/useChessGame.ts` — game state management with reducer, AI integration
- `src/hooks/__tests__/useChessGame.test.ts` — 46 tests
- `src/utils/uci.ts` — UCI notation utilities for engine communication
- `src/utils/__tests__/uci.test.ts` — 41 tests
- `src/engine/ChessEngine.ts` — Stockfish WASM wrapper with UCI protocol
- `src/engine/__tests__/ChessEngine.test.ts` — 34 tests
- `src/components/Game.tsx` — main game orchestration component
- `src/components/__tests__/Game.test.tsx` — 11 component tests
- `src/components/PromotionDialog.tsx` — pawn promotion piece selection
- `src/components/__tests__/PromotionDialog.test.tsx` — 7 tests
- `src/__tests__/chess-integration.test.ts` — 25 integration tests
- `src/components/__tests__/Game.e2e.test.tsx` — 15 E2E tests
- `src/App.tsx` — updated to render Game component
- `public/stockfish/stockfish.js` — Stockfish 18 Lite WASM loader
- `public/stockfish/stockfish.wasm` — Stockfish 18 Lite engine binary

## Forward Intelligence

### What the next slice should know
- GameState interface is stable and consumed by Game component
- ChessEngine skill level 0-20 is already functional, just needs UI in S03
- Undo is implemented in useChessGame hook (UNDO action), just needs button in S03
- Promotion dialog works and returns piece selection to complete moves

### What's fragile
- ChessEngine uses Web Worker — ensure proper cleanup with disposeChessEngine()
- Stockfish WASM file is 113MB — first load may be slow, consider caching strategy
- UCI protocol is string-based — any breaking changes to Stockfish output format could break parsing

### Authoritative diagnostics
- Console logs with [ChessEngine] prefix show all UCI traffic
- `engine.isReady()` returns false if initialization failed
- `engine.getLastError()` surfaces any engine errors with timestamps
- All game actions logged with [useChessGame] prefix

### What assumptions changed
- Assumed multi-threaded Stockfish would work — switched to single-threaded lite build due to SharedArrayBuffer/COOP/COEP header complexity
- Assumed promotion could be handled inline — required modal dialog interrupt pattern
