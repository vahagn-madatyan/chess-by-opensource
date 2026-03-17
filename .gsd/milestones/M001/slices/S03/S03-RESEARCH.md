# S03: Game Features — Research

**Date:** 2026-03-14

## Summary

S03 builds UI controls and polish on top of the solid game engine from S02. The core engine already supports all required features—adjustable difficulty, undo, move history tracking—S03 just needs to expose them through the interface.

Key finding: **The engine work is done.** ChessEngine accepts `skillLevel` 0-20 via `setOptions()`. useChessGame has `undoMove()` already working. Move history exists in `gameState.moveHistory`. The remaining work is purely presentational: building controls, improving the layout, and adding a game-over modal.

Recommendation: Build a sidebar layout with move history, add a controls panel with difficulty slider and undo button, create a game-over modal for checkmate/stalemate, and polish the existing status bar. Keep component patterns consistent with S02 (function components, hooks, Tailwind).

## Recommendation

**Approach:** Sidebar layout with collapsible controls

- **Desktop:** Two-column layout — board on left, sidebar on right with history and controls
- **Tablet/Mobile:** Stack vertically, history below board
- **Components needed:**
  - `DifficultySelector` — slider input 1-20 with labels (Beginner → Master)
  - `UndoButton` — simple button, disabled when no moves to undo
  - `GameOverModal` — modal dialog showing result and new game button
  - `MoveHistory` — extracted and polished from current inline version
  - `GameControls` — container for difficulty, undo, new game

**Why:** The underlying functionality exists. This is UI assembly work. A sidebar layout is standard for chess apps (lichess, chess.com) and keeps the board prominent while making controls accessible.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Slider input styling | Tailwind `range` modifier + custom CSS | Native range inputs are unstyled; use established pattern |
| Modal/dialog | Copy PromotionDialog pattern | Already established in codebase, accessible, tested |
| Scrollable list | Tailwind `overflow-y-auto` + max-height | Simple, works everywhere |
| Game state | useChessGame hook | Already provides everything needed |

## Existing Code and Patterns

- `src/hooks/useChessGame.ts` — Already exports `undoMove()`, `resetGame()`, accepts `engineSkill` in options
- `src/components/PromotionDialog.tsx` — Follow this pattern for GameOverModal: fixed overlay, centered card, aria attributes
- `src/components/Game.tsx` — Currently has inline move history and status bar; extract these into components
- `src/engine/ChessEngine.ts` — `setOptions({ skillLevel: n })` works for 0-20; `getOptions()` reads current setting
- Test patterns in `src/components/__tests__/PromotionDialog.test.tsx` — Use `render()`, `screen`, `userEvent`, `vi.mock()` for engine

## Constraints

- **Difficulty changes:** Stockfish skill level can be changed mid-game via `setOptions()`, but it only affects the *next* AI search. Current design accepts skill at init—may need to add setter to useChessGame.
- **Undo limitations:** Can only undo after AI responds (history length must be even for white player). Disable undo button when `moveHistory.length === 0` or when game is over.
- **Layout width:** Board is 600px max-width. Sidebar should be ~250-300px. Total max-width ~900-950px for desktop.
- **Color scheme:** Amber/brown board (amber-200/amber-700), gray-900 background, amber-600 for primary actions.

## Common Pitfalls

- **Undo timing** — Only allow undo when it's player's turn AND after AI has moved. If player tries to undo immediately after their move (while AI is thinking), it breaks the turn sequence.
- **Difficulty slider debounce** — Don't update engine skill on every slider pixel change. Debounce or only apply on release/change complete.
- **Game over modal blocking** — Modal should show on checkmate/stalemate but not prevent "New Game" action. Keep it dismissible.
- **Move history scroll** — Auto-scroll to bottom on new moves so latest is always visible.
- **Responsive layout** — Board must remain square. Don't let sidebar squish it.

## Open Risks

- **Mid-game difficulty change:** If we allow skill changes during play, the user might expect immediate AI behavior change. The engine will use new skill on next search, but this may feel delayed if user just made a move. Consider showing a "Difficulty will take effect on AI's next turn" hint.
- **Undo edge cases:** What happens if user undos during AI thinking? Should disable undo while `isThinking` is true. The hook doesn't currently expose this constraint.
- **Mobile sidebar:** On narrow screens, sidebar below board pushes history far down. Consider collapsible or tabbed interface for mobile.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| React | Built-in | Already used in project |
| Tailwind CSS | Built-in | Already used in project |
| Headless UI / Radix | Not needed | PromotionDialog pattern sufficient |

No additional skills needed. This is straightforward React component work following established patterns.

## Sources

- ChessEngine skill level API verified by reading `src/engine/ChessEngine.ts` lines 164-168 and 196-198
- Undo functionality verified by reading `src/hooks/useChessGame.ts` lines 109-121 (UNDO reducer case) and lines 259-265 (undoMove callback)
- Move history structure verified by reading `src/types/game.ts` lines 37-44 (MoveHistory interface)
- PromotionDialog pattern verified by reading `src/components/PromotionDialog.tsx`
- Current Game component layout analyzed from `src/components/Game.tsx`

## Implementation Notes

### State Management

The useChessGame hook will need minor extension:

```typescript
// Add to UseChessGameReturn interface
setEngineSkill: (level: number) => void;

// Add to hook implementation
const setEngineSkill = useCallback((level: number) => {
  engine?.setOptions({ skillLevel: level });
}, [engine]);
```

### Component API Draft

```typescript
// DifficultySelector
interface DifficultySelectorProps {
  value: number; // 0-20
  onChange: (value: number) => void;
  disabled?: boolean;
}

// UndoButton  
interface UndoButtonProps {
  onClick: () => void;
  disabled?: boolean;
  canUndo: boolean;
}

// GameOverModal
interface GameOverModalProps {
  isOpen: boolean;
  result: 'win' | 'loss' | 'draw';
  reason: string;
  onNewGame: () => void;
  onClose: () => void;
}

// MoveHistory (extracted)
interface MoveHistoryProps {
  moves: MoveHistory[];
  currentMoveNumber?: number; // for future "jump to position" feature
}
```

### Layout Structure

```tsx
<div className="flex flex-col lg:flex-row gap-6 items-start">
  <div className="flex-1">{/* Board area */}</div>
  <aside className="w-full lg:w-72 space-y-4">
    <GameStatus />
    <GameControls />
    <MoveHistory />
  </aside>
</div>
```
