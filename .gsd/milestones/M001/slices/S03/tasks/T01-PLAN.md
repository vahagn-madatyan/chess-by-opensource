---
estimated_steps: 6
estimated_files: 6
---

# T01: Build UI Components

**Slice:** S03 — Game Features
**Milestone:** M001

## Description

Create the individual control components that S03 needs. The engine already supports all features—this task builds the UI pieces: difficulty selector, undo button, game-over modal, and move history panel. Also extends useChessGame hook to expose `setEngineSkill` for difficulty changes.

## Steps

1. **Extend useChessGame hook** — Add `setEngineSkill` function that calls `engine?.setOptions({ skillLevel })`, expose in return interface
2. **Create DifficultySelector component** — Range slider 0-20 with "Beginner → Master" labels, debounced onChange, amber/brown theme
3. **Create UndoButton component** — Button with undo icon/text, disabled when no moves or AI thinking, amber styling
4. **Create GameOverModal component** — Follow PromotionDialog pattern: fixed overlay, centered card, shows result (win/loss/draw) + reason, New Game button
5. **Create MoveHistory component** — Scrollable list with move numbers ("1. e4 e5"), auto-scroll to bottom, max-height container
6. **Export components** — Add exports to appropriate index files, ensure TypeScript types are exported

## Must-Haves

- [ ] useChessGame exposes `setEngineSkill(level: number)` that updates engine options
- [ ] DifficultySelector renders range input 0-20, calls onChange with debounce
- [ ] UndoButton has clear disabled state when cannot undo (no history or thinking)
- [ ] GameOverModal matches PromotionDialog styling (amber/brown, rounded, shadow)
- [ ] MoveHistory shows moves in "N. white black" format with proper scrolling

## Verification

- `npx tsc --noEmit` — no TypeScript errors
- Components render in isolation without crashing
- DifficultySelector value changes trigger callback
- UndoButton disabled prop correctly disables button
- GameOverModal renders when isOpen=true, hidden when false
- MoveHistory renders move pairs correctly

## Inputs

- `src/hooks/useChessGame.ts` — hook to extend with setEngineSkill
- `src/components/PromotionDialog.tsx` — pattern to follow for GameOverModal
- `src/components/Game.tsx` — current inline move history to extract patterns from
- Color scheme: amber-200/amber-700 board, gray-900 background, amber-600 primary

## Expected Output

- `src/hooks/useChessGame.ts` — updated with setEngineSkill export
- `src/components/DifficultySelector.tsx` — slider component with labels
- `src/components/UndoButton.tsx` — button component with disabled logic
- `src/components/GameOverModal.tsx` — modal dialog for game over
- `src/components/MoveHistory.tsx` — scrollable move list component
