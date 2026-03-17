---
estimated_steps: 5
estimated_files: 5
---

# T04: Wire UI and Handle Promotion

**Slice:** S02 — Game Engine  
**Milestone:** M001

## Description

Wire all components together: create Game component that orchestrates Board, useChessGame hook, and ChessEngine; implement player-AI turn flow; create PromotionDialog for pawn promotion; integrate into App.tsx.

## Steps

1. Update `useChessGame` to accept engine and trigger AI after player move
2. Create `PromotionDialog` component with queen, rook, bishop, knight selection
3. Create `Game` component assembling Board + logic, handling turn states
4. Detect promotion-required (pawn to last rank) and show dialog before completing move
5. Update `App.tsx` to render Game instead of bare Board

## Must-Haves

- [ ] After player makes legal move, AI automatically triggers (if game not over)
- [ ] Board disabled during AI thinking (isThinking state)
- [ ] PromotionDialog appears when pawn reaches rank 8 or 1
- [ ] Move completes only after promotion piece selected
- [ ] Game component manages all orchestration cleanly
- [ ] Illegal moves show visual feedback (console + deselect)

## Verification

- `npm run test -- Game` — component tests pass
- `npm run test -- PromotionDialog` — dialog tests pass
- Browser test: Play e2-e4 → AI responds → continue game → verify moves legal only
- Browser test: Move h-pawn to 8th rank → promotion dialog appears → select queen → move completes
- TypeScript: `npx tsc --noEmit` passes

## Observability Impact

- Signals: Console logs show full game flow ("Player: e4", "AI thinking...", "AI: e5")
- Inspection: React DevTools — Game component has turn, isThinking, engine status props
- Failure: Illegal moves log reason; engine errors show in console with recovery

## Inputs

- `src/components/Board.tsx` — S01 output (Board component)
- `src/components/Square.tsx` — S01 output (Square component)
- `src/components/Piece.tsx` — S01 output (Piece component)
- `src/hooks/useChessGame.ts` — T02 output (hook, needs AI integration)
- `src/engine/ChessEngine.ts` — T03 output (ChessEngine class)
- `src/services/ChessService.ts` — T01 output (ChessService class)
- `src/App.tsx` — S01 output (to update with Game component)

## Expected Output

- `src/components/Game.tsx` — main game orchestration component
- `src/components/PromotionDialog.tsx` — promotion piece selector
- `src/components/__tests__/Game.test.tsx` — Game component tests
- `src/hooks/useChessGame.ts` — updated with AI integration
- `src/App.tsx` — updated to render Game
