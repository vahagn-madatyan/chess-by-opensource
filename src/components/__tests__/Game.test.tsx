import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Game } from '../Game';

// Mock the ChessEngine
const mockGetBestMove = vi.fn();
const mockInit = vi.fn().mockResolvedValue(undefined);
const mockIsReady = vi.fn().mockReturnValue(true);
const mockNewGame = vi.fn();

vi.mock('../../engine/ChessEngine', () => ({
  getChessEngine: () => ({
    init: mockInit,
    isReady: mockIsReady,
    getBestMove: mockGetBestMove,
    newGame: mockNewGame,
    getStatus: () => 'ready',
    getLastError: () => null,
  }),
  ChessEngine: class MockChessEngine {
    init = mockInit;
    isReady = mockIsReady;
    getBestMove = mockGetBestMove;
    newGame = mockNewGame;
    getStatus = () => 'ready';
    getLastError = () => null;
  },
}));

describe('Game', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsReady.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the game container', () => {
    render(<Game />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
  });

  it('renders the board', () => {
    render(<Game />);
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
  });

  it('displays turn indicator', () => {
    render(<Game />);
    expect(screen.getByText("White's turn")).toBeInTheDocument();
  });

  it('renders new game button', () => {
    render(<Game />);
    expect(screen.getByTestId('reset-game-btn')).toBeInTheDocument();
  });

  it('renders move history section', () => {
    render(<Game />);
    expect(screen.getByText('Move History')).toBeInTheDocument();
  });

  it('shows "Your turn" when it is player turn', () => {
    render(<Game playerColor="w" />);
    // Check the main status bar (first occurrence)
    const statusElements = screen.getAllByText('Your turn');
    expect(statusElements[0]).toBeInTheDocument();
  });

  it('shows "AI thinking..." when not player turn', () => {
    render(<Game playerColor="b" />);
    // Black to move but player is black, so it should show AI thinking initially
    // Actually with playerColor="b", white starts so AI (white) is thinking
    const statusElements = screen.getAllByText('AI thinking...');
    expect(statusElements[0]).toBeInTheDocument();
  });

  it('clicking new game button resets the game', () => {
    const { getByTestId } = render(<Game />);
    const newGameBtn = getByTestId('reset-game-btn');
    
    // Should not throw when clicking reset
    expect(() => fireEvent.click(newGameBtn)).not.toThrow();
  });

  it('renders with custom engine skill level', () => {
    render(<Game engineSkill={15} />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
  });

  it('renders with custom engine timeout', () => {
    render(<Game engineTimeoutMs={5000} />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
  });

  it('initializes engine on mount', async () => {
    render(<Game />);
    
    await waitFor(() => {
      expect(mockInit).toHaveBeenCalled();
    });
  });
});
