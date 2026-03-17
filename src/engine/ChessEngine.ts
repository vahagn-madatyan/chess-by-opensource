import type { EngineStatus, EngineOptions, EngineError, BestMoveResult, SearchParams } from '../types/engine';
import { DEFAULT_ENGINE_OPTIONS } from '../types/engine';

type EngineMessageHandler = (line: string) => void;

/**
 * ChessEngine wraps Stockfish WASM in a Promise-based API.
 * Communicates via UCI protocol over Web Worker.
 */
export class ChessEngine {
  private worker: Worker | null = null;
  private status: EngineStatus = 'uninitialized';
  private options: EngineOptions = { ...DEFAULT_ENGINE_OPTIONS };
  private messageQueue: string[] = [];
  private messageHandlers: EngineMessageHandler[] = [];
  private lastError: EngineError | null = null;
  private initPromise: Promise<void> | null = null;
  private searchResolver: ((result: BestMoveResult) => void) | null = null;
  private searchRejector: ((error: Error) => void) | null = null;
  private searchTimeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * Check if the engine is ready for commands
   */
  isReady(): boolean {
    return this.status === 'ready';
  }

  /**
   * Get the current engine status
   */
  getStatus(): EngineStatus {
    return this.status;
  }

  /**
   * Get the last error that occurred
   */
  getLastError(): EngineError | null {
    return this.lastError;
  }

