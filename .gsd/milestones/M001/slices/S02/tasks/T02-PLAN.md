---
estimated_steps: 6
estimated_files: 5
---

# T02: Create useChessGame Hook

**Slice:** S02 — Game Engine  
**Milestone:** M001

## Description

Create the core game state management hook using React's useReducer pattern. The hook manages the full game lifecycle: player makes move → validation → state update → check for game over. It replaces useBoardState from S01, providing actual chess rules instead of visual-only movement.

## Steps

1. Create game state reducer with actions: MOVE, RESET, SET_SELECTED_SQUARE
2. Create useChessGame hook initializing ChessService instance
3. Implement makeMove(from, to, promotion?) that validates via ChessService
4. Wire selected square logic (first click selects, second click moves if legal)
5. Expose gameState (FEN, status, history) and handlers for Board integration
6. Write comprehensive tests for state transitions

## Must-Haves

- [ ] useReducer manages game state (not scattered useState)
- [ ] First click selects square; second click attempts move (if legal)
- [ ] Illegal moves rejected without state change
- [ ] isCheck, isCheckmate, isStalemate exposed in gameState
- [ ] FEN string exposed for Board rendering
- [ ] moveHistory array tracks algebraic notation

## Verification

- `npm run test -- useChessGame` — 15+ tests pass
- Test coverage: initial state, legal move, illegal move, game over detection
- Manual: `const { game, makeMove } = useChessGame(); makeMove('e2', 'e4')` → FEN updates, history has "e4"

## Observability Impact

- Signals: Console log on every move ("e2-e4" or rejected with reason)
- Future agents inspect via React DevTools — gameState shows FEN, turn, check status
- Failure state: Illegal moves log reason to console; game state preserved

## Inputs

- `src/types/game.ts` — T01 output (GameState interface)
- `src/services/ChessService.ts` — T01 output (ChessService class)
- `src/components/Board.tsx` — S01 output (must integrate with FEN prop)
- `src/hooks/useBoardState.ts` — S01 output (to be replaced)

## Expected Output

- `src/hooks/useChessGame.ts` — complete game management hook
- `src/hooks/__tests__/useChessGame.test.ts` — reducer and hook tests
- `src/utils/uci.ts` — UCI notation utilities (for T03)
- `src/utils/__tests__/uci.test.ts` — UCI parsing tests
