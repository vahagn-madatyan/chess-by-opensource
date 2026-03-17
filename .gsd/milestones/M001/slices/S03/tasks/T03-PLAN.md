---
estimated_steps: 5
estimated_files: 6
---

# T03: Test and Verify Features

**Slice:** S03 — Game Features
**Milestone:** M001

## Description

Write comprehensive tests for all new components and verify the complete S03 feature set. Tests prove that difficulty changes, undo works, game-over modal shows, and history displays correctly. Also verify the milestone UAT criteria are met.

## Steps

1. **Write DifficultySelector tests** — Render test, value change test, disabled state test
2. **Write UndoButton tests** — Render test, click handler test, disabled state test
3. **Write GameOverModal tests** — Render test, result display tests (win/loss/draw), close/new game button tests
4. **Write MoveHistory tests** — Render test, empty state test, scroll behavior test, move number formatting test
5. **Extend useChessGame tests** — Add setEngineSkill test verifying engine.setOptions called
6. **Run full test suite** — Verify all 277+ tests pass, including existing tests
7. **Manual UAT verification** — Play a game, change difficulty mid-game, undo a move pair, verify game-over modal

## Must-Haves

- [ ] DifficultySelector.test.tsx with 4+ test cases
- [ ] UndoButton.test.tsx with 3+ test cases
- [ ] GameOverModal.test.tsx with 5+ test cases
- [ ] MoveHistory.test.tsx with 4+ test cases
- [ ] useChessGame.test.ts extended with setEngineSkill coverage
- [ ] All existing tests still pass
- [ ] Manual verification shows working sidebar, difficulty changes, undo, game-over modal

## Verification

- `npm test` — full suite passes (277+ tests)
- `npx tsc --noEmit` — zero TypeScript errors
- Manual UAT: Complete game played, difficulty adjusted, undo used, game-over modal seen

## Inputs

- `src/components/DifficultySelector.tsx` — component to test
- `src/components/UndoButton.tsx` — component to test
- `src/components/GameOverModal.tsx` — component to test
- `src/components/MoveHistory.tsx` — component to test
- `src/hooks/useChessGame.ts` — hook to extend tests for
- Test patterns from `src/components/__tests__/PromotionDialog.test.tsx`

## Expected Output

- `src/components/__tests__/DifficultySelector.test.tsx` — new test file
- `src/components/__tests__/UndoButton.test.tsx` — new test file
- `src/components/__tests__/GameOverModal.test.tsx` — new test file
- `src/components/__tests__/MoveHistory.test.tsx` — new test file
- `src/hooks/__tests__/useChessGame.test.ts` — extended with setEngineSkill tests
