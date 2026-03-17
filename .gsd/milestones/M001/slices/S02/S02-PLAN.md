# S02: Game Engine

**Goal:** Play a complete legal game against Stockfish AI — illegal moves rejected, AI responds to every player move  
**Demo:** Open the app, click squares to move pieces, only legal chess moves are allowed, AI responds within 2 seconds

## Must-Haves

- Legal chess move validation using chess.js (all rules: check, checkmate, stalemate, castling, en passant, promotion)
- Stockfish WASM AI opponent that responds to player moves
- Player vs AI turn management with loading state while AI thinks
- Pawn promotion UI when reaching last rank
- Game state tracking (turn, check, checkmate, stalemate, draw)
- Clean error handling for illegal moves (reject without crash)
- Integration with existing Board component from S01

## Verification

- `npm run test -- ChessService` — chess.js wrapper validates moves correctly
- `npm run test -- useChessGame` — hook manages game state and turns
- `npm run test -- ChessEngine` — Stockfish responds with legal moves
- `npm run test -- chess-integration` — complete game flow player vs AI
- Browser verification: Play e2-e4, AI responds, continue game, verify illegal moves rejected
- TypeScript: `npx tsc --noEmit` — no type errors

## Observability / Diagnostics

- Runtime signals: Console logs for moves ("Player: e2-e4", "AI thinking...", "AI: e7-e5")
- Inspection surfaces: React DevTools — `useChessGame` returns full game state object
- Failure visibility: Illegal moves logged to console with reason; Stockfish errors captured and surfaced
- Engine status: `engine.isReady()` returns boolean; `engine.getLastError()` for diagnostics

## Integration Closure

- Upstream surfaces consumed: `Board` component with `onSquareClick` callback; `useBoardState` is **replaced** by `useChessGame`
- New wiring introduced: `useChessGame` hook wires Board clicks → validation → AI → board update; `ChessEngine` wraps Stockfish UCI
- What remains for S03: History display, undo, difficulty selector, game status UI, new game button

## Tasks

- [x] **T01: Install chess.js and Create Game Types** `est:20m`
  - Why: Foundation — install chess.js and establish type contracts for game state that chess.js and UI will share
  - Files: `package.json`, `src/types/game.ts`, `src/services/ChessService.ts`, `src/services/__tests__/ChessService.test.ts`
  - Do: Install chess.js@1.0.0; create GameState interface (fen, turn, isCheck, isCheckmate, moveHistory); create ChessService wrapper with `makeMove()`, `getLegalMoves()`, `getGameState()`; write unit tests
  - Verify: `npm run test -- ChessService` passes; `npx tsc --noEmit` passes
  - Done when: ChessService creates a game, validates a legal move (e2-e4), rejects an illegal move, returns FEN string

- [x] **T02: Create useChessGame Hook** `est:40m`
  - Why: Core game loop — manages game state with reducer, handles player moves, detects game over, interfaces with Board
  - Files: `src/hooks/useChessGame.ts`, `src/hooks/__tests__/useChessGame.test.ts`, `src/types/game.ts` (update), `src/utils/uci.ts`, `src/utils/__tests__/uci.test.ts`
  - Do: Implement game state reducer; create useChessGame hook with `game`, `makeMove()`, `resetGame()`; wire to existing Board via FEN; handle game-over detection; add UCI move parsing utilities
  - Verify: `npm run test -- useChessGame` passes all states; illegal moves rejected; game over detected
  - Done when: Hook can play a full game against itself (no AI yet) — player can make moves until checkmate, FEN updates correctly

- [x] **T03: Integrate Stockfish WASM** `est:45m`
  - Why: The AI opponent — Stockfish provides move generation via UCI protocol
  - Files: `src/engine/ChessEngine.ts`, `src/engine/__tests__/ChessEngine.test.ts`, `public/stockfish/` (WASM files), `src/types/engine.ts`
  - Do: Download stockfish.js and .wasm to public/; create ChessEngine class wrapping Worker; implement Promise-based `getBestMove(fen, skill, timeoutMs)`; handle async initialization with `.isReady()`; convert UCI moves to chess.js format
  - Verify: `npm run test -- ChessEngine` — engine initializes, responds to position, returns best move within timeout
  - Done when: `await engine.getBestMove("startpos", 10, 1500)` returns a string like "e2e4" or "e7e5" within 2 seconds

- [x] **T04: Wire UI and Handle Promotion** `est:35m`
  - Why: Connect everything — player clicks trigger game loop, AI responds, promotion UI interrupts when needed
  - Files: `src/components/Game.tsx`, `src/components/PromotionDialog.tsx`, `src/components/__tests__/Game.test.tsx`, `src/hooks/useChessGame.ts` (update for AI turns), `src/App.tsx` (update)
  - Do: Update useChessGame to trigger AI after player move; add isThinking state; create PromotionDialog component (q, r, b, n selection); detect promotion-required in hook; integrate with Board; update App.tsx to render Game component
  - Verify: `npm run test -- Game` passes; browser test — play a move, AI responds; test promotion with h-pawn
  - Done when: Can play a complete game in browser — player move → AI thinks → AI move → repeat; promotion dialog appears and works

- [x] **T05: Integration Testing** `est:25m`
  - Why: Prove the slice — full game flow, special moves, illegal moves rejected
  - Files: `src/__tests__/chess-integration.test.ts`, `src/components/__tests__/Game.e2e.test.tsx`
  - Do: Write integration test playing full game moves verifying FEN updates; test special moves (castling, en passant); test illegal move rejection; verify AI responds within 2 seconds
  - Verify: `npm run test -- chess-integration` passes; `npm run test -- --run` all pass
  - Done when: Tests prove legal game works, special moves work, AI responds, 50+ tests pass

## Files Likely Touched

- `package.json` (add chess.js, stockfish.js dependencies)
- `src/types/game.ts` (new — GameState, GameStatus interfaces)
- `src/types/engine.ts` (new — EngineStatus, EngineOptions interfaces)
- `src/services/ChessService.ts` (new — chess.js wrapper)
- `src/services/__tests__/ChessService.test.ts` (new)
- `src/hooks/useChessGame.ts` (new — game state management)
- `src/hooks/__tests__/useChessGame.test.ts` (new)
- `src/engine/ChessEngine.ts` (new — Stockfish wrapper)
- `src/engine/__tests__/ChessEngine.test.ts` (new)
- `src/utils/uci.ts` (new — UCI notation conversion)
- `src/utils/__tests__/uci.test.ts` (new)
- `src/components/Game.tsx` (new — orchestrates Board + game logic)
- `src/components/PromotionDialog.tsx` (new — piece selection modal)
- `src/components/__tests__/Game.test.tsx` (new)
- `src/components/__tests__/Game.e2e.test.tsx` (new)
- `src/__tests__/chess-integration.test.ts` (new — full game tests)
- `public/stockfish/stockfish.js` (downloaded)
- `public/stockfish/stockfish.wasm` (downloaded)
- `src/App.tsx` (update — render Game component)
- `src/hooks/useBoardState.ts` (delete or deprecate — replaced by useChessGame)