  /**
   * Initialize the engine. Must be called before using other methods.
   * Safe to call multiple times (returns existing promise if initializing).
   */
  async init(): Promise<void> {
    if (this.status === 'ready') {
      console.log('[ChessEngine] Already initialized');
      return;
    }

    if (this.initPromise) {
      console.log('[ChessEngine] Initialization already in progress');
      return this.initPromise;
    }

    this.initPromise = this.doInit();
    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('[ChessEngine] Initializing Stockfish...');
        this.status = 'initializing';

        // Create worker with Stockfish
        // Use the stockfish.js from the stockfish package
        const stockfishPath = '/stockfish/stockfish.js';
        
        this.worker = new Worker(stockfishPath);

        // Set up message handling
        this.worker.onmessage = (e: MessageEvent) => {
          this.handleMessage(e.data);
        };

        this.worker.onerror = (error) => {
          console.error('[ChessEngine] Worker error:', error);
          this.setError('Worker initialization failed', 'WORKER_ERROR');
          reject(new Error('Stockfish worker failed to initialize'));
        };

        // Wait for uciok response
        const checkReady = (line: string) => {
          if (line === 'uciok') {
            console.log('[ChessEngine] UCI acknowledged');
            // Send isready and wait for readyok
            this.sendCommand('isready');
          } else if (line === 'readyok') {
            console.log('[ChessEngine] Engine ready');
            this.status = 'ready';
            this.removeMessageHandler(checkReady);
            resolve();
          }
        };

        this.addMessageHandler(checkReady);

        // Send UCI initialization command
        this.sendCommand('uci');

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.status !== 'ready') {
            this.setError('Initialization timeout', 'INIT_TIMEOUT');
            reject(new Error('Stockfish initialization timed out'));
          }
        }, 10000);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.setError(message, 'INIT_EXCEPTION');
        reject(error);
      }
    });
  }

  /**
   * Get the best move for a given position
   * @param fen - FEN string or "startpos" for initial position
   * @param skill - Skill level 0-20 (overrides default)
   * @param timeoutMs - Search timeout in milliseconds (overrides default)
   * @returns Promise resolving to best move result
   */
  async getBestMove(
    fen: string,
    skill?: number,
    timeoutMs?: number
  ): Promise<string> {
    if (this.status !== 'ready') {
      throw new Error('Engine not ready. Call init() first.');
    }

    const actualSkill = skill ?? this.options.skillLevel;
    const actualTimeout = timeoutMs ?? this.options.timeoutMs;

    console.log(`[ChessEngine] Searching for best move (skill=${actualSkill}, timeout=${actualTimeout}ms)`);
    this.status = 'searching';

    // Clear any previous search
    if (this.searchTimeoutId) {
      clearTimeout(this.searchTimeoutId);
    }

    return new Promise((resolve, reject) => {
      this.searchResolver = (result: BestMoveResult) => {
        this.status = 'ready';
        resolve(result.move);
      };

      this.searchRejector = (error: Error) => {
        this.status = 'ready';
        reject(error);
      };

      // Set up timeout
      this.searchTimeoutId = setTimeout(() => {
        console.log('[ChessEngine] Search timeout, stopping...');
        this.sendCommand('stop');
      }, actualTimeout);

      // Set skill level
      this.sendCommand(`setoption name Skill Level value ${actualSkill}`);

      // Set position
      const positionCmd = fen === 'startpos' 
        ? 'position startpos' 
        : `position fen ${fen}`;
      this.sendCommand(positionCmd);

      // Start search with movetime (ensures we get result within timeout)
      // Add small buffer to movetime to ensure timeout fires first
      const movetime = Math.max(actualTimeout - 100, 100);
      this.sendCommand(`go movetime ${movetime}`);

      // Set up handler for bestmove response
      const handleSearchResult = (line: string) => {
        if (line.startsWith('bestmove')) {
          const parts = line.split(' ');
          const move = parts[1];
          const ponder = parts[3]; // "ponder" is at index 2, move at index 3

          if (move && move !== '(none)') {
            console.log(`[ChessEngine] Best move: ${move}`);
            
            if (this.searchTimeoutId) {
              clearTimeout(this.searchTimeoutId);
              this.searchTimeoutId = null;
            }

            this.removeMessageHandler(handleSearchResult);
            
            if (this.searchResolver) {
              this.searchResolver({ move, ponder });
              this.searchResolver = null;
              this.searchRejector = null;
            }
          } else {
            // No legal moves (checkmate or stalemate)
            if (this.searchTimeoutId) {
              clearTimeout(this.searchTimeoutId);
              this.searchTimeoutId = null;
            }

            this.removeMessageHandler(handleSearchResult);
            
            if (this.searchRejector) {
              this.searchRejector(new Error('No legal moves available'));
              this.searchRejector = null;
              this.searchResolver = null;
            }
          }
        }
      };

      this.addMessageHandler(handleSearchResult);
    });
  }

  /**
   * Update engine options
   */
  setOptions(options: Partial<EngineOptions>): void {
    this.options = { ...this.options, ...options };
    
    if (this.isReady()) {
      // Apply options immediately if engine is ready
      if (options.skillLevel !== undefined) {
        this.sendCommand(`setoption name Skill Level value ${options.skillLevel}`);
      }
      if (options.threads !== undefined) {
        this.sendCommand(`setoption name Threads value ${options.threads}`);
      }
      if (options.hashSize !== undefined) {
        this.sendCommand(`setoption name Hash value ${options.hashSize}`);
      }
    }
  }

  /**
   * Get current engine options
   */
  getOptions(): EngineOptions {
    return { ...this.options };
  }

  /**
   * Reset the engine for a new game
   */
  newGame(): void {
    if (this.isReady()) {
      this.sendCommand('ucinewgame');
      console.log('[ChessEngine] New game started');
    }
  }

  /**
   * Terminate the engine worker
   */
  terminate(): void {
    if (this.worker) {
      this.sendCommand('quit');
      this.worker.terminate();
      this.worker = null;
    }
    
    if (this.searchTimeoutId) {
      clearTimeout(this.searchTimeoutId);
    }
    
    this.status = 'uninitialized';
    this.initPromise = null;
    this.messageHandlers = [];
    console.log('[ChessEngine] Engine terminated');
  }

  private sendCommand(command: string): void {
    if (!this.worker) {
      console.warn('[ChessEngine] Cannot send command, worker not initialized');
      return;
    }
    
    console.log(`[ChessEngine] > ${command}`);
    this.worker.postMessage(command);
  }

  private handleMessage(data: string): void {
    const lines = data.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      console.log(`[ChessEngine] < ${line}`);
      
      // Notify all handlers
      for (const handler of this.messageHandlers) {
        handler(line);
      }
    }
  }

  private addMessageHandler(handler: EngineMessageHandler): void {
    this.messageHandlers.push(handler);
  }

  private removeMessageHandler(handler: EngineMessageHandler): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index !== -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  private setError(message: string, code?: string): void {
    this.status = 'error';
    this.lastError = {
      message,
      code,
      timestamp: Date.now(),
    };
    console.error(`[ChessEngine] Error: ${message}`, code);
  }
}

// Singleton instance for app-wide use
let globalEngine: ChessEngine | null = null;

/**
 * Get or create the global chess engine instance
 */
export function getChessEngine(): ChessEngine {
  if (!globalEngine) {
    globalEngine = new ChessEngine();
  }
  return globalEngine;
}

/**
 * Dispose the global chess engine instance
 */
export function disposeChessEngine(): void {
  if (globalEngine) {
    globalEngine.terminate();
    globalEngine = null;
  }
}
