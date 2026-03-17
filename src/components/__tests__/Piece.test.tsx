import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Piece } from '../Piece';

describe('Piece', () => {
  it('renders white king correctly', () => {
    render(<Piece type="king" color="white" />);
    expect(screen.getByLabelText('white king')).toBeInTheDocument();
  });

  it('renders black king correctly', () => {
    render(<Piece type="king" color="black" />);
    expect(screen.getByLabelText('black king')).toBeInTheDocument();
  });

  it('renders white queen correctly', () => {
    render(<Piece type="queen" color="white" />);
    expect(screen.getByLabelText('white queen')).toBeInTheDocument();
  });

  it('renders black queen correctly', () => {
    render(<Piece type="queen" color="black" />);
    expect(screen.getByLabelText('black queen')).toBeInTheDocument();
  });

  it('renders white rook correctly', () => {
    render(<Piece type="rook" color="white" />);
    expect(screen.getByLabelText('white rook')).toBeInTheDocument();
  });

  it('renders black rook correctly', () => {
    render(<Piece type="rook" color="black" />);
    expect(screen.getByLabelText('black rook')).toBeInTheDocument();
  });

  it('renders white bishop correctly', () => {
    render(<Piece type="bishop" color="white" />);
    expect(screen.getByLabelText('white bishop')).toBeInTheDocument();
  });

  it('renders black bishop correctly', () => {
    render(<Piece type="bishop" color="black" />);
    expect(screen.getByLabelText('black bishop')).toBeInTheDocument();
  });

  it('renders white knight correctly', () => {
    render(<Piece type="knight" color="white" />);
    expect(screen.getByLabelText('white knight')).toBeInTheDocument();
  });

  it('renders black knight correctly', () => {
    render(<Piece type="knight" color="black" />);
    expect(screen.getByLabelText('black knight')).toBeInTheDocument();
  });

  it('renders white pawn correctly', () => {
    render(<Piece type="pawn" color="white" />);
    expect(screen.getByLabelText('white pawn')).toBeInTheDocument();
  });

  it('renders black pawn correctly', () => {
    render(<Piece type="pawn" color="black" />);
    expect(screen.getByLabelText('black pawn')).toBeInTheDocument();
  });

  it('scales to fit container with w-full h-full classes', () => {
    const { container } = render(<Piece type="king" color="white" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('w-full h-full');
  });
});
