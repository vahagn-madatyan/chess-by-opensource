/**
 * Engine types for Stockfish chess engine integration
 * Uses UCI (Universal Chess Interface) protocol
 */

/** Engine connection and initialization status */
export type EngineStatus = 
  | 'uninitialized'   // Engine not yet created
  | 'initializing'    // Worker created, waiting for uciok
  | 'ready'           // Engine ready for commands
  | 'searching'       // Currently calculating a move
  | 'error';          // Initialization or runtime error

/** Configuration options for the chess engine */
export interface EngineOptions {
  /** Skill level 0-20 (0 = weakest, 20 = strongest) */
  skillLevel: number;
  /** Search timeout in milliseconds */
  timeoutMs: number;
  /** Number of threads (if supported) */
  threads?: number;
  /** Hash size in MB (if supported) */
  hashSize?: number;
}

/** Default engine options */
export const DEFAULT_ENGINE_OPTIONS: EngineOptions = {
  skillLevel: 20,
  timeoutMs: 1500,
  threads: 1,
  hashSize: 16,
};

/** UCI command types */
export type UCICommand = 
  | 'uci'
  | 'isready'
  | 'ucinewgame'
  | 'position'
  | 'go'
  | 'stop'
  | 'quit'
  | 'setoption';

/** UCI response types from the engine */
export type UCIResponse =
  | 'id'
  | 'uciok'
  | 'readyok'
  | 'bestmove'
  | 'info'
  | 'option';

/** Engine error details */
export interface EngineError {
  message: string;
  code?: string;
  timestamp: number;
}

/** Search parameters for move calculation */
export interface SearchParams {
  /** FEN string or "startpos" */
  fen: string;
  /** Previous moves in UCI format (for move history) */
  moves?: string[];
  /** Maximum time to search in milliseconds */
  movetime?: number;
  /** Search depth limit */
  depth?: number;
  /** Number of nodes to search */
  nodes?: number;
}

/** Result from a best move search */
export interface BestMoveResult {
  /** Best move in UCI format (e.g., "e2e4") */
  move: string;
  /** Optional ponder move */
  ponder?: string;
  /** Evaluation score (if available) */
  evaluation?: number;
  /** Depth reached */
  depth?: number;
}
