# Requirements

## Active

### R001 — Interactive Chess Board
- Class: core-capability
- Status: active
- Description: Visual chess board with 8x8 squares, standard piece set, and smooth piece movement (drag or click)
- Why it matters: The board is the primary interface. Without it, there is no game.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: unmapped
- Notes: Must support both drag-and-drop and click-to-move for accessibility

### R002 — Legal Move Validation
- Class: core-capability
- Status: validated
- Description: Only legal chess moves are allowed. Illegal moves are rejected with clear feedback.
- Why it matters: Enforces chess rules. Without validation, it's not chess.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: ChessService 41 unit tests + chess-integration 25 tests
- Notes: Uses chess.js for validation. Includes special moves: castling, en passant, promotion.

### R003 — AI Opponent (Stockfish)
- Class: core-capability
- Status: validated
- Description: Computer opponent that responds to player moves using Stockfish chess engine
- Why it matters: The user wants to play against AI, not a hot-seat game.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: M001/S03
- Validation: ChessEngine 34 tests + integration tests prove AI responds within 2000ms
- Notes: Stockfish 18 Lite WASM (single-threaded). Brief thinking delay (300-800ms) for natural feel.

### R004 — Adjustable Difficulty
- Class: quality-attribute
- Status: validated
- Description: Player can select AI strength level (1-20 Elo range). Default: intermediate (~1500).
- Why it matters: Beginners want to win sometimes; advanced players want challenge.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: S03 component tests + integration tests prove DifficultySelector updates engine skill level 0-20
- Validated by: S03

### R005 — Move History Display
- Class: primary-user-loop
- Status: validated
- Description: Sidebar or panel showing all moves in standard algebraic notation (e.g., "1. e4 e5 2. Nf3")
- Why it matters: Players want to review the game, analyze mistakes, and feel progress.
- Source: inferred
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: S03 component tests + integration tests prove MoveHistory displays moves in standard notation with proper scrolling
- Validated by: S03

### R006 — Undo Last Move
- Class: primary-user-loop
- Status: validated
- Description: Single undo button that reverts player's last move and AI's response
- Why it matters: Mistakes happen. Undo reduces frustration without requiring full restart.
- Source: inferred
- Primary owning slice: M001/S03
- Supporting slices: none
- Validation: S03 component tests + integration tests prove UndoButton reverts move pairs with proper disabled states
- Validated by: S03

### R007 — Game Status Indicators
- Class: failure-visibility
- Status: validated
- Description: Clear visual indication of check, checkmate, stalemate, and current turn
- Why it matters: Players need to know game state without studying the board.
- Source: inferred
- Primary owning slice: M001/S03
- Supporting slices: M001/S02
- Validation: S03 integration tests + UAT prove game status clearly displayed in UI with GameOverModal
- Validated by: S03

## Deferred

None yet.

## Out of Scope

### R100 — Multiplayer / Online Play
- Class: anti-feature
- Status: out-of-scope
- Description: Playing against other humans over network
- Why it matters: User explicitly said no multiplayer. Keeps scope focused.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Would require server, matchmaking, WebSockets — entire second milestone

### R101 — Opening Book / Analysis
- Class: anti-feature
- Status: out-of-scope
- Description: Opening database, move analysis, blunder detection, best move suggestions
- Why it matters: Would be useful for learning, but not core to "play a game" experience.
- Source: inferred
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Future enhancement if user wants training features

### R102 — Save / Load Games
- Class: anti-feature
- Status: out-of-scope
- Description: Persist game state to local storage or file, resume later
- Why it matters: Sessions are short-lived browser games. Browser refresh is acceptable loss.
- Source: inferred
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Could be added if users request it

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | core-capability | active | M001/S01 | none | unmapped |
| R002 | core-capability | validated | M001/S02 | none | ChessService 41 tests + integration 25 tests |
| R003 | core-capability | validated | M001/S02 | M001/S03 | ChessEngine 34 tests + AI timing tests |
| R004 | quality-attribute | validated | M001/S03 | none | S03 component tests + integration |
| R005 | primary-user-loop | validated | M001/S03 | none | S03 component tests + integration |
| R006 | primary-user-loop | validated | M001/S03 | none | S03 component tests + integration |
| R007 | failure-visibility | validated | M001/S03 | none | S03 integration tests + UAT |
| R100 | anti-feature | out-of-scope | none | none | n/a |
| R101 | anti-feature | out-of-scope | none | none | n/a |
| R102 | anti-feature | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 1
- Mapped to slices: 7
- Validated: 6
- Unmapped active requirements: 0
