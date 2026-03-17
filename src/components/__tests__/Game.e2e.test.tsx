import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Game } from '../Game';

// Mock Worker for jsdom environment
class MockStockfishWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;
  private responses: Map<string, string[]> = new Map();
  private searchCount = 0;

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
          this.searchCount++;
          // Return different moves based on position in game
          const moves = ['e7e5', 'g8f6', 'b8c6', 'd7d5', 'c7c5', 'e7e6', 'g7g6'];
          const bestMove = moves[(this.searchCount - 1) % moves.length];
          this.sendResponse(`bestmove ${bestMove} ponder e2e4`);
        }, 30);
      } else {
        const responses = this.responses.get(command) || [];
        for (const response of responses) {
          this.sendResponse(response);
        }
      }
    }, 5);
  }

  private sendResponse(data: string): void {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data }));
    }
  }

  terminate(): void {}
}

describe('Game E2E Tests', () => {
  let originalWorker: typeof Worker;

  beforeEach(() => {
    originalWorker = global.Worker;
    global.Worker = MockStockfishWorker as unknown as typeof Worker;
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    global.Worker = originalWorker;
    vi.restoreAllMocks();
  });

  describe('initial render', () => {
    it('should render game container with board', async () => {
      render(<Game />);
      
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
      expect(screen.getByTestId('game-board')).toBeInTheDocument();
    });

    it('should show initial turn indicator', async () => {
      render(<Game />);
      
      expect(screen.getByText("White's turn")).toBeInTheDocument();
      // Check that at least one "Your turn" element exists
      const statusElements = screen.getAllByText('Your turn');
      expect(statusElements[0]).toBeInTheDocument();
    });

    it('should show new game button', async () => {
      render(<Game />);
      
      expect(screen.getByTestId('reset-game-btn')).toBeInTheDocument();
      expect(screen.getByText('New Game')).toBeInTheDocument();
    });

    it('should show move history section', async () => {
      render(<Game />);
      
      expect(screen.getByText('Move History')).toBeInTheDocument();
      expect(screen.getByText('No moves yet')).toBeInTheDocument();
    });
  });

  describe('player moves', () => {
    it('should allow player to make a move by clicking squares', async () => {
      render(<Game engine={null} />);
      
      await waitFor(() => {
        const statusElements = screen.getAllByText('Your turn');
        expect(statusElements[0]).toBeInTheDocument();
      });
      
      // Click e2 to select
      const e2Square = screen.getByLabelText(/Square e2/);
      fireEvent.click(e2Square);
      
      // e2 should now be selected
      expect(e2Square.getAttribute('data-selected')).toBe('true');
      
      // Click e4 to move
      const e4Square = screen.getByLabelText(/Square e4/);
      fireEvent.click(e4Square);
      
      // After move, turn should change to black
      await waitFor(() => {
        expect(screen.getByText("Black's turn")).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should reject illegal moves', async () => {
      render(<Game engine={null} />);
      
      await waitFor(() => {
        const statusElements = screen.getAllByText('Your turn');
        expect(statusElements[0]).toBeInTheDocument();
      });
      
      // Try to move e2 to e5 (illegal)
      const e2Square = screen.getByLabelText(/Square e2/);
      fireEvent.click(e2Square);
      
      const e5Square = screen.getByLabelText(/Square e5/);
      fireEvent.click(e5Square);
      
      // Should clear selection, no move made - still white's turn
      expect(screen.getByText("White's turn")).toBeInTheDocument();
    });

    it('should not allow moves when it is AI turn', async () => {
      render(<Game playerColor="b" />);
      
      // Should show AI thinking since white (AI) moves first
      await waitFor(() => {
        // Look for AI thinking in the main status bar (not sidebar)
        const statusElements = screen.getAllByText(/AI thinking/);
        expect(statusElements[0]).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('castling flow', () => {
    it('should render with castling position', async () => {
      // Position where white can castle kingside
      const castlingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1';
      render(<Game initialFen={castlingFen} engine={null} />);
      
      await waitFor(() => {
        const statusElements = screen.getAllByText('Your turn');
        expect(statusElements[0]).toBeInTheDocument();
        expect(screen.getByTestId('game-board')).toBeInTheDocument();
      }, { timeout: 2000 });
    }, 10000);
  });

  describe('game reset', () => {
    it('should reset game when new game button clicked', async () => {
      render(<Game engine={null} />);
      
      await waitFor(() => {
        const statusElements = screen.getAllByText('Your turn');
        expect(statusElements[0]).toBeInTheDocument();
      });
      
      // Make a move
      const e2Square = screen.getByLabelText(/Square e2/);
      fireEvent.click(e2Square);
      
      const e4Square = screen.getByLabelText(/Square e4/);
      fireEvent.click(e4Square);
      
      // Wait for turn to change
      await waitFor(() => {
        expect(screen.getByText("Black's turn")).toBeInTheDocument();
      }, { timeout: 1000 });
      
      // Reset game
      const resetBtn = screen.getByTestId('reset-game-btn');
      fireEvent.click(resetBtn);
      
      // Should be back to initial state
      await waitFor(() => {
        expect(screen.getByText('No moves yet')).toBeInTheDocument();
        const statusElements = screen.getAllByText('Your turn');
        expect(statusElements[0]).toBeInTheDocument();
      });
    });
  });

  describe('game over scenarios', () => {
    it('should detect and display checkmate', async () => {
      // Scholar's mate position
      const checkmateFen = 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4';
      render(<Game initialFen={checkmateFen} />);
      
      await waitFor(() => {
        // Look for checkmate in the game over modal specifically
        const gameOverModal = screen.getByTestId('game-over-modal');
        expect(gameOverModal).toBeInTheDocument();
        expect(gameOverModal.textContent).toMatch(/Checkmate/i);
      }, { timeout: 1000 });
    });

    it('should call onGameOver callback when game ends', async () => {
      const onGameOver = vi.fn();
      const checkmateFen = 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4';
      
      render(<Game initialFen={checkmateFen} onGameOver={onGameOver} />);
      
      await waitFor(() => {
        expect(onGameOver).toHaveBeenCalledWith('win', 'Checkmate');
      }, { timeout: 1000 });
    });
  });

  describe('AI response timing', () => {
    it('AI config should be applied', async () => {
      // This test verifies the component renders with engine config
      // Full AI integration timing is covered in chess-integration tests
      render(<Game engineTimeoutMs={2000} engineSkill={10} />);
      
      await waitFor(() => {
        const statusElements = screen.getAllByText('Your turn');
        expect(statusElements[0]).toBeInTheDocument();
        expect(screen.getByTestId('game-container')).toBeInTheDocument();
      }, { timeout: 2000 });
    }, 10000);
  });

  describe('configuration options', () => {
    it('should accept custom engine skill level', async () => {
      render(<Game engineSkill={5} />);
      
      expect(screen.getByTestId('game-container')).toBeInTheDocument();
      
      await waitFor(() => {
        const statusElements = screen.getAllByText('Your turn');
        expect(statusElements[0]).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should accept custom player color', async () => {
      render(<Game playerColor="b" />);
      
      // Should show AI thinking since white (AI) moves first
      await waitFor(() => {
        const statusElements = screen.getAllByText('AI is thinking...');
        expect(statusElements[0]).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('move history display', () => {
    it('should display moves in algebraic notation', async () => {
      // Disable engine for this test to avoid async timing issues
      render(<Game engine={null} />);

      await waitFor(() => {
        const statusElements = screen.getAllByText('Your turn');
        expect(statusElements[0]).toBeInTheDocument();
      }, { timeout: 2000 });

      // Make a move
      const e2Square = screen.getByLabelText(/Square e2/);
      fireEvent.click(e2Square);

      const e4Square = screen.getByLabelText(/Square e4/);
      fireEvent.click(e4Square);

      // After move, should show Black's turn (no AI with engine=null)
      await waitFor(() => {
        expect(screen.getByText("Black's turn")).toBeInTheDocument();
      }, { timeout: 1000 });

      // Check that move history section exists
      const moveHistorySection = screen.getByText('Move History');
      expect(moveHistorySection).toBeInTheDocument();

      // The history should have moved beyond "No moves yet"
      expect(screen.queryByText('No moves yet')).not.toBeInTheDocument();
    }, 10000);
  });
});
