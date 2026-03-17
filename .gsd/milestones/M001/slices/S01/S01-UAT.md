# S01: Board UI — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S01 delivers visual components only — no game logic. Correctness is verified through unit tests (55 passing) and visual inspection of rendered board.

## Preconditions

- Dev server running: `npm run dev` (port 5173)
- OR production build: `npm run build` + `npx serve dist`
- Modern browser (Chrome, Firefox, Safari, Edge)

## Smoke Test

Navigate to `http://localhost:5173` — an 8x8 chess board with alternating amber squares and all 32 pieces in starting position should render immediately.

## Test Cases

### 1. Board Renders Starting Position

1. Open `http://localhost:5173`
2. Observe the board

**Expected:** 
- 8x8 grid with alternating light (amber-200) and dark (amber-700) squares
- White pieces on ranks 1-2 (bottom of board)
- Black pieces on ranks 7-8 (top of board)
- All 32 pieces present (R, N, B, Q, K, B, N, R + 8 pawns per side)

### 2. Square Selection Highlight

1. Click any square with a white piece (e.g., e2 pawn)
2. Observe the square styling

**Expected:** 
- Clicked square shows blue ring highlight (ring-4 ring-blue-400)
- Square remains highlighted until another action is taken

### 3. Click-to-Move Interaction

1. Click e2 square (white pawn)
2. Click e4 square (two squares forward)

**Expected:** 
- White pawn visually moves from e2 to e4
- e2 square becomes empty
- Console shows "e2" then "e4" logged

### 4. onSquareClick Callback

1. Open browser developer console
2. Click any square

**Expected:** 
- Console logs the algebraic notation (e.g., "a1", "e4", "h8")
- One log entry per click

### 5. Responsive Board Sizing

1. Resize browser window
2. Observe board dimensions

**Expected:** 
- Board maintains 1:1 aspect ratio (square)
- Board scales within viewport constraints
- No horizontal scroll on mobile widths

## Edge Cases

### Deselect by Clicking Same Square

1. Click e2 to select
2. Click e2 again

**Expected:** Selection highlight is removed, piece stays at e2.

### Click Empty Square First

1. Click e4 (empty in starting position)

**Expected:** No selection highlight appears (empty squares cannot be selected).

### Multiple Moves

1. Move e2 pawn to e4
2. Move d2 pawn to d4

**Expected:** Both pawns in new positions, e2 and d2 empty.

## Failure Signals

- Board does not render (blank screen) → Check console for React errors
- Pieces missing or wrong positions → Check FEN parsing in `src/utils/fen.ts`
- Click does nothing → Check `onSquareClick` prop is passed
- Selection highlight missing → Check Tailwind CSS is loaded
- Wrong colors → Check `isLight` calculation in Board.tsx

## Requirements Proved By This UAT

- R001 — Interactive Chess Board (partial) — Visual board and click interaction proven. Move validation deferred to S02.

## Not Proven By This UAT

- Legal move validation (S02 responsibility)
- Drag-and-drop (optional per D005)
- Game state management
- AI opponent
- Move history
- Check/checkmate detection

## Notes for Tester

- This is visual-only implementation — pieces can move anywhere on the board regardless of chess rules
- The interaction is click-to-move only (no drag support yet)
- Board uses algebraic notation: files a-h (left to right), ranks 1-8 (bottom to top from white's perspective)
- White pieces at bottom, black pieces at top (standard chess orientation)
