import { describe, it, expect, beforeEach } from 'vitest';
import { ChessService } from '../ChessService';

describe('ChessService', () => {
  let game: ChessService;

  beforeEach(() => {
    game = new ChessService();
  });

  describe('initialization', () => {
    it('should start with default position', () => {
      expect(game.getFen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });

    it('should start with white to move', () => {
      expect(game.getTurn()).toBe('w');
    });

    it('should not be in check at start', () => {
      expect(game.isCheck()).toBe(false);
    });

    it('should not be game over at start', () => {
      expect(game.isGameOver()).toBe(false);
      expect(game.isCheckmate()).toBe(false);
      expect(game.isStalemate()).toBe(false);
    });

    it('should load from custom FEN', () => {
      const customFen = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
      game.load(customFen);
      expect(game.getFen()).toBe(customFen);
    });

    it('should return false when loading invalid FEN', () => {
      const result = game.load('invalid fen');
      expect(result).toBe(false);
    });

    it('should reset to starting position', () => {
      game.makeMove('e2', 'e4');
      game.reset();
      expect(game.getFen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });
  });

  describe('legal moves', () => {
    it('should return all legal moves from starting position', () => {
      const moves = game.getLegalMoves();
      expect(moves.length).toBe(20); // 16 pawn moves + 4 knight moves
    });

    it('should return legal destinations for a specific square', () => {
      const e2Moves = game.getLegalMovesFrom('e2');
      expect(e2Moves).toContain('e3');
      expect(e2Moves).toContain('e4');
    });

    it('should return empty array for square with no legal moves', () => {
      const a1Moves = game.getLegalMovesFrom('a1');
      expect(a1Moves).toEqual([]);
    });

    it('should validate if a move is legal', () => {
      expect(game.isLegalMove('e2', 'e4')).toBe(true);
      expect(game.isLegalMove('e2', 'e5')).toBe(false);
    });
  });

  describe('making moves', () => {
    it('should make a legal pawn move', () => {
      const move = game.makeMove('e2', 'e4');
      expect(move).not.toBeNull();
      expect(move?.from).toBe('e2');
      expect(move?.to).toBe('e4');
    });

    it('should reject an illegal move', () => {
      const move = game.makeMove('e2', 'e5');
      expect(move).toBeNull();
    });

    it('should reject moving opponent piece', () => {
      const move = game.makeMove('e7', 'e5');
      expect(move).toBeNull();
    });

    it('should alternate turns after a move', () => {
      expect(game.getTurn()).toBe('w');
      game.makeMove('e2', 'e4');
      expect(game.getTurn()).toBe('b');
      game.makeMove('e7', 'e5');
      expect(game.getTurn()).toBe('w');
    });

    it('should update FEN after a move', () => {
      game.makeMove('e2', 'e4');
      expect(game.getFen()).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
    });

    it('should make a move using SAN notation', () => {
      const move = game.makeMoveSan('e4');
      expect(move).not.toBeNull();
      expect(game.getFen()).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
    });

    it('should reject illegal SAN move', () => {
      const move = game.makeMoveSan('e5');
      expect(move).toBeNull();
    });

    it('should handle knight moves', () => {
      const move = game.makeMove('g1', 'f3');
      expect(move).not.toBeNull();
      expect(game.getFen()).toBe('rnbqkbnr/pppppppp/8/8/8/5N2/PPPPPPPP/RNBQKB1R b KQkq - 1 1');
    });

    it('should handle castling kingside', () => {
      // Setup for kingside castle: clear path between king and h1 rook
      game.makeMove('e2', 'e4');
      game.makeMove('e7', 'e5');
      game.makeMove('g1', 'f3');
      game.makeMove('b8', 'c6');
      game.makeMove('f1', 'c4');
      game.makeMove('d7', 'd6');
      
      const castle = game.makeMove('e1', 'g1');
      expect(castle).not.toBeNull();
      // After O-O, king should be on g1 (verify via FEN - king is 'K')
      const fen = game.getFen();
      expect(fen).toContain('RNBQ1RK1'); // King on g1, rook on f1
    });
  });

  describe('promotion', () => {
    it('should handle pawn promotion to queen', () => {
      const promotionFen = '8/P7/8/8/8/8/8/k6K w - - 0 1';
      game.load(promotionFen);
      const move = game.makeMove('a7', 'a8', 'q');
      expect(move).not.toBeNull();
      expect(move?.promotion).toBe('q');
    });

    it('should handle pawn promotion to knight', () => {
      const promotionFen = '8/P7/8/8/8/8/8/k6K w - - 0 1';
      game.load(promotionFen);
      const move = game.makeMove('a7', 'a8', 'n');
      expect(move).not.toBeNull();
      expect(move?.promotion).toBe('n');
    });
  });

  describe('captures', () => {
    it('should handle piece capture', () => {
      game.makeMove('e2', 'e4');
      game.makeMove('d7', 'd5');
      const capture = game.makeMove('e4', 'd5');
      expect(capture).not.toBeNull();
    });

    it('should handle en passant capture', () => {
      game.makeMove('e2', 'e4');
      game.makeMove('a7', 'a6');
      game.makeMove('e4', 'e5');
      game.makeMove('d7', 'd5');
      // Now white can capture en passant
      const enPassant = game.makeMove('e5', 'd6');
      expect(enPassant).not.toBeNull();
    });
  });

  describe('undo', () => {
    it('should undo the last move', () => {
      const initialFen = game.getFen();
      game.makeMove('e2', 'e4');
      const undone = game.undo();
      expect(undone).not.toBeNull();
      expect(game.getFen()).toBe(initialFen);
    });

    it('should return null when no moves to undo', () => {
      const undone = game.undo();
      expect(undone).toBeNull();
    });
  });

  describe('move history', () => {
    it('should track move history', () => {
      game.makeMove('e2', 'e4');
      game.makeMove('e7', 'e5');
      
      const history = game.getMoveHistory();
      expect(history.length).toBe(2);
      expect(history[0].san).toBe('e4');
      expect(history[1].san).toBe('e5');
    });

    it('should track FEN after each move', () => {
      game.makeMove('e2', 'e4');
      const history = game.getMoveHistory();
      expect(history[0].fen).toContain('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR');
    });

    it('should track whose turn made the move', () => {
      game.makeMove('e2', 'e4');
      game.makeMove('e7', 'e5');
      
      const history = game.getMoveHistory();
      expect(history[0].turn).toBe('w');
      expect(history[1].turn).toBe('b');
    });
  });

  describe('game state', () => {
    it('should return complete game state', () => {
      const state = game.getGameState();
      expect(state.fen).toBeDefined();
      expect(state.turn).toBe('w');
      expect(state.status).toBe('playing');
      expect(state.isCheck).toBe(false);
      expect(state.isCheckmate).toBe(false);
      expect(state.isStalemate).toBe(false);
      expect(state.legalMoves).toBeInstanceOf(Map);
    });

    it('should track move number', () => {
      expect(game.getMoveNumber()).toBe(1);
      game.makeMove('e2', 'e4');
      expect(game.getMoveNumber()).toBe(1); // Still 1, white's first move
      game.makeMove('e7', 'e5');
      expect(game.getMoveNumber()).toBe(2); // Now 2 after black's move
    });

    it('should track halfmove clock', () => {
      expect(game.getHalfmoveClock()).toBe(0);
      game.makeMove('e2', 'e4');
      expect(game.getHalfmoveClock()).toBe(0); // Pawn move resets clock
      game.makeMove('g8', 'f6');
      expect(game.getHalfmoveClock()).toBe(1); // Non-pawn, non-capture
    });
  });

  describe('check', () => {
    it('should detect when in check', () => {
      // Setup a simple check position: white queen checks black king
      // 4k3/4Q3/8/8/8/8/8/4K3 b - - 0 1
      // Black king on e8, white queen on e7, white king on e1
      game.load('4k3/4Q3/8/8/8/8/8/4K3 b - - 0 1');

      expect(game.isCheck()).toBe(true);
      expect(game.getGameState().status).toBe('check');
    });
  });

  describe('checkmate', () => {
    it('should detect checkmate (fools mate)', () => {
      game.makeMove('f2', 'f3');
      game.makeMove('e7', 'e5');
      game.makeMove('g2', 'g4');
      game.makeMove('d8', 'h4');
      
      expect(game.isCheckmate()).toBe(true);
      expect(game.isGameOver()).toBe(true);
      expect(game.getGameState().status).toBe('checkmate');
    });

    it('should detect checkmate (scholars mate)', () => {
      game.makeMove('e2', 'e4');
      game.makeMove('e7', 'e5');
      game.makeMove('d1', 'h5');
      game.makeMove('b8', 'c6');
      game.makeMove('f1', 'c4');
      game.makeMove('g8', 'f6');
      game.makeMove('h5', 'f7');
      
      expect(game.isCheckmate()).toBe(true);
      expect(game.getGameState().status).toBe('checkmate');
    });
  });

  describe('stalemate', () => {
    it('should detect stalemate', () => {
      // Black king trapped in corner: on a8 with rook on b7 (protected by king on a6)
      // King can't go to a7 (rook controls), can't go to b8 (rook controls)
      // Can't capture rook on b7 (protected by king on a6)
      // Not in check because rook on b7 doesn't attack a8
      const stalemateFen = 'k7/1R6/K7/8/8/8/8/8 b - - 0 1';
      game.load(stalemateFen);

      expect(game.isStalemate()).toBe(true);
      expect(game.isGameOver()).toBe(true);
      expect(game.isCheck()).toBe(false);
      expect(game.getGameState().status).toBe('stalemate');
    });
  });

  describe('draw', () => {
    it('should detect insufficient material', () => {
      const insufficientFen = '8/8/8/8/8/8/8/4k2K w - - 0 1';
      game.load(insufficientFen);
      
      expect(game.isInsufficientMaterial()).toBe(true);
      expect(game.isDraw()).toBe(true);
      expect(game.isGameOver()).toBe(true);
    });

    it('should detect king vs king + knight is insufficient', () => {
      const insufficientFen = '8/8/8/8/8/8/8/4k1NK w - - 0 1';
      game.load(insufficientFen);
      
      expect(game.isInsufficientMaterial()).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should return null for invalid square', () => {
      const move = game.makeMove('invalid', 'e4');
      expect(move).toBeNull();
    });

    it('should return empty array for invalid square in getLegalMovesFrom', () => {
      const moves = game.getLegalMovesFrom('invalid');
      expect(moves).toEqual([]);
    });

    it('should not crash on edge cases', () => {
      expect(() => game.isLegalMove('a1', 'h8')).not.toThrow();
      expect(() => game.getLegalMovesFrom('z9')).not.toThrow();
    });
  });
});
