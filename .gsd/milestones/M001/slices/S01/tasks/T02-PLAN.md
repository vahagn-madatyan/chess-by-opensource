---
estimated_steps: 7
estimated_files: 5
---

# T02: Create Piece and Square components with SVG graphics

**Slice:** S01 — Board UI
**Milestone:** M001

## Description

Create the core visual building blocks: Piece component rendering SVG chess pieces, and Square component rendering board squares with proper coloring and selection states. This implements the visual foundation that the Board component will assemble.

## Steps

1. Create `src/types/chess.ts` with TypeScript interfaces for `PieceType`, `PieceColor`, and `Piece` objects
2. Design and implement SVG path data for all 12 piece types (King, Queen, Rook, Bishop, Knight, Pawn in white and black)
3. Create `src/components/Piece.tsx` that accepts `type` and `color` props and renders the appropriate SVG
4. Create `src/components/Square.tsx` that accepts `square` (algebraic notation), `piece`, `isLight`, `isSelected`, and `onClick` props
5. Implement alternating square colors using amber-200 (light) and amber-700 (dark) per chess board convention
6. Add selection highlighting with `ring-4 ring-blue-400` Tailwind classes when `isSelected` is true
7. Write unit tests for both components using Vitest and Testing Library

## Must-Haves

- [ ] All 12 piece types render correctly as SVG (wk, wq, wr, wb, wn, wp, bk, bq, br, bb, bn, bp)
- [ ] Pieces scale to fit their container using `w-full h-full` and proper `viewBox`
- [ ] Squares show correct alternating light/dark pattern
- [ ] Selected squares display blue ring highlight
- [ ] Empty squares (null pieces) render without errors
- [ ] Click handler fires with correct square notation
- [ ] Unit tests pass for both components

## Verification

- `npm run test -- Piece` — All Piece tests pass
- `npm run test -- Square` — All Square tests pass
- Manual visual check: Create temporary test in App.tsx to render all pieces and squares

## Inputs

- `src/main.tsx` — React entry point (from T01)
- `src/App.tsx` — Root component (from T01)
- `src/index.css` — Tailwind styles (from T01)

## Expected Output

- `src/types/chess.ts` — TypeScript interfaces for chess types
- `src/components/Piece.tsx` — SVG piece rendering component
- `src/components/Square.tsx` — Board square component with selection support
- `src/components/__tests__/Piece.test.tsx` — Unit tests for Piece
- `src/components/__tests__/Square.test.tsx` — Unit tests for Square
