# S01 — Board UI Research

**Date:** 2026-03-14

## Summary

Slice S01 focuses on rendering a visual chess board with pieces in starting position and implementing click-to-move interaction. The board must display an 8x8 grid with standard algebraic notation (a1-h8), render SVG chess pieces (K, Q, R, B, N, P in white/black), and support square selection via click handlers.

chess.js provides the foundation for board state through its `.board()` method which returns a 2D array of pieces, and `.fen()` for position serialization. For S01 specifically, we only need the visual representation — move validation and game logic come in S02. The key implementation decisions center on: (1) how to represent and render the board grid, (2) how to handle piece graphics (SVG vs Unicode), and (3) how to manage selection state for click-to-move interaction.

## Recommendation

**Approach:** Build a `Board` component that accepts a FEN string prop and renders an 8x8 grid using CSS Grid. Use a `Piece` component that maps piece types (k, q, r, b, n, p) to inline SVG graphics. Use React `useState` for selection state (selected square) and emit square clicks via `onSquareClick(square: string)` callback.

**Why this approach:**
- FEN is the standard chess position notation — chess.js outputs it natively, Stockfish consumes it directly
- CSS Grid gives us clean, responsive square sizing without absolute positioning math
- Inline SVG pieces scale crisply at any size and allow color customization via props
- Click-to-move is simpler than drag-and-drop and matches the D005 decision

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Board state representation | chess.js `.board()` or `.fen()` | Industry standard, already chosen per D002, outputs exactly what we need |
| Piece graphics | Inline SVG or standard chess font | No need to design pieces; SVG gives full style control |
| Square naming | Algebraic notation (a1-h8) | Standard chess coordinate system, used by chess.js and Stockfish |
| Board orientation | CSS transform or conditional rendering | Simple flip for black-at-bottom vs white-at-bottom |

## Existing Code and Patterns

- **No existing codebase** — Starting fresh per M001-CONTEXT.md
- The slice produces components that will be consumed by S02's game engine
- Pattern to follow: chess.js `Chess.board()` returns 2D array ordered `[rank][file]` where rank 0 = rank 8, file 0 = file a

## Constraints

- Must use React + TypeScript + Vite (D003)
- Must use Tailwind CSS for styling (D004)
- Must use click-to-move as primary interaction (D005)
- Board must render from FEN or equivalent position state
- Square selection must emit algebraic notation (e.g., "e2", "e4")
- No game logic or move validation in this slice — visual only

## Common Pitfalls

