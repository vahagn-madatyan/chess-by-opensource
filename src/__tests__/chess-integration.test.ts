import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChessService } from '../services/ChessService';
import { ChessEngine } from '../engine/ChessEngine';

// Mock Worker for jsdom environment
class MockStockfishWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;
  private responses: Map<string, string[]> = new Map();

  constructor() {
    this.responses.set('uci', ['id name Stockfish', 'id author T. Romstad, M. Costalba, et al.', 'uciok']);
    this.responses.set('isready', ['readyok']);
    this.responses.set('ucinewgame', []);
    this.responses.set('setoption', []);
    this.responses.set('position', []);
  }

  postMessage(message: string): void {
    const command = message.split(' ')[0];
    setTimeout(() => {
      if (command === 'go') {
        setTimeout(() => {
          const mockMoves = ['e7e5', 'g8f6', 'b8c6', 'd7d5', 'e7e6', 'c7c5', 'g7g6'];
          const bestMove = mockMoves[Math.floor(Math.random() * mockMoves.length)];
          this.sendResponse(`bestmove ${bestMove} ponder e2e4`);
        }, 50);
      } else {
        const responses = this.responses.get(command) || [];
        for (const response of responses) {
          this.sendResponse(response);
        }
      }
    }, 10);
  }

  private sendResponse(data: string): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }));
    }
  }

  terminate(): void {}
}

