import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChessEngine, getChessEngine, disposeChessEngine } from '../ChessEngine';

// Mock Worker for jsdom environment
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;
  private messageHandler: ((e: MessageEvent) => void) | null = null;
  private responses: Map<string, string[]> = new Map();

  constructor() {
    // Default UCI responses
    this.responses.set('uci', ['id name Stockfish', 'id author T. Romstad, M. Costalba, et al.', 'uciok']);
    this.responses.set('isready', ['readyok']);
    this.responses.set('ucinewgame', []);
    this.responses.set('setoption', []);
    this.responses.set('position', []);
  }

  postMessage(message: string): void {
    const command = message.split(' ')[0];
    
    // Simulate async response
    setTimeout(() => {
      if (command === 'go') {
        // Simulate search delay and return bestmove
        setTimeout(() => {
          this.sendResponse('bestmove e7e5 ponder e2e4');
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

  terminate(): void {
    // Cleanup
  }

  // Test helper: add custom responses
  addResponse(command: string, responses: string[]): void {
    this.responses.set(command, responses);
  }

  // Test helper: simulate error
  simulateError(): void {
    if (this.onerror) {
      this.onerror(new ErrorEvent('error', { message: 'Worker error' }));
    }
  }
}

// Replace global Worker with mock
global.Worker = MockWorker as unknown as typeof Worker;

describe('ChessEngine', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    disposeChessEngine();
    engine = new ChessEngine();
  });

  afterEach(() => {
    engine.terminate();
    disposeChessEngine();
  });

  describe('Initialization', () => {
    it('should start in uninitialized state', () => {
      expect(engine.isReady()).toBe(false);
      expect(engine.getStatus()).toBe('uninitialized');
    });

    it('should initialize successfully', async () => {
      await engine.init();
      expect(engine.isReady()).toBe(true);
      expect(engine.getStatus()).toBe('ready');
    });

    it('should handle multiple init calls gracefully', async () => {
      await engine.init();
      const secondInit = engine.init();
      await expect(secondInit).resolves.not.toThrow();
      expect(engine.isReady()).toBe(true);
    });

    it('should not re-initialize if already ready', async () => {
      await engine.init();
      expect(engine.isReady()).toBe(true);
      
      // Second init should return immediately
      await engine.init();
      expect(engine.isReady()).toBe(true);
    });

    it('should expose isReady() for status checking', async () => {
      expect(engine.isReady()).toBe(false);
      await engine.init();
      expect(engine.isReady()).toBe(true);
    });

    it('should track last error on failure', async () => {
      // Create engine with failing worker
      const failingEngine = new ChessEngine();
      
      // Override Worker to simulate error
      const FailingWorker = class extends MockWorker {
        postMessage(): void {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new ErrorEvent('error', { message: 'Test error' }));
            }
          }, 10);
        }
      };
      
      const originalWorker = global.Worker;
      global.Worker = FailingWorker as unknown as typeof Worker;
      
      await expect(failingEngine.init()).rejects.toThrow();
      expect(failingEngine.getLastError()).not.toBeNull();
      expect(failingEngine.getLastError()?.code).toBe('WORKER_ERROR');
      
      global.Worker = originalWorker;
    });
  });

  describe('UCI Protocol', () => {
    it('should send uci command on init', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await engine.init();
      
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] > uci');
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] < uciok');
      
      consoleSpy.mockRestore();
    });

    it('should send isready and wait for readyok', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await engine.init();
      
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] > isready');
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] < readyok');
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] Engine ready');
      
      consoleSpy.mockRestore();
    });
  });

  describe('getBestMove', () => {
    beforeEach(async () => {
      await engine.init();
    });

    it('should return a valid UCI move string', async () => {
      const move = await engine.getBestMove('startpos');
      expect(move).toMatch(/^[a-h][1-8][a-h][1-8][qrbn]?$/);
    });

    it('should accept custom skill level', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await engine.getBestMove('startpos', 10);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('skill=10'));
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] > setoption name Skill Level value 10');
      
      consoleSpy.mockRestore();
    });

    it('should accept custom timeout', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await engine.getBestMove('startpos', 20, 500);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('timeout=500'));
      
      consoleSpy.mockRestore();
    });

    it('should send position command with FEN', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1';
      
      await engine.getBestMove(fen);
      
      expect(consoleSpy).toHaveBeenCalledWith(`[ChessEngine] > position fen ${fen}`);
      
      consoleSpy.mockRestore();
    });

    it('should send go command with movetime', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await engine.getBestMove('startpos', 20, 1000);
      
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] > go movetime 900');
      
      consoleSpy.mockRestore();
    });

    it('should throw if engine not initialized', async () => {
      const newEngine = new ChessEngine();
      await expect(newEngine.getBestMove('startpos')).rejects.toThrow('Engine not ready');
    });

    it('should handle bestmove response correctly', async () => {
      const move = await engine.getBestMove('startpos');
      expect(move).toBe('e7e5'); // Our mock returns e7e5
    });

    it('should set status to searching during search', async () => {
      engine.getBestMove('startpos').then(() => {});
      expect(engine.getStatus()).toBe('searching');
    });

    it('should return to ready state after search', async () => {
      await engine.getBestMove('startpos');
      expect(engine.getStatus()).toBe('ready');
    });
  });

  describe('Skill Level Configuration', () => {
    beforeEach(async () => {
      await engine.init();
    });

    it('should set skill level via setOptions', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      engine.setOptions({ skillLevel: 5 });
      
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] > setoption name Skill Level value 5');
      expect(engine.getOptions().skillLevel).toBe(5);
      
      consoleSpy.mockRestore();
    });

    it('should accept skill level 0-20', () => {
      engine.setOptions({ skillLevel: 0 });
      expect(engine.getOptions().skillLevel).toBe(0);

      engine.setOptions({ skillLevel: 20 });
      expect(engine.getOptions().skillLevel).toBe(20);
    });

    it('should use default skill level if not specified', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await engine.getBestMove('startpos');
      
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] > setoption name Skill Level value 20');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Timeout Enforcement', () => {
    beforeEach(async () => {
      await engine.init();
    });

    it('should use default timeout', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await engine.getBestMove('startpos');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('timeout=1500'));
      
      consoleSpy.mockRestore();
    });

    it('should use custom timeout', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      await engine.getBestMove('startpos', 20, 2000);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('timeout=2000'));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should report no error initially', () => {
      expect(engine.getLastError()).toBeNull();
    });

    it('should store error on initialization failure', async () => {
      const failingEngine = new ChessEngine();
      
      // Override Worker to throw
      const ThrowingWorker = class {
        constructor() {
          throw new Error('Worker creation failed');
        }
      };
      
      const originalWorker = global.Worker;
      global.Worker = ThrowingWorker as unknown as typeof Worker;
      
      await expect(failingEngine.init()).rejects.toThrow();
      expect(failingEngine.getLastError()).not.toBeNull();
      expect(failingEngine.getStatus()).toBe('error');
      
      global.Worker = originalWorker;
    });
  });

  describe('New Game', () => {
    beforeEach(async () => {
      await engine.init();
    });

    it('should send ucinewgame command', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      engine.newGame();
      
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] > ucinewgame');
      
      consoleSpy.mockRestore();
    });

    it('should not send command if not ready', () => {
      const newEngine = new ChessEngine();
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      newEngine.newGame();
      
      expect(consoleSpy).not.toHaveBeenCalledWith('[ChessEngine] > ucinewgame');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Termination', () => {
    beforeEach(async () => {
      await engine.init();
    });

    it('should send quit command on terminate', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      engine.terminate();
      
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] > quit');
      
      consoleSpy.mockRestore();
    });

    it('should reset status to uninitialized', () => {
      engine.terminate();
      expect(engine.getStatus()).toBe('uninitialized');
      expect(engine.isReady()).toBe(false);
    });

    it('should handle multiple terminate calls', () => {
      engine.terminate();
      expect(() => engine.terminate()).not.toThrow();
    });
  });

  describe('Console Observability', () => {
    beforeEach(async () => {
      await engine.init();
    });

    it('should log initialization messages', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const newEngine = new ChessEngine();
      await newEngine.init();
      
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] Initializing Stockfish...');
      expect(consoleSpy).toHaveBeenCalledWith('[ChessEngine] Engine ready');
      
      consoleSpy.mockRestore();
    });

    it('should log search messages', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await engine.getBestMove('startpos');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Searching for best move'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Best move:'));
      
      consoleSpy.mockRestore();
    });

    it('should log command traffic', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      await engine.getBestMove('startpos');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\[ChessEngine\] > .+/));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\[ChessEngine\] < .+/));
      
      consoleSpy.mockRestore();
    });
  });
});

describe('Global Engine Functions', () => {
  beforeEach(() => {
    disposeChessEngine();
  });

  afterEach(() => {
    disposeChessEngine();
  });

  it('getChessEngine should return singleton', () => {
    const engine1 = getChessEngine();
    const engine2 = getChessEngine();
    expect(engine1).toBe(engine2);
  });

  it('disposeChessEngine should terminate global instance', async () => {
    const engine = getChessEngine();
    await engine.init();
    
    expect(engine.isReady()).toBe(true);
    
    disposeChessEngine();
    
    const newEngine = getChessEngine();
    expect(newEngine).not.toBe(engine);
    expect(newEngine.isReady()).toBe(false);
  });
});
