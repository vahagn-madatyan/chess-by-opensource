---
id: T02
parent: S02
milestone: M001
provides:
  - useChessGame hook with useReducer pattern for game state management
  - Complete game lifecycle: select square → make move → validate → update state
  - UCI notation utilities for engine communication
  - 46 hook tests + 41 UCI utility tests
key_files:
  - src/hooks/useChessGame.ts
  - src/hooks/__tests__/useChessGame.test.ts
  - src/utils/uci.ts
  - src/utils/__tests__/uci.test.ts
key_decisions:
  - Reducer pattern with external ChessService instance (via ref) maintains game state across renders
  - Illegal moves return null and clear selection without throwing exceptions
  - Console logging on every action for runtime observability
  - UCI utilities support full 0x88 board representation for engine compatibility
patterns_established:
  - useReducer for complex game state with external service integration
  - Click-to-move interaction pattern (first click selects, second click moves)
  - Null-return pattern for illegal move rejection
  - Console signal pattern for runtime observability
observability_surfaces:
  - Console logs for all actions: "[useChessGame] Move executed: e4"
  - Error logging for illegal moves: "[useChessGame] Illegal move rejected: e2-e5"
  - Game over notifications: "[useChessGame] Checkmate! Black wins"
  - React DevTools inspection of gameState (FEN, turn, check status, history)
duration: 22m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Create useChessGame Hook

**Created useChessGame hook using useReducer pattern with comprehensive test coverage and UCI utilities for Stockfish integration.**

## What Happened

Implemented the core game state management hook using React's useReducer pattern. The hook wraps ChessService and manages the full game lifecycle: square selection → move validation → state update → game over detection. It replaces useBoardState from S01 with actual chess rules.

The reducer handles 5 action types: MOVE, RESET, SET_SELECTED_SQUARE, UNDO, and LOAD_FEN. Each action validates through ChessService, updates state immutably, and logs to console for observability. Illegal moves are rejected without state changes and clear the current selection.

Also created UCI notation utilities (src/utils/uci.ts) for communicating with chess engines. Includes conversion functions, 0x88 board representation, and parsing utilities with 41 comprehensive tests.

## Verification

- `npm run test -- useChessGame --run` — 46 tests passed
  - Initial state tests (5 tests): FEN, turn, status, history, move number
  - Move tests (8 tests): legal moves, illegal rejection, sequences, promotion, castling
  - Selection tests (5 tests): select, clear, move behavior
  - Game over tests (4 tests): checkmate, stalemate, check detection
  - Reset/Undo/FEN tests (6 tests): full functionality
  - Helper tests (8 tests): isLegalMove, getLegalMovesFrom, getPieceAt
  - Integration tests (3 tests): complete mini-game, re-renders, legalMoves map
  - Edge case tests (7 tests): en passant, move number, halfmove clock

- `npm run test -- uci --run` — 41 tests passed
  - toUCI/parseUCI round-trip tests
  - movesToUCIString/parseUCIString tests
  - 0x88 board representation tests
  - Promotion detection tests
  - Validation and edge case tests

- `npm run test -- --run` — 183 total tests passed
- `npx tsc --noEmit` — no type errors

## Diagnostics

- Inspect game state: `result.current.gameState` in tests or React DevTools
- Check move execution: Console shows "[useChessGame] Move executed: {notation}"
- Check illegal moves: Console shows "[useChessGame] Illegal move rejected: {from}-{to}"
- View game status: `gameState.status` shows 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw'
- Check FEN: `gameState.fen` for current position
- View history: `gameState.moveHistory` array with full move records
- Test illegal move: `makeMove('e2', 'e5')` returns false, sets error

## Deviations

None

## Known Issues

None

## Files Created/Modified

- `src/hooks/useChessGame.ts` — Complete game management hook with useReducer, ChessService integration, selection logic
- `src/hooks/__tests__/useChessGame.test.ts` — 46 comprehensive tests covering all functionality
- `src/utils/uci.ts` — UCI notation utilities for engine communication (8 functions)
- `src/utils/__tests__/uci.test.ts` — 41 tests for UCI utilities
