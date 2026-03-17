import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the ChessEngine
vi.mock('./engine/ChessEngine', () => ({
  getChessEngine: () => ({
    init: vi.fn().mockResolvedValue(undefined),
    isReady: vi.fn().mockReturnValue(true),
    getBestMove: vi.fn().mockResolvedValue('e7e5'),
    newGame: vi.fn(),
    getStatus: () => 'ready',
    getLastError: () => null,
  }),
  ChessEngine: class MockChessEngine {
    init = vi.fn().mockResolvedValue(undefined);
    isReady = vi.fn().mockReturnValue(true);
    getBestMove = vi.fn().mockResolvedValue('e7e5');
    newGame = vi.fn();
    getStatus = () => 'ready';
    getLastError = () => null;
  },
}));

describe('App', () => {
  it('renders the game container', () => {
    render(<App />);
    expect(screen.getByTestId('game-container')).toBeInTheDocument();
  });

  it('renders the game board', () => {
    render(<App />);
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
  });

  it('renders the status bar with turn indicator', () => {
    render(<App />);
    expect(screen.getByText(/White's turn|Black's turn/)).toBeInTheDocument();
  });

  it('renders the new game button', () => {
    render(<App />);
    expect(screen.getByTestId('reset-game-btn')).toBeInTheDocument();
  });

  it('renders move history section', () => {
    render(<App />);
    expect(screen.getByText('Move History')).toBeInTheDocument();
  });
});
