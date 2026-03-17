# M001: Core Chess Game — Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

## Project Description

A web-based chess game where a single player faces off against Stockfish AI. Clean, modern UI with essential game features: visual board, legal move enforcement, adjustable AI difficulty, move history, and undo capability.

## Why This Milestone

Delivers the complete "play chess against computer" experience. No multiplayer, no analysis tools, no persistence — just a solid game of chess that feels good to play.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Visit a URL and immediately see a chess board with pieces in starting position
- Click or drag pieces to make moves
- See illegal moves rejected with clear feedback
- Watch Stockfish respond after a brief "thinking" delay
- Adjust AI strength from beginner to master level
- See all moves listed in algebraic notation
- Undo the last move (player + AI) if they made a mistake
- Know when the game ends (checkmate or stalemate) with clear result display

### Entry point / environment

- Entry point: `http://localhost:5173/` (Vite dev server) or deployed static site
- Environment: Modern web browsers (Chrome, Firefox, Safari, Edge latest)
- Live dependencies involved: None — fully client-side

## Completion Class

- Contract complete means: All legal chess moves work, AI responds correctly, UI renders correctly across supported browsers
- Integration complete means: Stockfish WASM loads and communicates, chess.js validates moves, React state syncs with engine
- Operational complete means: None — static deployment, no server lifecycle concerns

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- User can play a complete game from opening position to checkmate or stalemate
- AI responds within 2 seconds at default difficulty
- All legal moves work including castling, en passant, and promotion
- Move history accurately reflects the game played
- Undo correctly reverts both player and AI moves
- UI is responsive and usable on desktop and tablet viewports

## Risks and Unknowns

- Stockfish WASM loading and initialization — must happen smoothly on page load
- Drag-and-drop vs click-to-move — need to pick one primary, maybe support both
- Piece promotion UI — need modal or inline selector when pawn reaches end
- Performance at higher difficulty — Stockfish search depth can block UI thread

## Existing Codebase / Prior Art

- None — starting fresh

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R001 — Board UI (advances: primary interface exists)
- R002 — Move validation (advances: chess rules enforced)
- R003 — AI opponent (advances: core gameplay loop works)
- R004 — Difficulty (advances: accessible to all skill levels)
- R005 — History (advances: game review capability)
- R006 — Undo (advances: mistake recovery)
- R007 — Status (advances: clear game state communication)

## Scope

### In Scope

- React + TypeScript + Vite setup
- Chess board component with SVG pieces
- Drag-and-drop OR click-to-move piece interaction
- Stockfish WASM integration via npm
- chess.js for move validation and game state
- AI move generation with adjustable skill level
- Move history display (algebraic notation)
- Undo last move (player + AI)
- Game status: check, checkmate, stalemate, turn indicator
- New game button
- Clean modern UI styling

### Out of Scope / Non-Goals

- Multiplayer / online play
- Opening books or analysis mode
- Save/load games or PGN export
- Sound effects or animations beyond basic transitions
- Mobile-optimized layout (tablet OK, phone not prioritized)
- Time controls / clocks
- Board themes or piece sets (single clean style)

## Technical Constraints

- Must use Stockfish 16 WASM (already chosen)
- Must validate moves with chess.js (industry standard)
- Must work without backend (static deployment)
- Must load AI engine within 3 seconds on modern connection

## Integration Points

- Stockfish WASM — loaded as npm package, initialized on mount, communicated via UCI protocol messages
- chess.js — npm package, used for FEN generation, move validation, game state tracking

## Open Questions

- Drag-and-drop primary or click-to-move? — leaning click-to-move for reliability, can add drag later
- Where to show move history? — sidebar on desktop, panel on tablet, maybe collapsible
- Promotion UI — modal overlay with piece selector (Q, R, B, N)
