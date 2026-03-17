import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MoveHistory } from '../MoveHistory';
import type { MoveHistory as MoveHistoryType } from '../../types/game';

describe('MoveHistory', () => {
  it('renders empty state when no moves', () => {
    render(<MoveHistory moves={[]} />);
    
    expect(screen.getByTestId('move-history')).toBeInTheDocument();
    expect(screen.getByText('No moves yet')).toBeInTheDocument();
  });

  it('renders move pairs correctly', () => {
    const moves: MoveHistoryType[] = [
      { notation: 'e4', piece: 'P', from: 'e2', to: 'e4' },
      { notation: 'e5', piece: 'p', from: 'e7', to: 'e5' },
      { notation: 'Nf3', piece: 'N', from: 'g1', to: 'f3' },
      { notation: 'Nc6', piece: 'n', from: 'b8', to: 'c6' },
    ];
    
    render(<MoveHistory moves={moves} />);
    
    expect(screen.getByTestId('move-pair-1')).toBeInTheDocument();
    expect(screen.getByTestId('move-pair-2')).toBeInTheDocument();
    
    expect(screen.getByTestId('move-white-1')).toHaveTextContent('e4');
    expect(screen.getByTestId('move-black-1')).toHaveTextContent('e5');
    expect(screen.getByTestId('move-white-2')).toHaveTextContent('Nf3');
    expect(screen.getByTestId('move-black-2')).toHaveTextContent('Nc6');
  });

  it('handles odd number of moves (black has not moved yet)', () => {
    const moves: MoveHistoryType[] = [
      { notation: 'e4', piece: 'P', from: 'e2', to: 'e4' },
    ];
    
    render(<MoveHistory moves={moves} />);
    
    expect(screen.getByTestId('move-white-1')).toHaveTextContent('e4');
    expect(screen.getByTestId('move-black-1')).toHaveTextContent('');
  });

  it('displays move numbers', () => {
    const moves: MoveHistoryType[] = [
      { notation: 'e4', piece: 'P', from: 'e2', to: 'e4' },
      { notation: 'e5', piece: 'p', from: 'e7', to: 'e5' },
    ];
    
    render(<MoveHistory moves={moves} />);
    
    expect(screen.getByText('1.')).toBeInTheDocument();
  });

  it('has scrollable container', () => {
    render(<MoveHistory moves={[]} />);
    
    expect(screen.getByTestId('move-history-scroll')).toHaveClass('overflow-y-auto');
  });

  it('applies custom className', () => {
    render(<MoveHistory moves={[]} className="custom-class" />);
    
    expect(screen.getByTestId('move-history')).toHaveClass('custom-class');
  });

  it('displays heading', () => {
    render(<MoveHistory moves={[]} />);
    
    expect(screen.getByText('Move History')).toBeInTheDocument();
  });
});
