import { Chess, type Move as ChessJsMove, type Square, DEFAULT_POSITION } from 'chess.js';
import type { GameState, GameStatus, Move, MoveHistory } from '../types/game';

/**
 * ChessService wraps the chess.js Chess class to provide a clean,
 * type-safe API for move validation, FEN management, and game status queries.
 */
export class ChessService {
  private chess: Chess;

  constructor(fen: string = DEFAULT_POSITION) {
    this.chess = new Chess(fen);
  }

  /**
   * Load a game from a FEN string
   */
  load(fen: string): boolean {
    try {
      this.chess.load(fen);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Reset the game to the starting position
   */
  reset(): void {
    this.chess.reset();
  }

  /**
   * Make a move on the board
   * @param from - Starting square (e.g., 'e2')
   * @param to - Target square (e.g., 'e4')
   * @param promotion - Optional promotion piece ('q', 'r', 'b', 'n')
   * @returns The Move object if successful, null if illegal
   */
  makeMove(from: string, to: string, promotion?: 'q' | 'r' | 'b' | 'n'): Move | null {
    try {
      const move = this.chess.move({
        from: from as Square,
        to: to as Square,
        promotion,
      });

      if (!move) {
        return null;
      }

      return {
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      };
    } catch {
      return null;
    }
  }

  /**
   * Make a move using Standard Algebraic Notation (SAN)
   * @param notation - SAN notation (e.g., 'e4', 'Nf3', 'O-O', 'exd5')
   * @returns The Move object if successful, null if illegal
   */
  makeMoveSan(notation: string): Move | null {
    try {
      const move = this.chess.move(notation);

      if (!move) {
        return null;
      }

      return {
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      };
    } catch {
      return null;
    }
  }

  /**
   * Undo the last move
   * @returns The undone Move object, or null if no moves to undo
   */
  undo(): Move | null {
    const move = this.chess.undo();
    if (!move) {
      return null;
    }

    return {
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    };
  }

  /**
   * Get all legal moves for the current position
   * @returns Array of Move objects with full details
   */
  getLegalMoves(): Move[] {
    const moves = this.chess.moves({ verbose: true });
    return moves.map((move: ChessJsMove) => ({
      from: move.from,
      to: move.to,
      promotion: move.promotion,
    }));
  }

  /**
   * Get all legal destination squares for a specific source square
   * @param square - The source square (e.g., 'e2')
   * @returns Array of destination squares
   */
  getLegalMovesFrom(square: string): string[] {
    try {
      const moves = this.chess.moves({ square: square as Square, verbose: true });
      return moves.map((move: ChessJsMove) => move.to);
    } catch {
      return [];
    }
  }

  /**
   * Check if a move is legal
   * @param from - Starting square
   * @param to - Target square
   * @returns boolean indicating if the move is legal
   */
  isLegalMove(from: string, to: string): boolean {
    const legalDestinations = this.getLegalMovesFrom(from);
    return legalDestinations.includes(to);
  }

  /**
   * Get the current FEN string
   */
  getFen(): string {
    return this.chess.fen();
  }

  /**
   * Get whose turn it is
   * @returns 'w' for white, 'b' for black
   */
  getTurn(): 'w' | 'b' {
    return this.chess.turn();
  }

  /**
   * Check if the current player is in check
   */
  isCheck(): boolean {
    return this.chess.isCheck();
  }

  /**
   * Check if the current player is checkmated
   */
  isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  /**
   * Check if the game is a stalemate
   */
  isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  /**
   * Check if the game is a draw by any means
   */
  isDraw(): boolean {
    return this.chess.isDraw();
  }

  /**
   * Check if the game is over
   */
  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  /**
   * Get the full move number
   */
  getMoveNumber(): number {
    return this.chess.moveNumber();
  }

  /**
   * Get the halfmove clock (for 50-move rule)
   * Parsed from FEN since chess.js v1.0.0 doesn't expose this directly
   */
  getHalfmoveClock(): number {
    const fen = this.chess.fen();
    const parts = fen.split(' ');
    return parseInt(parts[4] || '0', 10);
  }

  /**
   * Get the complete move history
   */
  getMoveHistory(): MoveHistory[] {
    const moves = this.chess.history({ verbose: true });
    return moves.map((move: ChessJsMove, index: number) => ({
      move: {
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      },
      notation: move.san,
      fen: move.after,
      captured: move.captured,
      san: move.san,
      turn: index % 2 === 0 ? 'w' : 'b',
    }));
  }

  /**
   * Get the complete game state
   */
  getGameState(): GameState {
    const legalMoves = this.getLegalMoves();
    const legalMovesMap = new Map<string, string[]>();

    // Group moves by source square
    for (const move of legalMoves) {
      const destinations = legalMovesMap.get(move.from) || [];
      destinations.push(move.to);
      legalMovesMap.set(move.from, destinations);
    }

    let status: GameStatus;
    if (this.isCheckmate()) {
      status = 'checkmate';
    } else if (this.isStalemate()) {
      status = 'stalemate';
    } else if (this.isDraw()) {
      status = 'draw';
    } else if (this.isCheck()) {
      status = 'check';
    } else {
      status = 'playing';
    }

    return {
      fen: this.getFen(),
      turn: this.getTurn(),
      status,
      isCheck: this.isCheck(),
      isCheckmate: this.isCheckmate(),
      isStalemate: this.isStalemate(),
      isDraw: this.isDraw(),
      isGameOver: this.isGameOver(),
      moveNumber: this.getMoveNumber(),
      halfmoveClock: this.getHalfmoveClock(),
      moveHistory: this.getMoveHistory(),
      legalMoves: legalMovesMap,
    };
  }

  /**
   * Get a human-readable ASCII representation of the board
   */
  ascii(): string {
    return this.chess.ascii();
  }

  /**
   * Check if there is insufficient material for checkmate
   */
  isInsufficientMaterial(): boolean {
    return this.chess.isInsufficientMaterial();
  }

  /**
   * Check for threefold repetition
   */
  isThreefoldRepetition(): boolean {
    return this.chess.isThreefoldRepetition();
  }

  /**
   * Check for draw by 50-move rule
   */
  isDrawByFiftyMoves(): boolean {
    return this.chess.isDrawByFiftyMoves();
  }
}
