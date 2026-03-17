import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChessGame } from '../useChessGame';
import { ChessService } from '../../services/ChessService';

// Mock console methods to keep test output clean
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

describe('useChessGame', () => {
  beforeEach(() => {
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  // ============================================================================
  // Initial State Tests
  // ============================================================================
  describe('initial state', () => {
    it('should initialize with standard starting position', () => {
      const { result } = renderHook(() => useChessGame());
      
      expect(result.current.gameState.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(result.current.gameState.turn).toBe('w');
      expect(result.current.selectedSquare).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should initialize with custom FEN', () => {
      const customFen = 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3';
      const { result } = renderHook(() => useChessGame({ initialFen: customFen }));
      
      expect(result.current.gameState.fen).toBe(customFen);
      expect(result.current.gameState.turn).toBe('w');
    });

    it('should have correct initial game status', () => {
      const { result } = renderHook(() => useChessGame());
      
      expect(result.current.gameState.status).toBe('playing');
      expect(result.current.gameState.isCheck).toBe(false);
      expect(result.current.gameState.isCheckmate).toBe(false);
      expect(result.current.gameState.isStalemate).toBe(false);
      expect(result.current.gameState.isDraw).toBe(false);
      expect(result.current.gameState.isGameOver).toBe(false);
    });

    it('should start with empty move history', () => {
      const { result } = renderHook(() => useChessGame());
      
      expect(result.current.gameState.moveHistory).toEqual([]);
    });

    it('should initialize with move number 1', () => {
      const { result } = renderHook(() => useChessGame());
      
      expect(result.current.gameState.moveNumber).toBe(1);
    });
  });

  // ============================================================================
  // Move Tests
  // ============================================================================
  describe('makeMove', () => {
    it('should execute a legal move', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e2', 'e4');
      });
      
      expect(result.current.gameState.moveHistory).toHaveLength(1);
      expect(result.current.gameState.moveHistory[0].notation).toBe('e4');
      expect(result.current.gameState.turn).toBe('b');
    });

    it('should update FEN after legal move', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e2', 'e4');
      });
      
      expect(result.current.gameState.fen).toContain('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR');
    });

    it('should reject illegal moves', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e2', 'e5'); // Can't move pawn 3 squares
      });
      
      expect(result.current.gameState.moveHistory).toHaveLength(0);
      expect(result.current.error).toBe('Illegal move: e2-e5');
    });

    it('should reject moves when not your turn', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e7', 'e5'); // Black tries to move first
      });
      
      expect(result.current.gameState.moveHistory).toHaveLength(0);
    });

    it('should handle multiple moves in sequence', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e2', 'e4'); // White: e4
      });
      
      act(() => {
        result.current.makeMove('e7', 'e5'); // Black: e5
      });
      
      act(() => {
        result.current.makeMove('g1', 'f3'); // White: Nf3
      });
      
      expect(result.current.gameState.moveHistory).toHaveLength(3);
      expect(result.current.gameState.moveHistory[0].notation).toBe('e4');
      expect(result.current.gameState.moveHistory[1].notation).toBe('e5');
      expect(result.current.gameState.moveHistory[2].notation).toBe('Nf3');
      expect(result.current.gameState.turn).toBe('b');
    });

    it('should handle pawn promotion', () => {
      // Set up a position where white can promote
      const promotionFen = '8/P7/8/8/8/8/8/4K2k w - - 0 1';
      const { result } = renderHook(() => useChessGame({ initialFen: promotionFen }));
      
      act(() => {
        result.current.makeMove('a7', 'a8', 'q');
      });
      
      expect(result.current.gameState.moveHistory).toHaveLength(1);
      // Promotion with check - notation includes '+''
      expect(result.current.gameState.moveHistory[0].notation).toBe('a8=Q+');
      expect(result.current.gameState.fen).toContain('Q');
    });

    it('should handle castling kingside', () => {
      const castlingFen = 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1';
      const { result } = renderHook(() => useChessGame({ initialFen: castlingFen }));
      
      act(() => {
        result.current.makeMove('e1', 'g1'); // White castles kingside
      });
      
      expect(result.current.gameState.moveHistory[0].notation).toBe('O-O');
    });

    it('should handle castling queenside', () => {
      const castlingFen = 'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1';
      const { result } = renderHook(() => useChessGame({ initialFen: castlingFen }));
      
      act(() => {
        result.current.makeMove('e1', 'c1'); // White castles queenside
      });
      
      expect(result.current.gameState.moveHistory[0].notation).toBe('O-O-O');
    });

    it('should log move execution', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e2', 'e4');
      });
      
      expect(console.log).toHaveBeenCalledWith('[useChessGame] Move executed: e4');
    });

    it('should clear error on successful move', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e2', 'e5'); // Illegal, sets error
      });
      
      expect(result.current.error).toBe('Illegal move: e2-e5');
      
      act(() => {
        result.current.makeMove('e2', 'e4'); // Legal, clears error
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  // ============================================================================
  // Selection Tests
  // ============================================================================
  describe('selection', () => {
    it('should select a square', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.selectSquare('e2');
      });
      
      expect(result.current.selectedSquare).toBe('e2');
    });

    it('should clear selection', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.selectSquare('e2');
      });
      
      expect(result.current.selectedSquare).toBe('e2');
      
      act(() => {
        result.current.clearSelection();
      });
      
      expect(result.current.selectedSquare).toBeNull();
    });

    it('should clear selection after legal move', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.selectSquare('e2');
      });
      
      act(() => {
        result.current.makeMove('e2', 'e4');
      });
      
      expect(result.current.selectedSquare).toBeNull();
    });

    it('should clear selection after illegal move', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.selectSquare('e2');
      });
      
      act(() => {
        result.current.makeMove('e2', 'e5');
      });
      
      expect(result.current.selectedSquare).toBeNull();
    });

    it('should clear error when selecting new square', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e2', 'e5'); // Sets error
      });
      
      expect(result.current.error).toBe('Illegal move: e2-e5');
      
      act(() => {
        result.current.selectSquare('e2');
      });
      
      expect(result.current.error).toBeNull();
    });
  });

  // ============================================================================
  // Game Over Tests
  // ============================================================================
  describe('game over detection', () => {
    it('should detect checkmate', () => {
      // Scholar's mate position
      const checkmateFen = 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4';
      const { result } = renderHook(() => useChessGame({ initialFen: checkmateFen }));
      
      expect(result.current.gameState.isCheckmate).toBe(true);
      expect(result.current.gameState.isGameOver).toBe(true);
      expect(result.current.gameState.status).toBe('checkmate');
    });

    it('should detect stalemate', () => {
      // Classic stalemate: black king in corner with white queen and king
      const stalemateFen = '7k/5Q2/6K1/8/8/8/8/8 b - - 0 1';
      const { result } = renderHook(() => useChessGame({ initialFen: stalemateFen }));
      
      expect(result.current.gameState.isStalemate).toBe(true);
      expect(result.current.gameState.isDraw).toBe(true);
      expect(result.current.gameState.isGameOver).toBe(true);
      expect(result.current.gameState.status).toBe('stalemate');
    });

    it('should detect check', () => {
      // Position where white is in check from black rook
      const checkFen = '4k3/8/8/8/8/8/4r3/4K3 w - - 0 1';
      const { result } = renderHook(() => useChessGame({ initialFen: checkFen }));
      
      expect(result.current.gameState.isCheck).toBe(true);
      expect(result.current.gameState.status).toBe('check');
    });

    it('should log checkmate', () => {
      // Start from a position where we can quickly deliver checkmate
      const { result } = renderHook(() => useChessGame());
      
      // Play a sequence that leads to checkmate (fool's mate pattern variant)
      act(() => {
        result.current.makeMove('f2', 'f3');
        result.current.makeMove('e7', 'e5');
        result.current.makeMove('g2', 'g4');
        result.current.makeMove('d8', 'h4'); // Checkmate
      });
      
      expect(console.log).toHaveBeenCalledWith('[useChessGame] Checkmate! White wins');
    });
  });

  // ============================================================================
  // Reset Tests
  // ============================================================================
  describe('resetGame', () => {
    it('should reset to starting position', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e2', 'e4');
        result.current.makeMove('e7', 'e5');
      });
      
      expect(result.current.gameState.moveHistory).toHaveLength(2);
      
      act(() => {
        result.current.resetGame();
      });
      
      expect(result.current.gameState.moveHistory).toHaveLength(0);
      expect(result.current.gameState.fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      expect(result.current.selectedSquare).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should log reset', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.resetGame();
      });
      
      expect(console.log).toHaveBeenCalledWith('[useChessGame] Game reset');
    });
  });

  // ============================================================================
  // Undo Tests
  // ============================================================================
  describe('undoMove', () => {
    it('should undo the last move', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e2', 'e4');
      });
      
      expect(result.current.gameState.moveHistory).toHaveLength(1);
      
      act(() => {
        result.current.undoMove();
      });
      
      expect(result.current.gameState.moveHistory).toHaveLength(0);
      expect(result.current.gameState.turn).toBe('w');
    });

    it('should return false when no moves to undo', () => {
      const { result } = renderHook(() => useChessGame());
      
      let undoResult: boolean = true;
      
      act(() => {
        undoResult = result.current.undoMove();
      });
      
      expect(undoResult).toBe(false);
      expect(result.current.error).toBe('No move to undo');
    });

    it('should log undo', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e2', 'e4');
      });
      
      act(() => {
        result.current.undoMove();
      });
      
      expect(console.log).toHaveBeenCalledWith('[useChessGame] Move undone: e2-e4');
    });
  });

  // ============================================================================
  // FEN Loading Tests
  // ============================================================================
  describe('loadFen', () => {
    it('should load valid FEN', () => {
      const { result } = renderHook(() => useChessGame());
      // Use a simple valid FEN - starting position with black to move
      const newFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1';
      
      let loadResult: boolean = false;
      
      act(() => {
        loadResult = result.current.loadFen(newFen);
      });
      
      expect(loadResult).toBe(true);
      expect(result.current.gameState.fen).toBe(newFen);
      expect(result.current.gameState.turn).toBe('b');
    });

    it('should reject invalid FEN', () => {
      const { result } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.loadFen('invalid fen');
      });
      
      expect(result.current.error).toBe('Invalid FEN: invalid fen');
    });

    it('should log FEN load', () => {
      const { result } = renderHook(() => useChessGame());
      const newFen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      
      act(() => {
        result.current.loadFen(newFen);
      });
      
      expect(console.log).toHaveBeenCalledWith('[useChessGame] FEN loaded');
    });
  });

  // ============================================================================
  // Helper Function Tests
  // ============================================================================
  describe('helper functions', () => {
    describe('isLegalMove', () => {
      it('should return true for legal moves', () => {
        const { result } = renderHook(() => useChessGame());
        
        expect(result.current.isLegalMove('e2', 'e4')).toBe(true);
        expect(result.current.isLegalMove('g1', 'f3')).toBe(true);
      });

      it('should return false for illegal moves', () => {
        const { result } = renderHook(() => useChessGame());
        
        expect(result.current.isLegalMove('e2', 'e5')).toBe(false);
        expect(result.current.isLegalMove('e1', 'e2')).toBe(false); // King can't move like that
      });
    });

    describe('getLegalMovesFrom', () => {
      it('should return legal destinations for a square', () => {
        const { result } = renderHook(() => useChessGame());
        
        const e2Moves = result.current.getLegalMovesFrom('e2');
        expect(e2Moves).toContain('e3');
        expect(e2Moves).toContain('e4');
      });

      it('should return empty array for squares with no legal moves', () => {
        const { result } = renderHook(() => useChessGame());
        
        expect(result.current.getLegalMovesFrom('e1')).toEqual([]);
      });

      it('should return empty array for empty squares', () => {
        const { result } = renderHook(() => useChessGame());
        
        expect(result.current.getLegalMovesFrom('e4')).toEqual([]);
      });
    });

    describe('getPieceAt', () => {
      it('should return piece at square', () => {
        const { result } = renderHook(() => useChessGame());
        
        const piece = result.current.getPieceAt('e2');
        expect(piece).toEqual({ type: 'pawn', color: 'w' });
      });

      it('should return null for empty square', () => {
        const { result } = renderHook(() => useChessGame());
        
        expect(result.current.getPieceAt('e4')).toBeNull();
      });

      it('should return correct piece types', () => {
        const { result } = renderHook(() => useChessGame());
        
        expect(result.current.getPieceAt('e1')).toEqual({ type: 'king', color: 'w' });
        expect(result.current.getPieceAt('d1')).toEqual({ type: 'queen', color: 'w' });
        expect(result.current.getPieceAt('b1')).toEqual({ type: 'knight', color: 'w' });
        expect(result.current.getPieceAt('c1')).toEqual({ type: 'bishop', color: 'w' });
        expect(result.current.getPieceAt('a1')).toEqual({ type: 'rook', color: 'w' });
      });
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================
  describe('integration', () => {
    it('should play a complete mini-game', () => {
      const { result } = renderHook(() => useChessGame());
      
      // White: e4
      act(() => {
        result.current.makeMove('e2', 'e4');
      });
      
      // Black: e5
      act(() => {
        result.current.makeMove('e7', 'e5');
      });
      
      // White: Nf3
      act(() => {
        result.current.makeMove('g1', 'f3');
      });
      
      // Black: Nc6
      act(() => {
        result.current.makeMove('b8', 'c6');
      });
      
      expect(result.current.gameState.moveHistory).toHaveLength(4);
      expect(result.current.gameState.moveNumber).toBe(3);
      expect(result.current.gameState.turn).toBe('w');
    });

    it('should maintain state across re-renders', () => {
      const { result, rerender } = renderHook(() => useChessGame());
      
      act(() => {
        result.current.makeMove('e2', 'e4');
      });
      
      rerender();
      
      expect(result.current.gameState.moveHistory).toHaveLength(1);
    });

    it('should expose legalMoves map in gameState', () => {
      const { result } = renderHook(() => useChessGame());
      
      expect(result.current.gameState.legalMoves instanceof Map).toBe(true);
      expect(result.current.gameState.legalMoves.get('e2')).toContain('e4');
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================
  describe('edge cases', () => {
    it('should handle en passant capture', () => {
      // Set up en passant position
      const enPassantFen = 'rnbqkbnr/ppppp1pp/8/4Pp2/8/8/PPPP1PPP/RNBQKBNR w KQkq f6 0 2';
      const { result } = renderHook(() => useChessGame({ initialFen: enPassantFen }));
      
      act(() => {
        result.current.makeMove('e5', 'f6'); // En passant capture
      });
      
      expect(result.current.gameState.moveHistory[0].notation).toBe('exf6');
    });

    it('should update move number correctly', () => {
      const { result } = renderHook(() => useChessGame());
      
      // Move number starts at 1
      expect(result.current.gameState.moveNumber).toBe(1);
      
      // After white's move, still 1
      act(() => {
        result.current.makeMove('e2', 'e4');
      });
      expect(result.current.gameState.moveNumber).toBe(1);
      
      // After black's move, increments to 2
      act(() => {
        result.current.makeMove('e7', 'e5');
      });
      expect(result.current.gameState.moveNumber).toBe(2);
    });

    it('should track halfmove clock', () => {
      const { result } = renderHook(() => useChessGame());
      
      // Pawn move resets halfmove clock
      act(() => {
        result.current.makeMove('e2', 'e4');
      });
      expect(result.current.gameState.halfmoveClock).toBe(0);
      
      // Knight move increments halfmove clock
      act(() => {
        result.current.makeMove('g8', 'f6');
      });
      expect(result.current.gameState.halfmoveClock).toBe(1);
    });
  });

  // ============================================================================
  // Engine Skill Tests
  // ============================================================================
  describe('setEngineSkill', () => {
    it('should call engine.setOptions with correct skill level', () => {
      const mockEngine = {
        setOptions: vi.fn(),
        isReady: vi.fn().mockReturnValue(true),
        getBestMove: vi.fn().mockResolvedValue('e2e4'),
      };
      
      const { result } = renderHook(() => useChessGame({ engine: mockEngine as any }));
      
      act(() => {
        result.current.setEngineSkill(15);
      });
      
      expect(mockEngine.setOptions).toHaveBeenCalledWith({ skillLevel: 15 });
      expect(console.log).toHaveBeenCalledWith('[useChessGame] Engine skill set to 15');
    });

    it('should clamp skill level to valid range', () => {
      const mockEngine = {
        setOptions: vi.fn(),
        isReady: vi.fn().mockReturnValue(true),
        getBestMove: vi.fn().mockResolvedValue('e2e4'),
      };
      
      const { result } = renderHook(() => useChessGame({ engine: mockEngine as any }));
      
      act(() => {
        result.current.setEngineSkill(-5); // Should clamp to 0
      });
      
      expect(mockEngine.setOptions).toHaveBeenCalledWith({ skillLevel: 0 });
      
      act(() => {
        result.current.setEngineSkill(25); // Should clamp to 20
      });
      
      expect(mockEngine.setOptions).toHaveBeenCalledWith({ skillLevel: 20 });
    });

    it('should handle null engine gracefully', () => {
      const { result } = renderHook(() => useChessGame({ engine: null }));
      
      // Should not throw an error
      expect(() => {
        act(() => {
          result.current.setEngineSkill(10);
        });
      }).not.toThrow();
      
      expect(console.log).toHaveBeenCalledWith('[useChessGame] Engine skill set to 10');
    });
  });
});