import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameOverModal } from '../GameOverModal';

describe('GameOverModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(
      <GameOverModal 
        isOpen={false} 
        result="win" 
        reason="Checkmate" 
        onNewGame={() => {}} 
      />
    );
    
    expect(screen.queryByTestId('game-over-modal')).not.toBeInTheDocument();
  });

  it('renders win state correctly', () => {
    render(
      <GameOverModal 
        isOpen={true} 
        result="win" 
        reason="Checkmate" 
        onNewGame={() => {}} 
      />
    );
    
    expect(screen.getByTestId('game-over-modal')).toBeInTheDocument();
    expect(screen.getByText('Victory!')).toBeInTheDocument();
    expect(screen.getByText('Checkmate')).toBeInTheDocument();
  });

  it('renders loss state correctly', () => {
    render(
      <GameOverModal 
        isOpen={true} 
        result="loss" 
        reason="Checkmate" 
        onNewGame={() => {}} 
      />
    );
    
    expect(screen.getByText('Defeat')).toBeInTheDocument();
  });

  it('renders draw state correctly', () => {
    render(
      <GameOverModal 
        isOpen={true} 
        result="draw" 
        reason="Stalemate" 
        onNewGame={() => {}} 
      />
    );
    
    expect(screen.getByText('Draw')).toBeInTheDocument();
    expect(screen.getByText('Stalemate')).toBeInTheDocument();
  });

  it('renders nothing when result is null', () => {
    render(
      <GameOverModal 
        isOpen={true} 
        result={null} 
        reason="" 
        onNewGame={() => {}} 
      />
    );
    
    expect(screen.queryByTestId('game-over-modal')).not.toBeInTheDocument();
  });

  it('calls onNewGame when new game button is clicked', () => {
    const onNewGame = vi.fn();
    render(
      <GameOverModal 
        isOpen={true} 
        result="win" 
        reason="Checkmate" 
        onNewGame={onNewGame} 
      />
    );
    
    fireEvent.click(screen.getByTestId('new-game-button'));
    expect(onNewGame).toHaveBeenCalledTimes(1);
  });

  it('has dialog role and accessibility attributes', () => {
    render(
      <GameOverModal 
        isOpen={true} 
        result="win" 
        reason="Checkmate" 
        onNewGame={() => {}} 
      />
    );
    
    const modal = screen.getByTestId('game-over-modal');
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  it('displays correct description for win', () => {
    render(
      <GameOverModal 
        isOpen={true} 
        result="win" 
        reason="Checkmate" 
        onNewGame={() => {}} 
      />
    );
    
    expect(screen.getByText('Congratulations! You played a great game.')).toBeInTheDocument();
  });

  it('displays correct description for stalemate draw', () => {
    render(
      <GameOverModal 
        isOpen={true} 
        result="draw" 
        reason="Stalemate" 
        onNewGame={() => {}} 
      />
    );
    
    expect(screen.getByText(/The game ended in a stalemate/)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <GameOverModal 
        isOpen={true} 
        result="win" 
        reason="Checkmate" 
        onNewGame={() => {}} 
        className="custom-class"
      />
    );
    
    expect(screen.getByTestId('game-over-modal')).toHaveClass('custom-class');
  });
});
