---
estimated_steps: 5
estimated_files: 2
---

# T02: Assemble Sidebar Layout

**Slice:** S03 — Game Features
**Milestone:** M001

## Description

Restructure Game.tsx from a vertical stack to a responsive sidebar layout. Wire all T01 components together into a cohesive game interface. Board stays prominent on the left; sidebar on the right contains status, controls (difficulty, undo, new game), and move history.

## Steps

1. **Restructure Game.tsx layout** — Replace vertical flex with responsive two-column layout (`flex-col lg:flex-row`), board on left, sidebar (`w-full lg:w-72`) on right
2. **Integrate sidebar components** — Import and place DifficultySelector, UndoButton, MoveHistory in sidebar; wire their props to useChessGame return values
3. **Wire GameOverModal** — Show when `gameState.isGameOver`, pass result/reason from gameState, wire onNewGame to resetGame
4. **Remove inline move history** — Delete the inline move history grid from current Game.tsx (now in MoveHistory component)
5. **Update App.tsx** — Ensure App provides proper container for responsive layout (padding, max-width, centering)

## Must-Haves

- [ ] Two-column layout on desktop, stacked on mobile
- [ ] Board remains max-w-[600px] and square aspect ratio
- [ ] Sidebar contains: GameStatus, DifficultySelector, UndoButton, MoveHistory
- [ ] GameOverModal appears on checkmate/stalemate/draw
- [ ] All existing functionality preserved (piece selection, move making, promotion)

## Verification

- `npm run dev` starts without errors
- Board renders correctly with all pieces
- Sidebar visible with all controls
- Responsive layout works at 320px, 768px, 1440px viewports
- Can still play a complete game (manual smoke test)

## Inputs

- `src/components/Game.tsx` — current vertical layout to restructure
- `src/components/DifficultySelector.tsx` — from T01
- `src/components/UndoButton.tsx` — from T01
- `src/components/GameOverModal.tsx` — from T01
- `src/components/MoveHistory.tsx` — from T01
- `src/App.tsx` — root layout to update

## Expected Output

- `src/components/Game.tsx` — restructured with sidebar layout
- `src/App.tsx` — updated container styling
