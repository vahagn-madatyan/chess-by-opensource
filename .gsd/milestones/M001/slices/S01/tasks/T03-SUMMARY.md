---
id: T03
parent: S01
milestone: M001
provides:
  - Complete chess board component with FEN parsing and click-to-move interaction
  - useBoardState hook for managing board state and selection
  - FEN utility for parsing/encoding chess positions
key_files:
  - src/utils/fen.ts
  - src/hooks/useBoardState.ts
  - src/components/Board.tsx
  - src/components/__tests__/Board.test.tsx
  - src/utils/__tests__/fen.test.ts
  - src/App.tsx
key_decisions:
  - Board uses CSS Grid (8x8) instead of flex rows for cleaner responsive sizing
  - Board state stored as 2D array matching FEN structure (rank 8 first, rank 1 last)
  - Click-to-move: first click selects piece, second click moves it (visual only, no validation)
  - onSquareClick callback fires on every click with algebraic notation for external integration
patterns_established:
  - FEN parsing utilities in src/utils/fen.ts
  - Custom hooks in src/hooks/ for stateful component logic
  - 2D array board representation compatible with chess.js
observability_surfaces:
  - Console logs from onSquareClick callback
  - data-square and data-selected attributes on square buttons for testing
  - aria-labels for accessibility and test verification
duration: 35m
verification_result: passed
completed_at: 2025-03-14
blocker_discovered: false
---

# T03: Create Board component with click-to-move interaction

**Implemented 8x8 chess board with FEN parsing, visual piece movement, and click-to-move interaction.**

## What Happened

Created the complete Board component that assembles Piece and Square components into a playable chess board. Implemented FEN parsing to initialize positions, useBoardState hook for managing piece positions and selection state, and click-to-move interaction pattern where first click selects a piece (blue highlight) and second click moves it visually.

Key implementation details:
- FEN parser converts standard notation to 2D board array (8 ranks × 8 files)
- useBoardState hook manages board state, selected square, and move operations
- Board component renders 64 squares in CSS Grid with proper alternating colors
- onSquareClick callback emits algebraic notation on every click for external integration

## Verification

**Tests:**
- `npm run test -- Board` — 14 tests pass ✓
- `npm run test -- fen` — 16 tests pass ✓
- All 55 total tests pass ✓

**Type check:**
- `npx tsc --noEmit` — no errors ✓

**Visual verification:**
- Board displays with 32 pieces in starting position ✓
- Click e2 — blue highlight appears ✓
- Click e4 — white pawn moves to e4 ✓
- Console shows "e2" then "e4" from onSquareClick callback ✓

**Must-haves verified:**
- [x] Board renders 8x8 grid with correct file (a-h) and rank (1-8) orientation
- [x] Starting position FEN produces correct piece arrangement (white pieces rank 1-2, black pieces rank 7-8)
- [x] First click on a square with a piece selects it (blue ring highlight)
- [x] Second click on any square moves the selected piece there visually
- [x] `onSquareClick` callback fires with correct algebraic notation (e.g., "e2", "e4")
- [x] Board maintains 1:1 aspect ratio and responsive sizing
- [x] Unit tests pass for Board and FEN utility

## Diagnostics

- Browser devtools: Inspect `[data-square="e4"]` to see piece moved
- Console: Watch for square notation logs from onSquareClick
- Tests: `npm run test -- Board` for component tests
- Build: `npm run build` for production verification

## Deviations

None. Implementation followed task plan exactly.

## Known Issues

None.

## Files Created/Modified

- `src/utils/fen.ts` — FEN parsing utility with parseFen, getSquareNotation, parseSquareNotation
- `src/hooks/useBoardState.ts` — Board state management hook with click-to-move logic
- `src/components/Board.tsx` — Complete chess board component with CSS Grid layout
- `src/components/__tests__/Board.test.tsx` — 14 unit tests for Board component
- `src/utils/__tests__/fen.test.ts` — 16 unit tests for FEN utility
- `src/App.tsx` — Updated to render Board with starting position and console logging
