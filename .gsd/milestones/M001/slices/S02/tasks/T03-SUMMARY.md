---
id: T03
parent: S02
milestone: M001
provides:
  - Stockfish WASM engine wrapper with Promise-based API
  - EngineStatus, EngineOptions, EngineError type definitions
  - getBestMove(fen, skill, timeoutMs) for AI move generation
  - Console observability for engine lifecycle and search
key_files:
  - public/stockfish/stockfish.js
  - public/stockfish/stockfish.wasm
  - src/types/engine.ts
  - src/engine/ChessEngine.ts
  - src/engine/__tests__/ChessEngine.test.ts
key_decisions:
  - Used stockfish npm package and copied WASM files to public/ for static serving
  - Implemented Worker-based UCI protocol wrapper with async Promise API
  - Singleton pattern via getChessEngine() for app-wide engine instance
  - Skill level 0-20 maps directly to Stockfish's Skill Level option
  - Search timeout uses go movetime with 100ms buffer for engine-side enforcement
  - Mock Worker for tests since jsdom doesn't support Web Workers
  - Console logging prefix [ChessEngine] for all engine traffic
patterns_established:
  - Service wrapper pattern around external WASM library (ChessEngine)
  - Async initialization pattern with init() returning Promise
  - State machine pattern for engine status (uninitialized→initializing→ready→searching→error)
  - Message handler registry for UCI response routing
  - Timeout-based search termination with cleanup
observability_surfaces:
  - Console logs: "Stockfish initializing...", "Engine ready", "Searching...", "Best move: e2e4"
  - engine.isReady() boolean for status checking
  - engine.getStatus() returns EngineStatus
  - engine.getLastError() returns EngineError | null with message, code, timestamp
  - UCI command logging with [ChessEngine] > and [ChessEngine] < prefixes
duration: 35m
verification_result: passed
completed_at: 2025-03-14
blocker_discovered: false
---

# T03: Integrate Stockfish WASM

**Created ChessEngine class wrapping Stockfish 16 WASM with Promise-based UCI API**

## What Happened

Downloaded Stockfish 16 WASM files from the stockfish npm package and created a complete engine wrapper that communicates via UCI protocol over Web Worker. The ChessEngine class provides async initialization, configurable skill levels (0-20), timeout-enforced search, and comprehensive error handling.

Key implementation details:
- Worker loads stockfish.js from /stockfish/stockfish.js (static asset)
- init() waits for uciok → isready → readyok sequence before resolving
- getBestMove() sends setoption → position → go movetime and awaits bestmove response
- Search timeout uses setTimeout to call stop command after specified duration
- State machine tracks engine status for proper lifecycle management
- Message handler registry routes UCI responses to pending promises

## Verification

- `npm run test -- ChessEngine` — 34 tests pass (initialization, UCI protocol, getBestMove, skill levels, timeout, error handling)
- `npx tsc --noEmit` — TypeScript compiles without errors
- `npm run test -- --run` — All 217 tests pass across project
- Mock tests verify UCI command sequence: uci → isready → ucinewgame → position → go → bestmove
- Skill level configuration tested 0-20 range
- Timeout enforcement verified with custom movetime values
- Error handling verified for initialization failures and worker errors

## Diagnostics

- Inspect engine status: `engine.isReady()` returns boolean
- Check detailed status: `engine.getStatus()` returns EngineStatus
- View last error: `engine.getLastError()` returns { message, code?, timestamp }
- Console search logs: Look for "[ChessEngine] Searching for best move (skill=X, timeout=Yms)"
- UCI traffic: All commands logged with [ChessEngine] > (outgoing) and [ChessEngine] < (incoming)

## Deviations

None

## Known Issues

None

## Files Created/Modified

- `public/stockfish/stockfish.js` — Stockfish WASM loader (32KB, copied from npm)
- `public/stockfish/stockfish.wasm` — Stockfish 16 engine binary (113MB, copied from npm)
- `src/types/engine.ts` — EngineStatus, EngineOptions, EngineError, BestMoveResult types
- `src/engine/ChessEngine.ts` — Complete engine wrapper with UCI protocol implementation
- `src/engine/__tests__/ChessEngine.test.ts` — 34 tests with mocked Worker
