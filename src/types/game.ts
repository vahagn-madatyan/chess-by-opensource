/**
 * Game status enumeration
 */
export type GameStatus =
  | 'playing'      // Game is ongoing
  | 'check'        // Current player is in check
  | 'checkmate'    // Current player is checkmated (game over)
  | 'stalemate'    // Draw by stalemate
  | 'draw'         // Draw by other means (insufficient material, threefold repetition, 50-move rule)
  | 'resigned'     // Player resigned
  | 'draw-offered'; // Draw has been offered (transient state)

/**
 * Represents a single move in algebraic notation
 * Examples: 'e4', 'Nf3', 'O-O', 'exd5', 'e8=Q'
 */
export type MoveNotation = string;

/**
 * Represents a move from one square to another
 */
export interface Move {
  from: string;  // Square notation (e.g., 'e2')
  to: string;    // Square notation (e.g., 'e4')
  promotion?: 'q' | 'r' | 'b' | 'n';  // Optional promotion piece
}

/**
 * Complete move record with metadata
 */
export interface MoveHistory {
  move: Move;
  notation: MoveNotation;
  fen: string;           // FEN after the move
  captured?: string;     // Piece that was captured, if any
  san: string;           // Standard Algebraic Notation
  turn: 'w' | 'b';       // Which player made this move
}

/**
 * Complete game state object
 * Used throughout the application to represent the current state of a chess game
 */
export interface GameState {
  /** Current position in FEN notation */
  fen: string;

  /** Whose turn it is: 'w' for white, 'b' for black */
  turn: 'w' | 'b';

  /** Current game status */
  status: GameStatus;

  /** Whether the current player is in check */
  isCheck: boolean;

  /** Whether the game is over (checkmate or stalemate) */
  isCheckmate: boolean;

  /** Whether the game is a draw by stalemate */
  isStalemate: boolean;

  /** Whether the game is a draw by any means */
  isDraw: boolean;

  /** Whether the game is over */
  isGameOver: boolean;

  /** Full move number (starts at 1, increments after black's move) */
  moveNumber: number;

  /** Halfmove clock (for 50-move rule) */
  halfmoveClock: number;

  /** Complete move history */
  moveHistory: MoveHistory[];

  /** Legal moves for the current position (fromSquare -> toSquares[]) */
  legalMoves: Map<string, string[]>;
}

/**
 * Player information
 */
export interface Player {
  color: 'w' | 'b';
  name: string;
  isAI: boolean;
  elo?: number;
}

/**
 * Game configuration options
 */
export interface GameConfig {
  whitePlayer: Player;
  blackPlayer: Player;
  timeControl?: {
    initialMinutes: number;
    incrementSeconds: number;
  };
}
