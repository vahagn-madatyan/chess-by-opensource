# M001: Core Chess Game

**Vision:** A smooth, modern web chess game against Stockfish AI. Playable immediately, adjustable difficulty, with history and undo.

## Success Criteria

- User can open the app and start playing without setup
- All legal chess moves work (including special moves)
- AI responds consistently within 2 seconds at default difficulty
- Move history displays accurately in standard notation
- Undo recovers from mistakes without friction
- Game ends are clearly communicated (checkmate/stalemate)

## Key Risks / Unknowns

- Stockfish WASM initialization and UCI protocol communication
- Drag-and-drop implementation complexity vs reliability
- UI thread blocking during AI search at high difficulty

## Proof Strategy

- Stockfish integration risk → retire in S02 by proving AI responds to player moves with legal chess moves
- Drag complexity risk → retire in S01 by proving click-to-move works reliably; drag is bonus
- Performance risk → retire in S02 by proving AI responds within 2 seconds at default (skill 10) difficulty

## Verification Classes

- Contract verification: Unit tests for move validation, component rendering tests
- Integration verification: Full game played against AI, special moves tested (castling, en passant, promotion)
- Operational verification: None — static deployment
- UAT / human verification: Play a complete game, verify experience feels smooth

## Milestone Definition of Done

This milestone is complete only when all are true:

- All three slices deliver their stated outcomes
- User can play a complete game from start to finish
- AI strength is adjustable and perceptibly different at min vs max
- Move history reflects actual game played
- Undo works correctly after every move pair
- Game-over states display clearly
- Code is committed and branch is clean

## Requirement Coverage

- Covers: R001, R002, R003, R004, R005, R006, R007
- Partially covers: none
- Leaves for later: none
- Orphan risks: none

## Slices

- [x] **S01: Board UI** `risk:low` `depends:[]`
  > After this: See 8x8 board with pieces in starting position, click squares to select and move pieces (visual only, no rules enforcement)

- [x] **S02: Game Engine** `risk:medium` `depends:[S01]`
  > After this: Play a complete legal game against Stockfish AI — illegal moves rejected, AI responds to every player move

- [x] **S03: Game Features** `risk:low` `depends:[S02]`
  > After this: Full experience with move history sidebar, undo button, difficulty selector, game status indicators, and new game button

## Boundary Map

### S01 → S02

Produces:
- `Board` component — renders 8x8 grid with `Piece` components
- `Square` component — accepts click handler, highlights selection
- `Piece` component — renders SVG piece graphics (K, Q, R, B, N, P in white/black)
- Piece position state — `boardState: (Piece | null)[][]` 2D array or FEN string
- `onSquareClick(square: string)` callback — emits algebraic notation (e.g., "e2", "e4")

Consumes: nothing (first slice)

### S02 → S03

Produces:
- `GameState` interface — FEN, move history, turn color, game status
- `ChessEngine` class/module — wraps chess.js and Stockfish, exposes `makeMove()`, `getAiMove()`, `getLegalMoves()`
- `useChessGame()` hook — manages game lifecycle, player/AI turns, state updates
- Game loop — player move → validate → update state → trigger AI → AI move → update state
- Move validation — illegal moves rejected with no state change

Consumes from S01:
- `Board` component — receives FEN or position state, renders pieces accordingly
- `onSquareClick` — game hook wires this to move attempt logic

### S03 → (none, final slice)

Produces:
- `MoveHistory` component — list of algebraic notation moves
- `UndoButton` component — triggers undo action
- `DifficultySelector` component — skill level 1-20 input
- `GameStatus` component — turn indicator, check/mate/stalemate display
- `NewGameButton` component — resets to initial state
- `App` layout — assembles Board, sidebar with history/controls

Consumes from S02:
- `GameState` — displays current turn, status
- `moveHistory` array — renders notation list
- `undo()` function — wired to undo button
- `setDifficulty(level)` — wired to selector
- `resetGame()` — wired to new game button
