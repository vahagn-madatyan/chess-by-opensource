# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? |
|---|------|-------|----------|--------|-----------|------------|
| D001 | M001 | engine | Chess engine | Stockfish 16 WASM | User requested, grandmaster strength, adjustable skill | No |
| D002 | M001 | validation | Move validation library | chess.js | Industry standard, FEN support, legal move generation, battle-tested | No |
| D003 | M001 | stack | Frontend framework | React + TypeScript + Vite | Modern, fast dev server, excellent DX, component-based | No |
| D004 | M001 | styling | CSS approach | Tailwind CSS | Utility-first, rapid iteration, clean aesthetic | No |
| D005 | M001 | interaction | Piece movement | Click-to-move primary, drag optional | More reliable than drag, easier to implement correctly first | Yes — if drag is added later |
| D006 | M001 | state | Game state management | React hooks (useReducer) | Sufficient complexity for single game state, no external state lib needed | No |
| D007 | S01 | build | Vite React plugin version | @vitejs/plugin-react ^4.7.0 | v6 requires Vite 8 which has compatibility issues with Tailwind v4; v4.7.0 supports Vite 5 and 6 | Yes — when upgrading to Vite 8+ |
| D008 | S01 | board | Board layout | CSS Grid (8x8) | Cleaner responsive sizing than flex rows, direct mapping to chess coordinates | No |
| D009 | S01 | pieces | SVG coordinate system | viewBox "0 0 45 45" | Standard chess SVG convention, consistent scaling across all piece types | No |
| D010 | S02 | engine | Stockfish build | stockfish-18-lite-single | Single-threaded WASM avoids SharedArrayBuffer/COEP/COOP complexity, works without special HTTP headers | No |
| D011 | S02 | validation | Illegal move handling | Return null, don't throw | Matches chess.js behavior, prevents crashes, cleaner state management | No |
| D012 | S02 | state | Game state persistence | useReducer + ChessService ref | External service instance via ref maintains game state across renders, reducer handles immutable updates | No |
| D013 | S02 | ux | Promotion handling | Modal dialog interrupt | When pawn reaches last rank, pause move completion until user selects promotion piece | No |
| D014 | S02 | engine | UCI protocol wrapper | Promise-based async API | getBestMove(fen, skill, timeoutMs) returns Promise<string>, handles UCI message routing internally | No |