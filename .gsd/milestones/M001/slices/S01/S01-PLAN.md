# S01: Board UI

**Goal:** Render an 8x8 chess board with pieces in starting position and implement click-to-move interaction (visual only, no game logic).

**Demo:** Open the app, see a chess board with all 32 pieces in standard starting position, click a square to select it (highlight appears), click another square to move the piece (visual update only, no validation).

## Must-Haves

- 8x8 grid board with alternating light/dark squares
- All 12 piece types rendered as SVG (K, Q, R, B, N, P in white and black)
- Pieces arranged in standard starting position
- Click-to-move: first click selects a square (highlight), second click moves the piece
- Square selection emits algebraic notation via callback (`onSquareClick(square: string)`)
- Responsive board that maintains aspect ratio

## Verification

- `npm run test -- src/components/__tests__/Board.test.tsx` — Board renders with 32 pieces
- `npm run dev` → navigate to `http://localhost:5173` → visually confirm board renders correctly
- Click squares and verify selection highlighting works

## Tasks

- [x] **T01: Initialize project with Vite, React, TypeScript, and Tailwind** `est:20m`
  - Why: Establish the foundation for all subsequent UI work per D003 and D004
  - Files: `package.json`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `index.html`, `src/main.tsx`, `src/App.tsx`
  - Do: Run `npm create vite@latest . -- --template react-ts`, install Tailwind CSS v4 with `@tailwindcss/vite` plugin, configure path aliases (`@/` → `./src`), clean up default Vite template code
  - Verify: `npm run dev` starts dev server without errors, `npm run build` completes successfully
  - Done when: `http://localhost:5173` shows "Chess Game" heading and zero build errors

- [x] **T02: Create Piece and Square components with SVG graphics** `est:40m`
  - Why: Core visual elements needed before board assembly; SVG pieces are the most complex visual artifact
  - Files: `src/components/Piece.tsx`, `src/components/Square.tsx`, `src/types/chess.ts`, `src/components/__tests__/Piece.test.tsx`, `src/components/__tests__/Square.test.tsx`
  - Do: Create TypeScript interfaces for Piece props (`type: 'k'|'q'|'r'|'b'|'n'|'p'`, `color: 'w'|'b'`), implement SVG piece graphics using inline paths (standard algebraic piece shapes), create Square component with alternating colors (amber-200/amber-700) and selection highlight support, write unit tests for both components
  - Verify: `npm run test -- Piece` and `npm run test -- Square` pass; pieces render correctly in Storyboard or test UI
  - Done when: All 12 piece types render correctly, squares show correct alternating colors, selection border appears when `isSelected=true`

- [x] **T03: Create Board component with click-to-move interaction** `est:40m`
  - Why: Assemble pieces and squares into playable board with the core interaction pattern
  - Files: `src/components/Board.tsx`, `src/components/__tests__/Board.test.tsx`, `src/utils/fen.ts`, `src/hooks/useBoardState.ts`
  - Files: `src/App.tsx` (update to use Board)
  - Do: Implement FEN parsing utility to convert FEN strings to board arrays, create `useBoardState` hook to manage piece positions and selection state, implement Board component that renders 8x8 grid using flex rows (maps directly to chess.js output), wire click handlers for square selection and piece movement (visual only, no validation), emit `onSquareClick(square: string)` callback with algebraic notation
  - Verify: `npm run test -- Board` passes showing 32 pieces render from starting FEN; manual test confirms click-to-move works
  - Done when: Board displays starting position, clicking e2 selects it (blue border), clicking e4 moves the white pawn there visually, callback logs "e2" then "e4" to console

## Files Likely Touched

- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tailwind.config.js` / `postcss.config.js`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/types/chess.ts`
- `src/utils/fen.ts`
- `src/hooks/useBoardState.ts`
- `src/components/Piece.tsx`
- `src/components/Square.tsx`
- `src/components/Board.tsx`
- `src/components/__tests__/Piece.test.tsx`
- `src/components/__tests__/Square.test.tsx`
- `src/components/__tests__/Board.test.tsx`
