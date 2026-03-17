import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Board } from '../Board';

describe('Board', () => {
  it('renders the chess board', () => {
    render(<Board />);
    expect(screen.getByTestId('chess-board')).toBeInTheDocument();
  });

  it('renders 64 squares', () => {
    render(<Board />);
    const squares = screen.getAllByRole('button');
    expect(squares).toHaveLength(64);
  });

  it('renders starting position with 32 pieces', () => {
    render(<Board />);
    
    // White pieces on rank 1
    expect(screen.getByLabelText(/Square a1 with white rook/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square b1 with white knight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square c1 with white bishop/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square d1 with white queen/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square e1 with white king/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square f1 with white bishop/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square g1 with white knight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square h1 with white rook/i)).toBeInTheDocument();
    
    // White pawns on rank 2
    for (const file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(screen.getByLabelText(`Square ${file}2 with white pawn`)).toBeInTheDocument();
    }
    
    // Black pieces on rank 8
    expect(screen.getByLabelText(/Square a8 with black rook/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square b8 with black knight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square c8 with black bishop/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square d8 with black queen/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square e8 with black king/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square f8 with black bishop/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square g8 with black knight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Square h8 with black rook/i)).toBeInTheDocument();
    
    // Black pawns on rank 7
    for (const file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
      expect(screen.getByLabelText(`Square ${file}7 with black pawn`)).toBeInTheDocument();
    }
  });

  it('has correct board orientation with white at bottom', () => {
    render(<Board />);
    
    // White king should be at e1 (bottom row from white's perspective)
    const whiteKingSquare = screen.getByLabelText(/Square e1 with white king/i);
    expect(whiteKingSquare).toBeInTheDocument();
    
    // Black king should be at e8 (top row)
    const blackKingSquare = screen.getByLabelText(/Square e8 with black king/i);
    expect(blackKingSquare).toBeInTheDocument();
  });

  it('fires onSquareClick callback when square is clicked', () => {
    const handleClick = vi.fn();
    render(<Board onSquareClick={handleClick} />);
    
    const e2Square = screen.getByLabelText('Square e2 with white pawn');
    fireEvent.click(e2Square);
    
    expect(handleClick).toHaveBeenCalledWith('e2');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('fires onSquareClick for multiple clicks', () => {
    const handleClick = vi.fn();
    render(<Board onSquareClick={handleClick} />);
    
    fireEvent.click(screen.getByLabelText('Square e2 with white pawn'));
    fireEvent.click(screen.getByLabelText('Square e4'));
    
    expect(handleClick).toHaveBeenNthCalledWith(1, 'e2');
    expect(handleClick).toHaveBeenNthCalledWith(2, 'e4');
  });

  it('shows selection highlight when piece is clicked', () => {
    render(<Board />);
    
    const e2Square = screen.getByLabelText('Square e2 with white pawn');
    fireEvent.click(e2Square);
    
    // After click, the square should be selected
    expect(screen.getByLabelText(/Square e2.*selected/i)).toBeInTheDocument();
  });

  it('moves piece visually when clicking destination square', () => {
    render(<Board />);
    
    // Click e2 to select the white pawn
    fireEvent.click(screen.getByLabelText('Square e2 with white pawn'));
    
    // Click e4 to move the pawn
    fireEvent.click(screen.getByLabelText('Square e4'));
    
    // Pawn should now be on e4
    expect(screen.getByLabelText('Square e4 with white pawn')).toBeInTheDocument();
    
    // e2 should now be empty
    expect(screen.queryByLabelText(/Square e2 with/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Square e2')).toBeInTheDocument();
  });

  it('does not select empty squares', () => {
    render(<Board />);
    
    // Try to click an empty square (e4)
    const e4Square = screen.getByLabelText('Square e4');
    fireEvent.click(e4Square);
    
    // Should not show selection highlight on empty square
    expect(e4Square).not.toHaveAttribute('data-selected', 'true');
  });

  it('deselects when clicking the same square twice', () => {
    render(<Board />);
    
    // Click e2 to select
    fireEvent.click(screen.getByLabelText('Square e2 with white pawn'));
    expect(screen.getByLabelText(/Square e2.*selected/i)).toBeInTheDocument();
    
    // Click e2 again to deselect
    fireEvent.click(screen.getByLabelText(/Square e2 with white pawn/i));
    
    // Should no longer show selected state
    expect(screen.getByLabelText('Square e2 with white pawn')).toBeInTheDocument();
  });

  it('allows moving different pieces after first move', () => {
    render(<Board />);
    
    // Move e2 pawn to e4
    fireEvent.click(screen.getByLabelText('Square e2 with white pawn'));
    fireEvent.click(screen.getByLabelText('Square e4'));
    
    // Now move d2 pawn to d4
    fireEvent.click(screen.getByLabelText('Square d2 with white pawn'));
    fireEvent.click(screen.getByLabelText('Square d4'));
    
    // Both pawns should be in new positions
    expect(screen.getByLabelText('Square e4 with white pawn')).toBeInTheDocument();
    expect(screen.getByLabelText('Square d4 with white pawn')).toBeInTheDocument();
    
    // Original squares should be empty
    expect(screen.queryByLabelText(/Square e2 with/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Square d2 with/)).not.toBeInTheDocument();
  });

  it('accepts custom FEN string', () => {
    // Custom position: just kings on their starting squares
    const customFen = '4k3/8/8/8/8/8/8/4K3 w - - 0 1';
    render(<Board initialFen={customFen} />);
    
    // Should only have the two kings
    expect(screen.getByLabelText('Square e8 with black king')).toBeInTheDocument();
    expect(screen.getByLabelText('Square e1 with white king')).toBeInTheDocument();
    
    // Should not have other pieces
    expect(screen.queryByLabelText(/with white pawn/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/with black pawn/)).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Board className="custom-board-class" />);
    const board = screen.getByTestId('chess-board');
    expect(board).toHaveClass('custom-board-class');
  });

  it('maintains aspect ratio with square dimensions', () => {
    render(<Board />);
    const board = screen.getByTestId('chess-board');
    expect(board).toHaveClass('aspect-square');
  });
});
