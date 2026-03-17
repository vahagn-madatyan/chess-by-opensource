---
id: T02
parent: S01
milestone: M001
provides:
  - TypeScript interfaces for chess types (Piece, PieceType, PieceColor)
  - Piece component rendering all 12 chess piece SVGs
  - Square component with alternating colors and selection highlight
  - Unit tests for both components
key_files:
  - src/types/chess.ts
  - src/components/Piece.tsx
  - src/components/Square.tsx
  - src/components/__tests__/Piece.test.tsx
  - src/components/__tests__/Square.test.tsx
key_decisions:
  - Used standard SVG path data for chess pieces (similar to Wikimedia/Chess.js)
  - White pieces: light fill (#f3f4f6) with dark stroke (#111827)
  - Black pieces: dark fill (#1f2937) with light stroke (#f3f4f6)
  - Squares use amber-200 for light squares and amber-700 for dark squares
  - Selection highlight uses ring-4 ring-blue-400 ring-inset
  - SVG viewBox set to "0 0 45 45" for all pieces (standard chess SVG coordinate system)
patterns_established:
  - TypeScript interfaces in separate types/ directory
  - Components use explicit interface props
  - aria-label attributes for accessibility testing
  - data-* attributes for test assertions
  - Co-located tests in __tests__ subdirectory
observability_surfaces:
  - Unit tests verify rendering of all 12 piece types
  - Unit tests verify square color, selection state, and click handling
  - Manual visual test via App.tsx confirms all pieces and squares render correctly
duration: 25m
verification_result: passed
completed_at: 2026-03-14
blocker_discovered: false
---

# T02: Create Piece and Square components with SVG graphics

**Created Piece and Square components with SVG graphics for all 12 chess piece types, unit tests passing.**

## What Happened

Implemented the core visual building blocks for the chess board:

1. **Created `src/types/chess.ts`** with TypeScript interfaces:
   - `PieceType`: union type for 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
   - `PieceColor`: union type for 'white' | 'black'
   - `Piece`: object interface with type and color properties

2. **Created `src/components/Piece.tsx`**:
   - SVG path data for all 12 piece types (wk, wq, wr, wb, wn, wp, bk, bq, br, bb, bn, bp)
   - Uses `w-full h-full` class for proper scaling to container
   - White pieces: gray-100 fill with gray-900 stroke
   - Black pieces: gray-800 fill with gray-100 stroke

3. **Created `src/components/Square.tsx`**:
   - Accepts `square` (algebraic notation), `piece`, `isLight`, `isSelected`, `onClick` props
   - Light squares: `bg-amber-200`
   - Dark squares: `bg-amber-700`
   - Selection highlight: `ring-4 ring-blue-400 ring-inset`
   - Click handler emits square notation

4. **Created unit tests** for both components:
   - 13 tests for Piece (all 12 piece types + container scaling)
   - 9 tests for Square (colors, selection, click handling, empty squares)

## Verification

```bash
# All tests pass
$ npm run test -- --run

✓ src/App.test.tsx (2 tests)
✓ src/components/__tests__/Square.test.tsx (9 tests)
✓ src/components/__tests__/Piece.test.tsx (13 tests)

Test Files  3 passed (3)
     Tests  24 passed (24)
```

**Manual visual check:** Updated App.tsx temporarily to display all pieces and squares. Screenshot confirms:
- All 12 piece types render correctly
- Alternating light/dark square pattern (amber-200/amber-700)
- Blue ring highlight visible on selected squares
- Pieces scale correctly in their containers

## Diagnostics

- Run unit tests: `npm run test -- Piece` or `npm run test -- Square`
- Visual check: Start dev server (`npm run dev`) and inspect rendered pieces
- Component inspection: Use browser devtools to verify aria-label attributes

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/types/chess.ts` — TypeScript interfaces for chess types
- `src/components/Piece.tsx` — SVG piece rendering component
- `src/components/Square.tsx` — Board square component with selection support
- `src/components/__tests__/Piece.test.tsx` — Unit tests for Piece
- `src/components/__tests__/Square.test.tsx` — Unit tests for Square
