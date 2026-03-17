---
estimated_steps: 3
estimated_files: 2
---

# T05: Integration Testing

**Slice:** S02 — Game Engine  
**Milestone:** M001

## Description

Write comprehensive integration tests proving the complete game flow: player vs AI, special moves (castling, en passant, promotion), illegal move rejection, and AI response timing. These tests verify all must-haves from the slice are met.

## Steps

1. Create integration test file with full game scenarios (e2-e4 opening, response, continue)
2. Test special moves: castling kingside/queenside, en passant capture, pawn promotion
3. Verify illegal moves rejected without state change or crash
4. Test that AI responds within 2 seconds at skill 10

## Must-Haves

- [ ] Test plays complete game from start to near-end
- [ ] Castling move validation and execution tested
- [ ] En passant capture tested
- [ ] Pawn promotion through UI tested
- [ ] Illegal move (e.g., moving into check) rejected
- [ ] AI responds within 2000ms timeout

## Verification

- `npm run test -- chess-integration` — all integration tests pass
- `npm run test -- --run` — entire test suite passes (50+ tests)
- `npm run test -- --coverage` — coverage shows good instrumentation
- TypeScript: `npx tsc --noEmit` — zero errors
- Manual: `npm run dev` → open browser → play full game, verify AI responds

## Inputs

- `src/__tests__/chess-integration.test.ts` — target file (new)
- `src/components/__tests__/Game.e2e.test.tsx` — target file (new)
- All prior T01-T04 outputs — complete game engine implementation

## Expected Output

- `src/__tests__/chess-integration.test.ts` — full game flow tests
- `src/components/__tests__/Game.e2e.test.tsx` — browser-style integration tests
- All unit tests remain passing
- Slice verification complete — playable chess game against AI
