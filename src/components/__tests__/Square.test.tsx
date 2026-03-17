import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Square } from '../Square';

describe('Square', () => {
  it('renders light square with correct background color', () => {
    render(
      <Square
        square="e4"
        piece={null}
        isLight={true}
        isSelected={false}
        onClick={() => {}}
      />
    );
    const button = screen.getByLabelText('Square e4');
    expect(button).toHaveClass('bg-amber-200');
  });

  it('renders dark square with correct background color', () => {
    render(
      <Square
        square="d5"
        piece={null}
        isLight={false}
        isSelected={false}
        onClick={() => {}}
      />
    );
    const button = screen.getByLabelText('Square d5');
    expect(button).toHaveClass('bg-amber-700');
  });

  it('shows selection highlight when selected', () => {
    render(
      <Square
        square="e4"
        piece={null}
        isLight={true}
        isSelected={true}
        onClick={() => {}}
      />
    );
    const button = screen.getByLabelText('Square e4 selected');
    expect(button).toHaveClass('ring-4 ring-blue-400 ring-inset');
  });

  it('does not show selection highlight when not selected', () => {
    render(
      <Square
        square="e4"
        piece={null}
        isLight={true}
        isSelected={false}
        onClick={() => {}}
      />
    );
    const button = screen.getByLabelText('Square e4');
    expect(button).not.toHaveClass('ring-4 ring-blue-400 ring-inset');
  });

  it('renders empty square without errors', () => {
    render(
      <Square
        square="e4"
        piece={null}
        isLight={true}
        isSelected={false}
        onClick={() => {}}
      />
    );
    expect(screen.getByLabelText('Square e4')).toBeInTheDocument();
  });

  it('renders square with white piece', () => {
    render(
      <Square
        square="e4"
        piece={{ type: 'pawn', color: 'white' }}
        isLight={true}
        isSelected={false}
        onClick={() => {}}
      />
    );
    expect(screen.getByLabelText('Square e4 with white pawn')).toBeInTheDocument();
  });

  it('renders square with black piece', () => {
    render(
      <Square
        square="e8"
        piece={{ type: 'king', color: 'black' }}
        isLight={false}
        isSelected={false}
        onClick={() => {}}
      />
    );
    expect(screen.getByLabelText('Square e8 with black king')).toBeInTheDocument();
  });

  it('fires click handler with correct square notation', () => {
    const handleClick = vi.fn();
    render(
      <Square
        square="e4"
        piece={null}
        isLight={true}
        isSelected={false}
        onClick={handleClick}
      />
    );
    const button = screen.getByLabelText('Square e4');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledWith('e4');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has correct data attributes', () => {
    render(
      <Square
        square="h8"
        piece={{ type: 'rook', color: 'black' }}
        isLight={false}
        isSelected={true}
        onClick={() => {}}
      />
    );
    const button = screen.getByLabelText('Square h8 with black rook selected');
    expect(button).toHaveAttribute('data-square', 'h8');
    expect(button).toHaveAttribute('data-selected', 'true');
  });
});
