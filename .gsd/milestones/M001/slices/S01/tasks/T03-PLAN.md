---
estimated_steps: 8
estimated_files: 6
---

# T03: Create Board component with click-to-move interaction

**Slice:** S01 — Board UI
**Milestone:** M001

## Description

Assemble the Piece and Square components into a complete Board component with click-to-move interaction. Implement FEN parsing, board state management, and the core user interaction loop. This delivers the slice's primary goal: a visual chess board where users can click squares to select and move pieces.

## Steps

1. Create `src/utils/fen.ts` with `parseFen(fen: string): (Piece | null)[][]` function to convert FEN to board array
2. Create `src/hooks/useBoardState.ts` with state for piece positions and selected square, plus handlers for selection and movement
3. Create `src/components/Board.tsx` that renders 8 rows of 8 squares using flex layout (maps to chess.js board output format)
4. Implement click handler logic: first click selects a square, second click moves the piece to that square (visual only)
5. Wire up `onSquareClick(square: string)` callback prop to emit algebraic notation on every click
6. Update `src/App.tsx` to render the Board component with starting position FEN
7. Write unit tests for Board component and FEN utility

## Must-Haves

- [ ] Board renders 8x8 grid with correct file (a-h) and rank (1-8) orientation
- [ ] Starting position FEN produces correct piece arrangement (white pieces rank 1-2, black pieces rank 7-8)
- [ ] First click on a square with a piece selects it (blue ring highlight)
- [ ] Second click on any square moves the selected piece there visually
- [ ] `onSquareClick` callback fires with correct algebraic notation (e.g., "e2", "e4")
- [ ] Board maintains 1:1 aspect ratio and responsive sizing
- [ ] Unit tests pass for Board and FEN utility

## Verification

- `npm run test -- Board` — Board component tests pass
- `npm run test -- fen` — FEN utility tests pass
- `npm run dev` → navigate to `http://localhost:5173`:
  - Board displays with 32 pieces in starting position
  - Click e2 — blue highlight appears
  - Click e4 — white pawn moves to e4
  - Console shows "e2" then "e4" from onSquareClick callback

## Inputs

- `src/components/Piece.tsx` — Piece rendering component (from T02)
- `src/components/Square.tsx` — Square component with selection support (from T02)
- `src/types/chess.ts` — TypeScript interfaces (from T02)
- `src/index.css` — Tailwind styles (from T01)

## Expected Output

- `src/utils/fen.ts` — FEN parsing utility
- `src/hooks/useBoardState.ts` — Board state management hook
- `src/components/Board.tsx` — Complete chess board component
- `src/components/__tests__/Board.test.tsx` — Unit tests for Board
- `src/utils/__tests__/fen.test.ts` — Unit tests for FEN utility
- `src/App.tsx` — Updated to render Board with starting position
