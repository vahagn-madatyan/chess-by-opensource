# S02: Game Engine — UAT

**Milestone:** M001
**Written:** 2026-03-14

## UAT Type

- UAT mode: artifact-driven with human-experience verification
- Why this mode is sufficient: 277 automated tests cover all edge cases (special moves, illegal moves, AI responses); manual browser verification confirms UI integration and Stockfish initialization

## Preconditions

- Dev server running: `npm run dev`
- Browser console open to observe engine initialization logs
- No network blocking for WASM file loading (113MB stockfish.wasm)

## Smoke Test

1. Open http://localhost:5173
2. Verify chess board renders with 32 pieces in starting position
3. Verify console shows "[ChessEngine] Engine ready" and "[Game] Engine initialized successfully"
4. Verify status bar shows "White's turn" and "Your turn"

## Test Cases

### 1. Legal Move Execution

1. Click e2 square (white pawn)
2. Click e4 square
3. **Expected:** White pawn moves to e4, turn indicator changes to "Black's turn" / "AI thinking...", AI responds with black move within 2 seconds, move appears in history

### 2. Illegal Move Rejection

1. Click e2 square
2. Click e5 square (two squares forward for pawn — illegal)
3. **Expected:** Move rejected, error message "Illegal move: e2-e5" displayed, board unchanged, still player's turn

### 3. Special Move — Castling

1. Move e2-e4, let AI respond
2. Move g1-f3, let AI respond
3. Move f1-e2 or f1-d3, let AI respond  
4. Click e1 (white king), click g1 (kingside castle)
5. **Expected:** King moves to g1, rook moves to f1, castling executed

### 4. Special Move — Pawn Promotion

1. Play moves to advance white h-pawn to h7
2. Capture/move to h8
3. **Expected:** Promotion dialog appears with Queen, Rook, Bishop, Knight options
4. Select Queen
5. **Expected:** Pawn promoted to queen on h8, AI responds, game continues

### 5. Game Over — Checkmate

1. Play "fool's mate" pattern or let AI checkmate
2. Or use Scholar's Mate: e4, Qh5, Bc4, Qxf7#
3. **Expected:** Game status shows "Checkmate! White wins", board disabled for new moves

### 6. New Game Reset

1. Make several moves in a game
2. Click "New Game" button
3. **Expected:** Board resets to starting position, move history clears, turn indicator shows "White's turn", new game starts

## Edge Cases

### Rapid Clicks During AI Thinking

1. Make a move
2. While "AI thinking..." displayed, rapidly click multiple squares
3. **Expected:** Board disabled during AI thinking, clicks ignored, no state corruption

### Browser Refresh Mid-Game

1. Play several moves
2. Refresh browser
3. **Expected:** Game resets to initial state (no persistence by design), engine reinitializes, ready to play

### Promotion With Capture

1. Position pawn to capture onto promotion square (e.g., white pawn on g7, black piece on h8)
2. Click g7, click h8
3. **Expected:** Promotion dialog appears, after selection pawn captures and promotes on h8

## Failure Signals

- Console errors from ChessEngine or Stockfish
- "Engine failed to initialize" message
- Board shows pieces but no moves work (clicking squares does nothing)
- AI doesn't respond within 5 seconds
- Move history shows garbled notation
- Promotion doesn't show dialog or fails to complete

## Requirements Proved By This UAT

- R002 — Legal Move Validation: All moves validated by chess.js, illegal moves rejected with feedback
- R003 — AI Opponent: Stockfish responds to every player move with legal moves within timeout

## Not Proven By This UAT

- R001 — Full accessibility features (S01 covered visual board)
- R004 — Adjustable Difficulty: Engine supports skill 0-20 but no UI to change it yet (S03)
- R005 — Move History Display: Basic history shown but not polished sidebar (S03)
- R006 — Undo: Hook supports it but no UI button yet (S03)
- R007 — Game Status: Basic indicators present but not complete visual polish (S03)

## Notes for Tester

- First page load may take a moment as 113MB WASM file downloads
- AI thinking time varies by device performance; default timeout is 1500ms
- If engine fails to initialize, check browser console for WASM loading errors
- Promotion dialog appears centered over board; click piece icon to select
- Browser console shows all UCI traffic for debugging: [ChessEngine] > (commands sent), [ChessEngine] < (responses received)