describe('Chess Integration Tests', () => {
  let game: ChessService;
  let engine: ChessEngine;
  let originalWorker: typeof Worker;

  beforeEach(() => {
    game = new ChessService();
    originalWorker = global.Worker;
    global.Worker = MockStockfishWorker as unknown as typeof Worker;
    engine = new ChessEngine();
    console.log = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    engine.terminate();
    global.Worker = originalWorker;
    vi.restoreAllMocks();
  });

  describe('complete game flow', () => {
    it('should play from start to multiple moves', async () => {
      await engine.init();
      
      const move1 = game.makeMove('e2', 'e4');
      expect(move1).not.toBeNull();
      expect(game.getTurn()).toBe('b');
      expect(game.getMoveHistory()).toHaveLength(1);

      const fen1 = game.getFen();
      const aiMove1 = await engine.getBestMove(fen1, 10, 1000);
      expect(aiMove1).toMatch(/^[a-h][1-8][a-h][1-8]$/);
      
      const from1 = aiMove1.slice(0, 2);
      const to1 = aiMove1.slice(2, 4);
      expect(game.makeMove(from1, to1)).not.toBeNull();
      expect(game.getTurn()).toBe('w');

      const move2 = game.makeMove('g1', 'f3');
      expect(move2).not.toBeNull();
      expect(game.getMoveHistory()).toHaveLength(3);
      expect(game.isGameOver()).toBe(false);
    });

    it('should play near-endgame scenario', () => {
      const endgameFen = 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4';
      game.load(endgameFen);
      
      expect(game.isCheckmate()).toBe(true);
      expect(game.isGameOver()).toBe(true);
      expect(game.getGameState().status).toBe('checkmate');
    });
  });

  describe('castling', () => {
    it('should execute kingside castling for white', () => {
      game.makeMove('e2', 'e4');
      game.makeMove('e7', 'e5');
      game.makeMove('g1', 'f3');
      game.makeMove('d7', 'd6');
      game.makeMove('f1', 'c4');
      game.makeMove('c7', 'c6');
      
      expect(game.isLegalMove('e1', 'g1')).toBe(true);
      
      const castleMove = game.makeMove('e1', 'g1');
      expect(castleMove).not.toBeNull();
      
      // Verify via move history SAN notation
      const history = game.getMoveHistory();
      expect(history[history.length - 1].notation).toBe('O-O');
      
      // Verify king and rook moved correctly via FEN
      const fen = game.getFen();
      expect(fen).toContain('RNBQ1RK1');
    });

    it('should execute queenside castling for white', () => {
      game.makeMove('d2', 'd4');
      game.makeMove('e7', 'e5');
      game.makeMove('c1', 'f4');
      game.makeMove('d7', 'd6');
      game.makeMove('b1', 'c3');
      game.makeMove('g8', 'f6');
      game.makeMove('d1', 'd2');
      game.makeMove('c7', 'c6');
      
      const castleMove = game.makeMove('e1', 'c1');
      expect(castleMove).not.toBeNull();
      
      const history = game.getMoveHistory();
      expect(history[history.length - 1].notation).toBe('O-O-O');
    });

    it('should reject castling when king is in check', () => {
      game.load('4k3/8/8/8/8/8/4r3/4K3 w - - 0 1');
      
      expect(game.isCheck()).toBe(true);
      expect(game.isLegalMove('e1', 'g1')).toBe(false);
      expect(game.isLegalMove('e1', 'c1')).toBe(false);
    });

    it('should reject castling when path is blocked', () => {
      expect(game.isLegalMove('e1', 'g1')).toBe(false);
      expect(game.isLegalMove('e1', 'c1')).toBe(false);
    });
  });

  describe('en passant capture', () => {
    it('should execute en passant capture by white', () => {
      game.makeMove('e2', 'e4');
      game.makeMove('a7', 'a6');
      game.makeMove('e4', 'e5');
      game.makeMove('d7', 'd5');
      
      expect(game.isLegalMove('e5', 'd6')).toBe(true);
      
      const capture = game.makeMove('e5', 'd6');
      expect(capture).not.toBeNull();
      
      const history = game.getMoveHistory();
      expect(history[history.length - 1].notation).toBe('exd6');
    });

    it('should execute en passant capture by black', () => {
      game.makeMove('d2', 'd4');
      game.makeMove('e7', 'e5');
      game.makeMove('d4', 'd5');
      game.makeMove('c7', 'c5');
      
      expect(game.isLegalMove('d5', 'c6')).toBe(true);
      
      const capture = game.makeMove('d5', 'c6');
      expect(capture).not.toBeNull();
      
      const history = game.getMoveHistory();
      expect(history[history.length - 1].notation).toBe('dxc6');
    });

    it('should only allow en passant immediately after double pawn push', () => {
      game.makeMove('e2', 'e4');
      game.makeMove('d7', 'd5');
      game.makeMove('a2', 'a3');
      
      expect(game.isLegalMove('e4', 'd5')).toBe(false);
    });
  });

  describe('pawn promotion', () => {
    it('should promote white pawn to queen', () => {
      game.load('8/P7/8/8/8/8/8/4K2k w - - 0 1');
      
      const move = game.makeMove('a7', 'a8', 'q');
      expect(move).not.toBeNull();
      expect(move?.promotion).toBe('q');
      expect(game.getFen()).toContain('Q7');
      
      const history = game.getMoveHistory();
      expect(history[0].notation).toContain('=');
    });

    it('should promote black pawn to queen', () => {
      game.load('4k2K/8/8/8/8/8/p7/8 b - - 0 1');
      
      const move = game.makeMove('a2', 'a1', 'q');
      expect(move).not.toBeNull();
      expect(move?.promotion).toBe('q');
    });

    it('should allow promotion with capture', () => {
      // White pawn on a7 can capture black bishop on b8 and promote
      game.load('1b6/P7/8/8/8/8/8/4K2k w - - 0 1');
      
      const move = game.makeMove('a7', 'b8', 'q');
      expect(move).not.toBeNull();
      
      const history = game.getMoveHistory();
      const notation = history[0].notation;
      expect(notation).toContain('x');
      expect(notation).toContain('=');
    });
  });

  describe('illegal move rejection', () => {
    it('should reject moving piece to invalid square', () => {
      const initialFen = game.getFen();
      
      const move = game.makeMove('e2', 'e5');
      expect(move).toBeNull();
      expect(game.getFen()).toBe(initialFen);
      expect(game.getMoveHistory()).toHaveLength(0);
    });

    it('should reject moving into check', () => {
      // Simpler test: verify illegal moves are rejected
      // White king on e1, black rook on e8 attacks the entire e-file
      const testGame = new ChessService();
      testGame.load('4r3/8/8/8/8/8/8/4K2k w - - 0 1');
      
      // King CANNOT move to e2 (attacked by rook on e8)
      expect(testGame.isLegalMove('e1', 'e2')).toBe(false);
      expect(testGame.makeMove('e1', 'e2')).toBeNull();
      
      // But CAN move off the e-file
      expect(testGame.isLegalMove('e1', 'd1')).toBe(true);
      expect(testGame.isLegalMove('e1', 'f1')).toBe(true);
    });

    it('should reject moving when not your turn', () => {
      const initialFen = game.getFen();
      
      expect(game.makeMove('e7', 'e5')).toBeNull();
      expect(game.getFen()).toBe(initialFen);
      expect(game.getTurn()).toBe('w');
    });

    it('should reject capturing own piece', () => {
      expect(game.isLegalMove('e2', 'd3')).toBe(false);
      expect(game.makeMove('e2', 'd3')).toBeNull();
    });

    it('should reject invalid square notation', () => {
      expect(game.makeMove('e2', 'z9')).toBeNull();
    });

    it('should reject moving from empty square', () => {
      expect(game.makeMove('e4', 'e5')).toBeNull();
    });

    it('should reject castling through check', () => {
      // Set up a position where queenside castling would pass through check
      // The key is: king moves e1->d1->c1 for queenside castle
      // If d1 is under attack, castling should be illegal
      const game = new ChessService();
      
      // Start from a position where castling is possible
      // White king e1, rooks a1/h1, no pieces between king and rooks
      // Black queen on d4 attacks d1 vertically
      game.load('r3k2r/pppppppp/8/8/3q4/8/8/R3K2R w KQkq - 0 1');
      
      // Verify queen attacks d1 (between king and queenside rook)
      // For castling, king passes through d1, which is attacked
      expect(game.isLegalMove('e1', 'c1')).toBe(false);
      
      // Kingside should also fail because queen attacks f1
      // (king passes through f1 for kingside castle: e1->f1->g1)
      expect(game.isLegalMove('e1', 'g1')).toBe(false);
    });
  });

  describe('AI response timing', () => {
    it('should respond within 2000ms at skill 10', async () => {
      await engine.init();
      
      const startTime = Date.now();
      const move = await engine.getBestMove('startpos', 10, 2000);
      const elapsed = Date.now() - startTime;
      
      expect(move).toMatch(/^[a-h][1-8][a-h][1-8]$/);
      expect(elapsed).toBeLessThan(2000);
    }, 3000);

    it('should return valid move at various positions', async () => {
      await engine.init();
      
      const positions = [
        'startpos',
        'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
      ];
      
      for (const fen of positions) {
        const move = await engine.getBestMove(fen, 10, 1000);
        expect(move).toMatch(/^[a-h][1-8][a-h][1-8]$/);
      }
    }, 10000);
  });

  describe('game over detection', () => {
    it('should detect checkmate', () => {
      game.makeMove('e2', 'e4');
      game.makeMove('e7', 'e5');
      game.makeMove('d1', 'h5');
      game.makeMove('b8', 'c6');
      game.makeMove('f1', 'c4');
      game.makeMove('g8', 'f6');
      game.makeMove('h5', 'f7');
      
      expect(game.isCheckmate()).toBe(true);
      expect(game.isGameOver()).toBe(true);
      expect(game.getGameState().status).toBe('checkmate');
    });

    it('should detect stalemate', () => {
      game.load('k7/1R6/K7/8/8/8/8/8 b - - 0 1');
      
      expect(game.isStalemate()).toBe(true);
      expect(game.isGameOver()).toBe(true);
      expect(game.getGameState().status).toBe('stalemate');
    });

    it('should detect draw by insufficient material', () => {
      game.load('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
      
      expect(game.isInsufficientMaterial()).toBe(true);
      expect(game.isDraw()).toBe(true);
      expect(game.isGameOver()).toBe(true);
    });

    it('should not allow moves after checkmate', () => {
      game.load('r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4');
      
      expect(game.isGameOver()).toBe(true);
      expect(game.makeMove('e8', 'd7')).toBeNull();
    });
  });
});
