# S02 — Research

**Date:** 2026-03-14

## Summary

S02 integrates chess.js for move validation and Stockfish WASM for AI opponent. The slice transforms the visual-only board from S01 into a fully playable chess game.

chess.js provides complete game state management: move validation, legal move generation, FEN handling, and game-over detection (checkmate, stalemate, draw). Its API is straightforward—create a `Chess` instance, call `move({from, to, promotion})` which returns a move object or throws on illegal moves. The `undo()` method enables single-move rollback for the undo feature.

Stockfish.js uses the UCI protocol via `postMessage()`. Initialize the engine, send `position fen <fen>` to set the board, then `go depth <n>` or `go movetime <ms>` to search. The engine responds asynchronously with `bestmove <move>` when complete. Skill level (0-20) is set via `setoption name Skill Level value <n>`.

The main architectural challenge is the game loop: player clicks source square, clicks destination square, chess.js validates, if legal the move is applied, board updates, then trigger AI search. While AI "thinks," show loading state. When `bestmove` arrives, apply it to chess.js, update board. Handle promotion by detecting pawn-to-last-rank and showing a piece selector before completing the move.

## Recommendation

**Use chess.js as the single source of truth for game state.** Replace `useBoardState`'s visual-only move logic with chess.js validation. Keep the 2D board array for rendering but derive it from chess.js's FEN output via the existing `parseFen` utility.

**Create a `ChessEngine` class to encapsulate Stockfish.** Wrap the UCI protocol in a Promise-based API: `getBestMove(fen: string, skill: number, timeoutMs: number): Promise<string>`. This isolates the message-passing complexity and makes the engine swappable later if needed.

**Use `useReducer` for game state** (per D006). The game has complex state transitions (player move → AI thinking → AI move → game over check) that fit reducer patterns better than scattered `useState` calls.

**Don't hand-roll move validation**—chess.js handles all rules including en passant, castling rights, and fifty-move rule. Don't implement UCI parsing manually—use event listeners and Promise wrappers.

## Don't Hand-Roll

| Problem | Existing Solution | Why Use It |
|---------|------------------|------------|
| Move validation | chess.js `move()` method | Handles all chess rules, throws on illegal moves, returns SAN notation |
| Legal move generation | chess.js `moves({square})` | Required for highlighting valid destination squares |
| Game-over detection | chess.js `isGameOver()`, `isCheckmate()`, `isStalemate()` | Correctly handles draw conditions, threefold repetition, insufficient material |
| FEN parsing/validation | chess.js `load()`, `fen()` | Standard format, handles all position metadata (castling, en passant, clocks) |
| Undo | chess.js `undo()` | Returns undone move or null, maintains full history |
| Chess AI engine | Stockfish.js WASM | Grandmaster strength, battle-tested, UCI standard protocol |
| Engine skill control | Stockfish `Skill Level` option (0-20) | Directly maps to user-facing difficulty setting |

## Existing Code and Patterns

- `src/hooks/useBoardState.ts` — Visual-only state management. **Replace move logic** with chess.js integration but keep the board array structure for rendering compatibility.
- `src/components/Board.tsx` — Accepts `onSquareClick` callback and `initialFen` prop. **No changes needed**—S02 wires up the callback to actual move validation.
- `src/utils/fen.ts` — `parseFen()` converts FEN to 2D array. **Reuse for rendering**—chess.js outputs FEN via `.fen()` method.
- `src/types/chess.ts` — `Piece`, `PieceType`, `PieceColor` interfaces. **Keep compatible**—chess.js uses single-letter notation ('p', 'N', etc.) but maps cleanly to our types.

## Constraints

- **Stockfish WASM must load asynchronously.** Engine is not ready immediately—need loading state and retry logic on initialization failure.
- **UCI protocol is message-based.** Stockfish communicates via `postMessage()` and `onmessage` callbacks—no direct function calls. Requires Promise-wrapping for ergonomic async/await usage.
- **Promotion requires UI interruption.** When a pawn reaches the last rank, chess.js move fails without `promotion` field. Must detect this case and show piece selector before completing move.
- **AI search can block if misused.** Using `go infinite` without `stop` or very high depth can hang. Use `go movetime 1500` (1.5s) or `go depth 10` for consistent response times.
- **Skill level 0-20 maps linearly.** Stockfish docs suggest skill 0 is ~800 Elo, skill 20 is ~3500 Elo. Default should be ~10 (~1500 Elo).

## Common Pitfalls

- **Illegal move errors crash the app.** chess.js `move()` throws on invalid moves. Wrap in try/catch or validate first with `moves({square: from}).includes(to)` pattern.
- **FEN mismatch between chess.js and rendering.** chess.js tracks internal state—always update the board from `chess.fen()` after each move, don't manually manipulate the 2D array.
- **Stockfish bestmove format is UCI (e2e4), not SAN.** Must convert UCI notation to `{from, to}` for chess.js or use SAN parsing. UCI is 4-5 characters (e2e4, e1g1 for castle, e7e8q for promotion).
- **Async race conditions on rapid moves.** If player clicks rapidly while AI is thinking, could trigger multiple searches. Disable input during AI turn.
- **Promotion piece case sensitivity.** UCI promotion uses lowercase (e7e8q for queen), but chess.js promotion field expects lowercase too. Be consistent.
- **Game over detection timing.** Check `isGameOver()` after both player and AI moves—AI could deliver checkmate or stalemate.

## Open Risks

- **Stockfish WASM initialization failures in test environment.** jsdom doesn't support Web Workers—unit tests may need to mock the engine or use integration-style tests sparingly.
- **Performance at skill 20.** Higher skill levels increase search depth. If `go movetime` isn't used, search could exceed 2-second target. Mitigation: always use movetime limit, not depth.
- **Promotion UI timing complexity.** The game loop must pause mid-move for promotion selection, then resume. This state machine complexity could introduce bugs if not handled carefully.
- **Undo after game over.** chess.js `undo()` works after game over, but UI should prevent further moves once game ends. Clarify undo behavior—likely allow undo until game restarts.

## Skills Discovered

| Technology | Skill | Status |
|------------|-------|--------|
| chess.js | None found | n/a — library is well-documented |
| Stockfish | None found | n/a — WASM integration is project-specific |

No relevant agent skills found for chess.js or Stockfish. Both libraries have straightforward APIs; integration complexity is in state management, not library usage.

## Sources

- chess.js move validation and game state (source: [Chess.js Documentation](https://github.com/jhlywa/chess.js/blob/master/README.md))
- Stockfish.js UCI protocol and skill levels (source: [Stockfish.js Engine Interface](https://github.com/nmrugg/stockfish.js/blob/master/engine-interface.txt))
- Stockfish initialization and search options (source: [Stockfish.js Demo](https://github.com/nmrugg/stockfish.js/blob/master/examples/demo.html))
