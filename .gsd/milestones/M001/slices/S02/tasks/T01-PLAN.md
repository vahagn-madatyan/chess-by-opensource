---
estimated_steps: 4
estimated_files: 4
---

# T01: Install chess.js and Create Game Types

**Slice:** S02 — Game Engine  
**Milestone:** M001

## Description

Install chess.js dependency and create foundational types and service wrapper that will be used throughout the game engine. Sets up GameState interface and ChessService — the wrapper around chess.js that provides a clean API for move validation, FEN management, and game status queries.

## Steps

1. Install chess.js dependency (`npm install chess.js@1.0.0`)
2. Create `src/types/game.ts` with GameState, GameStatus, and Move interfaces
3. Create `src/services/ChessService.ts` wrapping chess.js with makeMove, getLegalMoves, getGameState methods
4. Write unit tests verifying move validation and game state tracking

## Must-Haves

- [ ] chess.js installed and TypeScript types working
- [ ] GameState interface includes fen, turn, isCheck, isCheckmate, isStalemate, moveHistory
- [ ] ChessService wraps chess.js Chess class completely
- [ ] Illegal moves throw or return null (not crash)
- [ ] Unit tests verify: legal move allowed, illegal move rejected, game over detected

## Verification

- `npm run test -- ChessService` — 10+ tests pass
- `npx tsc --noEmit` — no type errors
- Manual: `const game = new ChessService(); game.makeMove('e2', 'e4')` succeeds; `game.makeMove('e2', 'e5')` fails

## Inputs

- `src/types/chess.ts` — existing Piece types (keep compatible)
- `src/utils/fen.ts` — parseFen utility (ChessService will use chess.js's FEN instead)

## Expected Output

- `package.json` — chess.js in dependencies
- `src/types/game.ts` — GameState, GameStatus, Move type definitions
- `src/services/ChessService.ts` — complete wrapper class
- `src/services/__tests__/ChessService.test.ts` — unit tests
