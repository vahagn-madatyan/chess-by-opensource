---
estimated_steps: 6
estimated_files: 5
---

# T03: Integrate Stockfish WASM

**Slice:** S02 — Game Engine  
**Milestone:** M001

## Description

Download and integrate Stockfish 16 WASM chess engine. Create a ChessEngine class that wraps the UCI protocol in a Promise-based API, handles async initialization, and converts Stockfish's UCI move format to chess.js compatible format.

## Steps

1. Download stockfish.js and stockfish.wasm from npm or official source to public/stockfish/
2. Create `src/types/engine.ts` with EngineStatus, EngineOptions interfaces
3. Create `src/engine/ChessEngine.ts` wrapping Worker in class
4. Implement `init()` that returns Promise resolving when engine ready
5. Implement `getBestMove(fen, skill, timeoutMs)` sending UCI commands, awaiting bestmove
6. Write tests with mocked Worker (jsdom doesn't support Web Workers)

## Must-Haves

- [ ] Stockfish WASM files in public/stockfish/ (served as static assets)
- [ ] Engine initializes asynchronously with `await engine.init()`
- [ ] `getBestMove()` returns Promise<string> (UCI move like "e2e4")
- [ ] Skill level 0-20 configurable via setoption
- [ ] Search timeout enforced (go movetime or stop after timeout)
- [ ] Error handling for initialization failure

## Verification

- `npm run test -- ChessEngine` — initialization and move generation tests pass
- Mock tests verify UCI command sequence: uci → isready → position → go → bestmove
- Manual (browser): `const engine = new ChessEngine(); await engine.init(); await engine.getBestMove("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1", 10, 1500)` returns valid move

## Observability Impact

- Signals: Console log "Stockfish initializing...", "Engine ready", "Searching...", "Best move: e2e4"
- Inspection: `engine.isReady()` boolean, `engine.getLastError()` string
- Failure: Initialization errors caught and surfaced via console + error state

## Inputs

- `src/utils/uci.ts` — T02 output (UCI format utilities)
- `public/` — directory for static WASM assets

## Expected Output

- `public/stockfish/stockfish.js` — engine loader
- `public/stockfish/stockfish.wasm` — engine binary
- `src/types/engine.ts` — EngineStatus, EngineOptions types
- `src/engine/ChessEngine.ts` — complete engine wrapper
- `src/engine/__tests__/ChessEngine.test.ts` — mocked Worker tests
