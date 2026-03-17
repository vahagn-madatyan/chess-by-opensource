# S03: Game Features

**Goal:** Full experience with move history sidebar, undo button, difficulty selector, game status indicators, and new game button
**Demo:** User can play a complete game with sidebar showing move history, adjust AI difficulty mid-game, undo moves, see clear game-over modal, and start new games

## Must-Haves

- Adjustable difficulty slider (0-20) that updates AI strength
- Undo button that reverts player+AI move pair (disabled appropriately)
- Game-over modal showing result and new game option
- Scrollable move history in sidebar with move numbers
- Responsive two-column layout (board left, sidebar right)
- Turn indicator, check/checkmate indicators in status bar

## Verification

- `npm test -- --grep "GameControls\|MoveHistory\|GameOverModal\|Game"` — all new component tests pass
- `npm test -- --grep "useChessGame"` — hook tests pass with setEngineSkill coverage
- TypeScript: `npx tsc --noEmit` — zero errors
- Manual verification: Play a game, change difficulty, undo moves, verify game-over modal appears

## Observability / Diagnostics

- Console logs with `[useChessGame]` prefix show difficulty changes
- `gameState.moveHistory` visible in React DevTools
- Undo button disabled state visible in UI (no hidden failure modes)
- Difficulty slider value visible and persisted across moves

## Integration Closure

- Upstream surfaces consumed: `useChessGame` hook (will add `setEngineSkill`), `ChessEngine.setOptions()`, `GameState.moveHistory`
- New wiring: Sidebar layout wires Board + GameControls + MoveHistory + GameOverModal
- What remains before milestone complete: Nothing — this is final slice

## Tasks

- [x] **T01: Build UI Components** `est:45m`
  - Why: Create the individual control components that S03 needs — difficulty selector, undo button, game-over modal, and move history panel
  - Files: `src/hooks/useChessGame.ts`, `src/components/DifficultySelector.tsx`, `src/components/UndoButton.tsx`, `src/components/GameOverModal.tsx`, `src/components/MoveHistory.tsx`
  - Do: Add `setEngineSkill` to useChessGame hook; create DifficultySelector with range slider 0-20; create UndoButton with disabled state logic; create GameOverModal following PromotionDialog pattern; create MoveHistory with scrollable list and move numbers
  - Verify: `npm test -- src/components/__tests__/DifficultySelector.test.tsx` (create), TypeScript check, components render in isolation
  - Done when: All four components exist with props interfaces and basic styling

- [x] **T02: Assemble Sidebar Layout** `est:45m`
  - Why: Restructure Game.tsx from vertical stack to sidebar layout, wire all new components together
  - Files: `src/components/Game.tsx`, `src/App.tsx`
  - Do: Restructure Game.tsx with flex layout (board left, sidebar right on desktop); integrate DifficultySelector, UndoButton, MoveHistory into sidebar; wire GameOverModal to gameState.isGameOver; remove inline move history from Game.tsx; update App.tsx for responsive container
  - Verify: `npm run dev` loads without errors, layout renders correctly at multiple viewport sizes
  - Done when: Complete playable UI with sidebar visible, all controls functional

- [x] **T03: Test and Verify Features** `est:30m`
  - Why: Prove all S03 requirements work — difficulty changes, undo works, game-over modal shows, history displays
  - Files: `src/components/__tests__/DifficultySelector.test.tsx`, `src/components/__tests__/UndoButton.test.tsx`, `src/components/__tests__/GameOverModal.test.tsx`, `src/components/__tests__/MoveHistory.test.tsx`, `src/hooks/__tests__/useChessGame.test.ts` (add setEngineSkill tests)
  - Do: Write component tests for each new UI component; add setEngineSkill tests to useChessGame tests; run full test suite; verify all 277+ tests pass
  - Verify: `npm test` — all tests pass; manual verification of complete game flow
  - Done when: All tests pass, UAT criteria from roadmap met

## Files Likely Touched

- `src/hooks/useChessGame.ts` — add setEngineSkill
- `src/components/DifficultySelector.tsx` — new
- `src/components/UndoButton.tsx` — new
- `src/components/GameOverModal.tsx` — new
- `src/components/MoveHistory.tsx` — new
- `src/components/Game.tsx` — restructure with sidebar
- `src/App.tsx` — responsive container
- `src/components/__tests__/DifficultySelector.test.tsx` — new
- `src/components/__tests__/UndoButton.test.tsx` — new
- `src/components/__tests__/GameOverModal.test.tsx` — new
- `src/components/__tests__/MoveHistory.test.tsx` — new
