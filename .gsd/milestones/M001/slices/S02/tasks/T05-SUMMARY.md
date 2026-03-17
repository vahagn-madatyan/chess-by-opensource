---
id: T05
parent: S02
milestone: M001
provides:
  - Integration test suite for complete game flow (player vs AI)
  - Special moves validation (castling, en passant, promotion)
  - Illegal move rejection verification
  - AI response timing tests
  - E2E component tests for Game.tsx
key_files:
  - src/__tests__/chess-integration.test.ts
  - src/components/__tests__/Game.e2e.test.tsx
key_decisions:
  - Used MockStockfishWorker to simulate AI responses in tests for deterministic behavior
  - Integration tests verify end-to-end flow with mocked engine, timing tests validate real engine performance
  - E2E tests use engine={null} pattern to test UI without async AI timing complexity
patterns_established:
  - Mock Worker pattern for testing engine-dependent code
  - Deterministic test setup with known chess positions
observability_surfaces:
  - Console logs for game flow: "[useChessGame] Move executed", "[useChessGame] AI thinking..."
  - Engine UCI traffic logged with [ChessEngine] > and [ChessEngine] < prefixes
  - Game state inspection via React DevTools: gameState, isThinking, error
  - Test output shows all 277 tests passing

duration: 35min
verification_result: passed
completed_at: 2025-03-14T20:08:00-07:00
blocker_discovered: false
---

# T05: Integration Testing

**Slice:** S02 — Game Engine  
**Milestone:** M001

**Created comprehensive integration tests proving the complete chess game flow: player vs AI, special moves, illegal move rejection, and AI response timing.**

## What Happened

Built two integration test files that verify all must-haves from the slice plan:

1. **chess-integration.test.ts** (25 tests) - Core game logic integration:
   - Complete game flow from start to multiple moves with AI responses
   - Kingside and queenside castling validation and execution
   - En passant capture by white and black
   - Pawn promotion to queen, knight, and with capture
   - Illegal move rejection (wrong turn, invalid moves, moving into check)
   - Castling through check rejection
   - AI response timing under 2000ms at skill 10
   - Game over detection (checkmate, stalemate, insufficient material)

2. **Game.e2e.test.tsx** (15 tests) - React component E2E tests:
   - Game container and board rendering
   - Turn indicator display ("Your turn", "AI thinking...")
   - Player move interaction via click-to-move
   - Illegal move rejection in UI
   - New game reset functionality
   - Checkmate detection and display
   - Game over callback invocation
   - Custom configuration options (playerColor, engineSkill, engineTimeoutMs)
   - Move history display

## Verification

All verification commands pass:

```bash
# Integration tests
npm run test -- chess-integration --run
# ✓ 25 tests passed

# E2E tests  
npm run test -- Game.e2e --run
# ✓ 15 tests passed

# Full test suite
npm run test -- --run
# ✓ 277 tests passed (13 test files)

# TypeScript
npx tsc --noEmit
# ✓ zero errors
```

## Diagnostics

- **Test command**: `npm run test -- chess-integration`
- **E2E test command**: `npm run test -- Game.e2e`
- **Full suite**: `npm run test -- --run`
- **Inspect game state**: React DevTools → useChessGame hook → gameState object
- **Console logs**: Look for `[useChessGame]` and `[ChessEngine]` prefixes
- **Engine status**: `engine.isReady()` returns boolean, `engine.getLastError()` for diagnostics

## Deviations

None - implemented as specified in task plan.

## Known Issues

None. All tests passing, TypeScript clean.

## Files Created/Modified

- `src/__tests__/chess-integration.test.ts` — Unit-style integration tests (25 tests covering game flow, special moves, illegal move rejection, AI timing)
- `src/components/__tests__/Game.e2e.test.tsx` — Browser-style E2E tests (15 tests covering UI interactions, rendering, game lifecycle)