- **Board array index confusion** — chess.js `.board()` returns ranks from 8→1 (index 0 = rank 8), files a→h (index 0 = file a). When rendering, row 0 visually appears at the top (black's side), so index mapping to visual position is straightforward but easy to invert accidentally.

- **SVG piece sizing** — Pieces must scale to fit their squares. Use `width="100%" height="100%"` with `viewBox` on SVGs, or Tailwind `w-full h-full`, to ensure pieces resize with square size.

- **Click target precision** — If pieces have padding/margin or squares have gaps, clicks might not register on the expected square. Ensure the click handler is on the square container, not just the piece.

- **FEN vs board array drift** — If maintaining local state, ensure FEN prop changes (from parent in S02) properly re-render the board. Use `key` prop or `useEffect` to sync external FEN changes.

## Open Risks

- **Piece graphic quality** — Self-drawn SVGs may look amateur. Consider using established piece designs (like those from lichess.org, which are open source under CC0) or a chess icon library.

- **Responsive sizing** — The board should maintain its 1:1 aspect ratio across screen sizes. CSS aspect-ratio or a padding-bottom hack may be needed.

- **Accessibility** — Click-to-move without keyboard support may fail a11y standards. Consider adding keyboard navigation (arrow keys to move selection, Enter to select/confirm) as a follow-up.

- **Touch targets on mobile** — Even though phone is out of scope, tablet support requires minimum 44px touch targets. With an 8x8 board, this implies minimum board width of ~352px plus spacing.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| Chess AI | letta-ai/skills@chess-best-move | Available — 39 installs |
| Chess regex parsing | letta-ai/skills@regex-chess | Available — 32 installs |
| Chess guidance | api/git@auto-chess-guide | Available — 7 installs |

None of these skills are directly relevant to the Board UI slice — they focus on AI move generation and parsing, not visual board rendering. No installation recommended at this time.

## Technical Deep Dive

### chess.js for Board State

The `Chess` class from chess.js provides the board representation we need:

```typescript
import { Chess } from 'chess.js'

const chess = new Chess() // Starts at default position

// Get 2D array representation
const board = chess.board()
// board[0][0] = { square: 'a8', type: 'r', color: 'b' }
// board[7][7] = { square: 'h1', type: 'r', color: 'w' }

// Get FEN string
const fen = chess.fen()
// -> 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
```

For S01, we can use either representation. FEN is more compact for props; the 2D array is easier to iterate for rendering.

### Board Rendering Approach

**Option A: CSS Grid (Recommended)**
```tsx
<div className="grid grid-cols-8 aspect-square">
  {squares.map(sq => <Square key={sq} ... />)}
</div>
```
- Pros: Simple, responsive, no absolute positioning
- Cons: Requires flat array mapping to 2D visual

**Option B: Flex rows**
```tsx
<div className="flex flex-col">
  {ranks.map(rank => <div className="flex">{rank.map(sq => ...)}</div>)}
</div>
```
- Pros: Natural mapping from chess.js `.board()` output
- Cons: Slightly more DOM nesting

**Decision:** Use Option B (flex rows) because it maps directly to chess.js output and makes coordinate reasoning easier.

### Square Coloring

Standard chess board uses alternating colors. Use modulus arithmetic on file+rank indices:

```typescript
const isLight = (file + rank) % 2 === 1
// or for 0-indexed from top-left:
const isLight = (fileIndex + rankIndex) % 2 === 0
```

Tailwind classes: `bg-amber-200` for light squares, `bg-amber-700` for dark (or any preferred palette).

### Selection Highlighting

Selected square needs visual feedback. Options:
- Border highlight: `ring-4 ring-blue-400`
- Background overlay: `bg-blue-400/30` (semi-transparent)
- Dot marker: Centered circle indicating "selected"

Recommended: Border highlight for selected, dot marker for legal move targets (even though move validation is S02, the UI pattern should be designed now).

### Piece SVG Strategy

Each piece needs an SVG. Options:

1. **Inline SVG components:** `<WhiteKing />`, `<BlackPawn />`, etc.
   - Pros: Full style control, no external dependencies
   - Cons: 12 components to create

2. **Single component with switch:** `<Piece type="k" color="w" />`
   - Pros: One component, data-driven
   - Cons: Large switch statement or object map

3. **Unicode symbols:** ♔ ♕ ♖ ♗ ♘ ♙ ♚ ♛ ♜ ♝ ♞ ♟
   - Pros: Zero assets, instant
   - Cons: Font-dependent appearance, less polished

**Recommendation:** Option 2 (single component with SVG map) for maintainability. Include SVG path data directly in component file — no need for separate asset files.

## Component Interface

```typescript
interface BoardProps {
  fen?: string              // FEN position, defaults to start
  orientation?: 'w' | 'b'   // Which side is at bottom, default 'w'
  selectedSquare?: string   // Currently selected square (e.g., "e2")
  onSquareClick: (square: string) => void
}

interface SquareProps {
  square: string            // Algebraic notation (e.g., "e2")
  piece: Piece | null       // { type: 'p', color: 'w' } or null
  isLight: boolean
  isSelected: boolean
  onClick: () => void
}

interface PieceProps {
  type: 'k' | 'q' | 'r' | 'b' | 'n' | 'p'
  color: 'w' | 'b'
}
```

## Files to Create

1. `src/components/Board.tsx` — Main board component
2. `src/components/Square.tsx` — Individual square
3. `src/components/Piece.tsx` — SVG piece renderer
4. `src/utils/fen.ts` — FEN parsing utilities (or use chess.js directly)
5. `src/types/chess.ts` — TypeScript interfaces

## S01 → S02 Boundary

S01 produces:
- `Board` component with `fen` prop and `onSquareClick` callback
- `Square` component with selection highlighting
- `Piece` component rendering all 12 piece types
- TypeScript interfaces for props

S02 will provide:
- FEN string from game state
- Handler that validates moves and updates state
- Legal move highlights (extending selection UI)

## Sources

- chess.js board representation via `.board()` method (source: chess.js documentation, Context7)
- chess.js FEN handling via `.fen()` and constructor (source: chess.js documentation, Context7)
- Click-to-move interaction pattern chosen per D005 (source: .gsd/DECISIONS.md)
- Stack decisions React+TypeScript+Vite per D003, Tailwind per D004 (source: .gsd/DECISIONS.md)
